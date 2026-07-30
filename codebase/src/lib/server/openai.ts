import OpenAI from "openai";

import { SafeApiError } from "@/lib/server/api-response";

export const TRANSCRIPTION_MODEL = "gpt-transcribe";
export const REALTIME_TRANSCRIPTION_MODEL = "gpt-live-transcribe";
export const DEFAULT_SUMMARY_MODEL = "gpt-5-mini";

export const TRANSCRIPTION_KEYWORDS = [
  "AI",
  "RAG",
  "Agent",
  "deadline",
  "API",
  "Vercel",
  "hackathon",
] as const;

export const TRANSCRIPTION_LANGUAGES = ["vi", "en"] as const;

export const TRANSCRIPTION_PROMPT =
  "Bản ghi cuộc họp dự án chủ yếu bằng tiếng Việt, có thể xen thuật ngữ tiếng Anh. " +
  "Giữ nguyên tên riêng và các thuật ngữ AI, RAG, Agent, deadline, API, Vercel, hackathon.";

let cachedClient: OpenAI | null = null;
let cachedApiKey: string | null = null;

export function requireOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new SafeApiError(
      503,
      "OPENAI_NOT_CONFIGURED",
      "Dịch vụ AI chưa được cấu hình. Vui lòng thêm OPENAI_API_KEY.",
    );
  }
  return apiKey;
}

export function getOpenAIClient(): OpenAI {
  const apiKey = requireOpenAIApiKey();
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new OpenAI({
      apiKey,
      maxRetries: 1,
      timeout: 45_000,
    });
    cachedApiKey = apiKey;
  }
  return cachedClient;
}

export function getSummaryModel(): string {
  return process.env.OPENAI_SUMMARY_MODEL?.trim() || DEFAULT_SUMMARY_MODEL;
}
