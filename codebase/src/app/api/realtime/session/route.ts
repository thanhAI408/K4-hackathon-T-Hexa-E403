import {
  REALTIME_TRANSCRIPTION_MODEL,
  TRANSCRIPTION_KEYWORDS,
  TRANSCRIPTION_LANGUAGES,
  TRANSCRIPTION_PROMPT,
  requireOpenAIApiKey,
} from "@/lib/server/openai";
import {
  SafeApiError,
  assertSameOriginRequest,
  enforceInMemoryRateLimit,
  readTextBody,
  requestSignalWithTimeout,
  safeApiErrorResponse,
} from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SDP_BYTES = 128 * 1024;
const SESSION_TIMEOUT_MS = 12_000;
const REALTIME_RATE_LIMIT = {
  id: "realtime-session",
  windowMs: 60_000,
  maxRequests: 12,
  maxCost: 12,
} as const;

const sessionConfig = {
  type: "transcription",
  audio: {
    input: {
      noise_reduction: { type: "far_field" },
      transcription: {
        model: REALTIME_TRANSCRIPTION_MODEL,
        prompt: TRANSCRIPTION_PROMPT,
        keywords: [...TRANSCRIPTION_KEYWORDS],
        languages: [...TRANSCRIPTION_LANGUAGES],
      },
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
    },
  },
} as const;

function realtimeUpstreamError(status: number): SafeApiError {
  if (status === 429) {
    return new SafeApiError(
      429,
      "REALTIME_RATE_LIMITED",
      "Dịch vụ Realtime đang bận. Ứng dụng sẽ chuyển sang near real-time.",
    );
  }
  if (status === 401 || status === 403) {
    return new SafeApiError(
      503,
      "REALTIME_UNAVAILABLE",
      "Dịch vụ Realtime chưa sẵn sàng. Ứng dụng sẽ chuyển sang near real-time.",
    );
  }
  return new SafeApiError(
    502,
    "REALTIME_SESSION_FAILED",
    "Không thể bắt đầu Realtime. Ứng dụng sẽ chuyển sang near real-time.",
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOriginRequest(request);
    enforceInMemoryRateLimit(request, REALTIME_RATE_LIMIT);

    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("application/sdp")) {
      throw new SafeApiError(
        415,
        "INVALID_CONTENT_TYPE",
        "Realtime session yêu cầu một SDP offer.",
      );
    }

    const offerSdp = await readTextBody(request, MAX_SDP_BYTES);
    if (!offerSdp.trim().startsWith("v=0")) {
      throw new SafeApiError(400, "INVALID_SDP", "SDP offer không hợp lệ.");
    }
    const apiKey = requireOpenAIApiKey();

    const form = new FormData();
    form.set("sdp", offerSdp);
    form.set("session", JSON.stringify(sessionConfig));

    const upstream = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
      cache: "no-store",
      signal: requestSignalWithTimeout(request, SESSION_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      // Do not read or expose the upstream error body: it can contain request details.
      throw realtimeUpstreamError(upstream.status);
    }

    const answerSdp = await upstream.text();
    if (
      !answerSdp.trim().startsWith("v=0") ||
      new TextEncoder().encode(answerSdp).byteLength > MAX_SDP_BYTES
    ) {
      throw new SafeApiError(
        502,
        "INVALID_SDP_ANSWER",
        "Dịch vụ Realtime trả về SDP answer không hợp lệ.",
      );
    }

    return new Response(answerSdp, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return safeApiErrorResponse(error, {
      status: 502,
      code: "REALTIME_SESSION_FAILED",
      message: "Không thể bắt đầu Realtime. Ứng dụng sẽ chuyển sang near real-time.",
    });
  }
}
