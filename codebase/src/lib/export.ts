import { formatTimestamp } from "@/lib/summary";
import type { MeetingSession } from "@/types/meeting";

export function sanitizeFilename(input: string): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 80)
    .toLowerCase();
  return normalized || "meetflow-session";
}

function safeCell(value: string | null): string {
  return (value || "Chưa xác định").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function meetingToMarkdown(session: MeetingSession): string {
  const lines = [
    `# ${session.title}`,
    "",
    `- Bắt đầu: ${session.startedAt}`,
    `- Kết thúc: ${session.endedAt ?? "Chưa kết thúc"}`,
    `- Thời lượng: ${formatTimestamp(session.durationSeconds * 1_000)}`,
    `- Chế độ: ${session.mode}`,
    `- Nguồn tóm tắt: ${session.summarySource === "ai" ? "OpenAI" : session.summarySource === "mock" ? "Mô phỏng" : "Chưa có"}`,
    "",
    "## Tóm tắt",
    "",
    session.summary.summary || "Chưa có tóm tắt.",
    "",
    "## Ý chính",
    "",
    ...(session.summary.keyPoints.length
      ? session.summary.keyPoints.map((point) => `- ${point}`)
      : ["- Chưa có."]),
    "",
    "## Quyết định",
    "",
    ...(session.summary.decisions.length
      ? session.summary.decisions.map(
          (decision) => `- ${decision.content}${decision.evidence ? ` — Bằng chứng: “${decision.evidence}”` : ""}`,
        )
      : ["- Chưa có."]),
    "",
    "## Action items",
    "",
    "| Công việc | Người phụ trách | Deadline | Trạng thái |",
    "|---|---|---|---|",
    ...(session.summary.actionItems.length
      ? session.summary.actionItems.map(
          (item) => `| ${safeCell(item.task)} | ${safeCell(item.owner)} | ${safeCell(item.deadline)} | Cần làm |`,
        )
      : ["| Chưa có | — | — | — |"]),
    "",
    "## Câu hỏi mở",
    "",
    ...(session.summary.openQuestions.length
      ? session.summary.openQuestions.map((question) => `- ${question}`)
      : ["- Chưa có."]),
    "",
    "## Transcript",
    "",
    ...(session.transcript.length
      ? session.transcript.map(
          (segment) => `**[${formatTimestamp(segment.startedAtMs)}]** ${segment.text.trim()}`,
        )
      : ["Chưa có transcript."]),
    "",
    "---",
    "Tạo bởi MeetFlow AI. Không bao gồm audio hoặc video.",
  ];

  return lines.join("\n");
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: `${mimeType};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}
