import { toFile } from "openai";

import {
  TRANSCRIPTION_KEYWORDS,
  TRANSCRIPTION_LANGUAGES,
  TRANSCRIPTION_MODEL,
  TRANSCRIPTION_PROMPT,
  getOpenAIClient,
} from "@/lib/server/openai";
import {
  SafeApiError,
  assertSameOriginRequest,
  enforceInMemoryRateLimit,
  jsonResponse,
  readBodyBytes,
  requestSignalWithTimeout,
  safeApiErrorResponse,
} from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_AUDIO_BYTES + 256 * 1024;
const TRANSCRIPTION_TIMEOUT_MS = 40_000;
const TRANSCRIPTION_REQUEST_RATE_LIMIT = {
  id: "transcription-requests",
  windowMs: 60_000,
  maxRequests: 20,
  maxCost: 20,
} as const;
const TRANSCRIPTION_COST_RATE_LIMIT = {
  id: "transcription-cost",
  windowMs: 60_000,
  maxRequests: 20,
  maxCost: 128,
} as const;
const TRANSCRIPTION_COST_UNIT_BYTES = 512 * 1024;

const EXTENSIONS = new Set(["flac", "mp3", "mpeg", "mpga", "m4a", "ogg", "wav", "webm"]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "audio/flac": "flac",
  "audio/m4a": "m4a",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/mpga": "mpga",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/webm": "webm",
  "audio/x-m4a": "m4a",
  "audio/x-wav": "wav",
};

function normalizedMimeType(file: File): string {
  return file.type.split(";", 1)[0].trim().toLowerCase();
}

function supportedExtension(file: File): string {
  const mimeType = normalizedMimeType(file);
  if (mimeType) {
    if (!mimeType.startsWith("audio/") || !MIME_TO_EXTENSION[mimeType]) {
      throw new SafeApiError(
        415,
        "UNSUPPORTED_AUDIO_TYPE",
        "Định dạng audio không được hỗ trợ.",
      );
    }
    return MIME_TO_EXTENSION[mimeType];
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (EXTENSIONS.has(extension)) return extension;

  throw new SafeApiError(
    415,
    "UNSUPPORTED_AUDIO_TYPE",
    "Định dạng audio không được hỗ trợ.",
  );
}

function parseSequence(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  if (typeof value !== "string" || !/^\d{1,9}$/.test(value)) {
    throw new SafeApiError(400, "INVALID_SEQUENCE", "Số thứ tự audio chunk không hợp lệ.");
  }

  const sequence = Number(value);
  if (!Number.isSafeInteger(sequence)) {
    throw new SafeApiError(400, "INVALID_SEQUENCE", "Số thứ tự audio chunk không hợp lệ.");
  }
  return sequence;
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOriginRequest(request);
    enforceInMemoryRateLimit(request, TRANSCRIPTION_REQUEST_RATE_LIMIT);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      throw new SafeApiError(
        415,
        "INVALID_CONTENT_TYPE",
        "Transcription yêu cầu multipart/form-data.",
      );
    }

    const multipartBody = await readBodyBytes(request, MAX_MULTIPART_BYTES);
    enforceInMemoryRateLimit(
      request,
      TRANSCRIPTION_COST_RATE_LIMIT,
      multipartBody.byteLength / TRANSCRIPTION_COST_UNIT_BYTES,
    );

    let form: FormData;
    try {
      form = await new Response(multipartBody, {
        headers: { "Content-Type": contentType },
      }).formData();
    } catch {
      throw new SafeApiError(400, "INVALID_FORM_DATA", "Form audio không hợp lệ.");
    }

    const audio = form.get("file");
    if (!(audio instanceof File) || audio.size === 0) {
      throw new SafeApiError(400, "MISSING_AUDIO", "Không tìm thấy audio chunk.");
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      throw new SafeApiError(413, "AUDIO_TOO_LARGE", "Audio chunk vượt quá 8 MB.");
    }

    const extension = supportedExtension(audio);
    const mimeType = normalizedMimeType(audio) || undefined;
    const sequence = parseSequence(form.get("sequence"));
    const client = getOpenAIClient();
    const upload = await toFile(
      new Uint8Array(await audio.arrayBuffer()),
      `chunk.${extension}`,
      mimeType ? { type: mimeType } : undefined,
    );

    const result = await client.audio.transcriptions.create(
      {
        file: upload,
        model: TRANSCRIPTION_MODEL,
        prompt: TRANSCRIPTION_PROMPT,
        keywords: [...TRANSCRIPTION_KEYWORDS],
        languages: [...TRANSCRIPTION_LANGUAGES],
      },
      { signal: requestSignalWithTimeout(request, TRANSCRIPTION_TIMEOUT_MS) },
    );

    return jsonResponse({
      text: result.text.trim(),
      ...(sequence === null ? {} : { sequence }),
    });
  } catch (error) {
    return safeApiErrorResponse(error, {
      status: 502,
      code: "TRANSCRIPTION_FAILED",
      message: "Không thể nhận dạng audio chunk. Vui lòng thử lại.",
    });
  }
}
