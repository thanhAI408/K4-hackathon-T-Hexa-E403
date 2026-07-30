import { describe, expect, it } from "vitest";

import { buildIncrementalSummaryPayload, shouldAutoSummarize } from "@/lib/summary";
import { EMPTY_SUMMARY, type MeetingSession } from "@/types/meeting";

const session: MeetingSession = {
  id: "meeting-1",
  title: "Họp sprint",
  startedAt: "2026-07-30T08:00:00.000Z",
  endedAt: null,
  durationSeconds: 15,
  transcript: [
    { id: "one", text: "Chốt dùng Next.js.", startedAtMs: 1_000, completed: true },
    { id: "two", text: "Lan nhận frontend.", startedAtMs: 5_000, completed: true },
    { id: "three", text: "Deadline thứ Sáu.", startedAtMs: 9_000, completed: true },
  ],
  summary: EMPTY_SUMMARY,
  summarySource: "none",
  mode: "demo",
  audioSource: null,
};

describe("incremental summary payload", () => {
  it("sends only transcript segments after the cursor", () => {
    const payload = buildIncrementalSummaryPayload(session, 1, "2026-07-30T08:00:15.000Z");
    expect(payload?.newTranscript).not.toContain("Chốt dùng Next.js");
    expect(payload?.newTranscript).toContain("[00:05] Lan nhận frontend.");
    expect(payload?.newTranscript).toContain("[00:09] Deadline thứ Sáu.");
    expect(payload?.previousSummary).toEqual(EMPTY_SUMMARY);
  });

  it("returns null when there is no new completed transcript", () => {
    expect(buildIncrementalSummaryPayload(session, session.transcript.length)).toBeNull();
  });

  it("prevents duplicate concurrent requests", () => {
    expect(
      shouldAutoSummarize({
        newTranscript: "x".repeat(400),
        millisecondsSinceLastRequest: 60_000,
        requestInFlight: true,
      }),
    ).toBe(false);
  });

  it("enforces a minimum interval even when a large transcript arrives", () => {
    expect(
      shouldAutoSummarize({
        newTranscript: "x".repeat(400),
        millisecondsSinceLastRequest: 10_000,
        requestInFlight: false,
      }),
    ).toBe(false);
    expect(
      shouldAutoSummarize({
        newTranscript: "x".repeat(400),
        millisecondsSinceLastRequest: 30_000,
        requestInFlight: false,
      }),
    ).toBe(true);
  });

  it("summarizes a short non-empty transcript at the maximum cadence", () => {
    expect(
      shouldAutoSummarize({
        newTranscript: "Nội dung ngắn nhưng đã chờ đủ lâu.",
        millisecondsSinceLastRequest: 45_000,
        requestInFlight: false,
      }),
    ).toBe(true);
  });
});
