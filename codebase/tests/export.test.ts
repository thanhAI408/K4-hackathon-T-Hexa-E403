import { describe, expect, it } from "vitest";

import { meetingToMarkdown, sanitizeFilename } from "@/lib/export";
import type { MeetingSession } from "@/types/meeting";

const session: MeetingSession = {
  id: "meeting-1",
  title: "Họp Sprint: Nhóm A/B?",
  startedAt: "2026-07-30T08:00:00.000Z",
  endedAt: "2026-07-30T08:15:00.000Z",
  durationSeconds: 900,
  transcript: [{ id: "one", text: "Lan nhận frontend.", startedAtMs: 2_000, completed: true }],
  summary: {
    summary: "Nhóm phân công công việc.",
    keyPoints: ["Dùng Next.js."],
    decisions: [{ content: "Dùng Next.js.", evidence: "Mình chốt dùng Next.js." }],
    actionItems: [{ task: "Làm frontend", owner: "Lan", deadline: null, status: "todo" }],
    openQuestions: ["Ai chạy kiểm thử?"],
  },
  summarySource: "ai",
  mode: "realtime",
  audioSource: "microphone",
};

describe("meeting export", () => {
  it("sanitizes unsafe and accented filename characters", () => {
    expect(sanitizeFilename(session.title)).toBe("hop-sprint-nhom-a-b");
    expect(sanitizeFilename("../../")).toBe("meetflow-session");
  });

  it("creates complete Markdown without raw audio references", () => {
    const markdown = meetingToMarkdown(session);
    expect(markdown).toContain("# Họp Sprint: Nhóm A/B?");
    expect(markdown).toContain("| Làm frontend | Lan | Chưa xác định | Cần làm |");
    expect(markdown).toContain("**[00:02]** Lan nhận frontend.");
    expect(markdown).toContain("Không bao gồm audio hoặc video");
  });
});
