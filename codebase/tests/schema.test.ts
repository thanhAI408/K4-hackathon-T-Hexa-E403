import { describe, expect, it } from "vitest";

import { MeetingSummarySchema } from "@/lib/meeting-schema";

describe("structured summary schema", () => {
  it("accepts nullable owner, deadline and evidence", () => {
    const parsed = MeetingSummarySchema.safeParse({
      summary: "Đã ghi nhận một đề xuất nhưng chưa có quyết định.",
      keyPoints: ["Đề xuất thử RAG."],
      decisions: [{ content: "Dùng Next.js.", evidence: null }],
      actionItems: [{ task: "Thử nghiệm RAG", owner: null, deadline: null, status: "todo" }],
      openQuestions: ["Ai sẽ phụ trách?"],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a fabricated non-todo action status", () => {
    const parsed = MeetingSummarySchema.safeParse({
      summary: "",
      keyPoints: [],
      decisions: [],
      actionItems: [{ task: "Việc", owner: null, deadline: null, status: "done" }],
      openQuestions: [],
    });
    expect(parsed.success).toBe(false);
  });
});
