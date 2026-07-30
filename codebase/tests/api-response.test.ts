import { describe, expect, it } from "vitest";

import {
  SafeApiError,
  assertSameOriginRequest,
  enforceInMemoryRateLimit,
  readBodyBytes,
} from "@/lib/server/api-response";
import { POST as transcribe } from "@/app/api/transcribe/route";

function expectSafeError(action: () => void, code: string): void {
  try {
    action();
    throw new Error("Expected SafeApiError");
  } catch (error) {
    expect(error).toBeInstanceOf(SafeApiError);
    expect(error).toMatchObject({ code });
  }
}

describe("server API guards", () => {
  it("allows a matching origin and rejects cross-site or mismatched origins", () => {
    const matching = new Request("https://meetflow.test/api/summarize", {
      headers: {
        Origin: "https://meetflow.test",
        "Sec-Fetch-Site": "same-origin",
      },
    });
    expect(() => assertSameOriginRequest(matching)).not.toThrow();

    const crossSite = new Request("https://meetflow.test/api/summarize", {
      headers: { "Sec-Fetch-Site": "cross-site" },
    });
    expectSafeError(() => assertSameOriginRequest(crossSite), "CROSS_SITE_REQUEST");

    const mismatched = new Request("https://meetflow.test/api/summarize", {
      headers: { Origin: "https://attacker.test" },
    });
    expectSafeError(() => assertSameOriginRequest(mismatched), "ORIGIN_MISMATCH");
  });

  it("enforces the stream cap even when Content-Length is absent", async () => {
    const request = new Request("https://meetflow.test/api/transcribe", {
      method: "POST",
      body: "12345",
    });
    expect(request.headers.get("content-length")).toBeNull();

    await expect(readBodyBytes(request, 4)).rejects.toMatchObject({
      status: 413,
      code: "REQUEST_TOO_LARGE",
    });
  });

  it("bounds request count and weighted cost per client address", () => {
    const request = new Request("https://meetflow.test/api/transcribe", {
      headers: { "X-Forwarded-For": "203.0.113.44" },
    });
    const policy = {
      id: "api-response-test-cost",
      windowMs: 60_000,
      maxRequests: 2,
      maxCost: 2,
    } as const;

    enforceInMemoryRateLimit(request, policy, 2);
    expectSafeError(
      () => enforceInMemoryRateLimit(request, policy, 1),
      "RATE_LIMITED",
    );
  });

  it("rejects video MIME types and an untyped .mp4 upload", async () => {
    const cases = [
      new File([new Uint8Array([1, 2, 3])], "clip.webm", { type: "video/webm" }),
      new File([new Uint8Array([1, 2, 3])], "clip.mp4"),
    ];

    for (const [index, file] of cases.entries()) {
      const form = new FormData();
      form.set("file", file);
      form.set("sequence", String(index));
      const response = await transcribe(
        new Request("https://meetflow.test/api/transcribe", {
          method: "POST",
          headers: {
            Origin: "https://meetflow.test",
            "X-Forwarded-For": `203.0.113.${50 + index}`,
          },
          body: form,
        }),
      );

      expect(response.status).toBe(415);
      await expect(response.json()).resolves.toMatchObject({
        code: "UNSUPPORTED_AUDIO_TYPE",
      });
    }
  });
});
