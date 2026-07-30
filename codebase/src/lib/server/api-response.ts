const NO_STORE_HEADER = "no-store";
const RATE_LIMIT_BUCKET_CAP = 2_048;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 30_000;

interface RateLimitBucket {
  requests: number;
  cost: number;
  expiresAt: number;
  lastSeenAt: number;
}

export interface InMemoryRateLimitPolicy {
  id: string;
  windowMs: number;
  maxRequests: number;
  maxCost: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();
let nextRateLimitCleanupAt = 0;

export class SafeApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SafeApiError";
  }
}

interface FallbackApiError {
  status: number;
  code: string;
  message: string;
}

function withNoStore(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set("Cache-Control", NO_STORE_HEADER);
  return result;
}

export function jsonResponse<T>(body: T, init: ResponseInit = {}): Response {
  return Response.json(body, {
    ...init,
    headers: withNoStore(init.headers),
  });
}

export function apiErrorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return jsonResponse({ error: message, code }, { status });
}

function errorStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" && Number.isInteger(status) ? status : null;
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "TimeoutError" ||
    error.name === "APIConnectionTimeoutError" ||
    error.message.toLowerCase().includes("timed out")
  );
}

/**
 * Convert internal and OpenAI errors into a small, stable response. Deliberately
 * never returns an upstream message, request body, transcript, or stack trace.
 */
export function safeApiErrorResponse(
  error: unknown,
  fallback: FallbackApiError,
): Response {
  if (error instanceof SafeApiError) {
    return apiErrorResponse(error.status, error.code, error.message);
  }

  if (isTimeoutError(error)) {
    return apiErrorResponse(
      504,
      "OPENAI_TIMEOUT",
      "Dịch vụ AI phản hồi quá thời gian cho phép. Vui lòng thử lại.",
    );
  }

  const status = errorStatus(error);
  if (status === 429) {
    return apiErrorResponse(
      429,
      "OPENAI_RATE_LIMITED",
      "Dịch vụ AI đang bận. Vui lòng thử lại sau ít phút.",
    );
  }
  if (status === 401 || status === 403) {
    return apiErrorResponse(
      503,
      "OPENAI_UNAVAILABLE",
      "Dịch vụ AI chưa sẵn sàng. Vui lòng liên hệ người vận hành.",
    );
  }
  if (status !== null && status >= 500) {
    return apiErrorResponse(
      502,
      "OPENAI_UPSTREAM_ERROR",
      "Dịch vụ AI tạm thời không phản hồi. Vui lòng thử lại.",
    );
  }

  return apiErrorResponse(fallback.status, fallback.code, fallback.message);
}

export function assertDeclaredBodySize(request: Request, maxBytes: number): void {
  const rawLength = request.headers.get("content-length");
  if (rawLength === null) return;

  const length = Number(rawLength);
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new SafeApiError(400, "INVALID_CONTENT_LENGTH", "Kích thước request không hợp lệ.");
  }
  if (length > maxBytes) {
    throw new SafeApiError(413, "REQUEST_TOO_LARGE", "Request vượt quá kích thước cho phép.");
  }
}

/**
 * Reject browser requests which explicitly came from another site or provide
 * an Origin that does not match this Route Handler's public request origin.
 * Missing browser metadata remains allowed for non-browser clients and tests.
 */
export function assertSameOriginRequest(request: Request): void {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite === "cross-site") {
    throw new SafeApiError(403, "CROSS_SITE_REQUEST", "Yêu cầu không được phép.");
  }

  const suppliedOrigin = request.headers.get("origin")?.trim();
  if (!suppliedOrigin) return;

  let requestOrigin: string;
  let normalizedSuppliedOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
    normalizedSuppliedOrigin = new URL(suppliedOrigin).origin;
  } catch {
    throw new SafeApiError(403, "INVALID_ORIGIN", "Yêu cầu không được phép.");
  }

  if (normalizedSuppliedOrigin !== requestOrigin) {
    throw new SafeApiError(403, "ORIGIN_MISMATCH", "Yêu cầu không được phép.");
  }
}

function clientAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  const address =
    forwardedFor ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown";
  return address.slice(0, 64);
}

function cleanupRateLimitBuckets(now: number, incomingKey: string): void {
  if (now >= nextRateLimitCleanupAt || rateLimitBuckets.size >= RATE_LIMIT_BUCKET_CAP) {
    for (const [key, bucket] of rateLimitBuckets) {
      if (bucket.expiresAt <= now) rateLimitBuckets.delete(key);
    }
    nextRateLimitCleanupAt = now + RATE_LIMIT_CLEANUP_INTERVAL_MS;
  }

  if (rateLimitBuckets.has(incomingKey) || rateLimitBuckets.size < RATE_LIMIT_BUCKET_CAP) {
    return;
  }

  let oldestKey: string | null = null;
  let oldestSeenAt = Number.POSITIVE_INFINITY;
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.lastSeenAt < oldestSeenAt) {
      oldestSeenAt = bucket.lastSeenAt;
      oldestKey = key;
    }
  }
  if (oldestKey !== null) rateLimitBuckets.delete(oldestKey);
}

/**
 * Best-effort limiter for one warm server instance. It bounds both request
 * count and caller-provided cost, and keeps its process-local Map bounded.
 */
export function enforceInMemoryRateLimit(
  request: Request,
  policy: InMemoryRateLimitPolicy,
  rawCost = 1,
): void {
  const now = Date.now();
  const key = `${policy.id}:${clientAddress(request)}`;
  const cost = Number.isFinite(rawCost) ? Math.max(1, Math.ceil(rawCost)) : 1;
  cleanupRateLimitBuckets(now, key);

  let bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.expiresAt <= now) {
    bucket = {
      requests: 0,
      cost: 0,
      expiresAt: now + policy.windowMs,
      lastSeenAt: now,
    };
    rateLimitBuckets.set(key, bucket);
  }

  bucket.lastSeenAt = now;
  if (bucket.requests + 1 > policy.maxRequests || bucket.cost + cost > policy.maxCost) {
    throw new SafeApiError(
      429,
      "RATE_LIMITED",
      "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
    );
  }

  bucket.requests += 1;
  bucket.cost += cost;
}

/** Read a request stream without allowing an unbounded allocation. */
export async function readBodyBytes(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer>> {
  assertDeclaredBodySize(request, maxBytes);
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        await reader.cancel();
        throw new SafeApiError(413, "REQUEST_TOO_LARGE", "Request vượt quá kích thước cho phép.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(bytesRead);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/** Read a request stream without allowing an unbounded text allocation. */
export async function readTextBody(request: Request, maxBytes: number): Promise<string> {
  return new TextDecoder().decode(await readBodyBytes(request, maxBytes));
}

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  return (await readJsonBodyWithSize(request, maxBytes)).value;
}

export async function readJsonBodyWithSize(
  request: Request,
  maxBytes: number,
): Promise<{ value: unknown; byteLength: number }> {
  const bytes = await readBodyBytes(request, maxBytes);
  const text = new TextDecoder().decode(bytes);
  if (!text.trim()) {
    throw new SafeApiError(400, "EMPTY_REQUEST", "Request body không được để trống.");
  }

  try {
    return { value: JSON.parse(text) as unknown, byteLength: bytes.byteLength };
  } catch {
    throw new SafeApiError(400, "INVALID_JSON", "Request body phải là JSON hợp lệ.");
  }
}

export function requestSignalWithTimeout(request: Request, timeoutMs: number): AbortSignal {
  return AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
}
