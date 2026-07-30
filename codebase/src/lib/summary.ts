import type { MeetingSession, MeetingSummary, TranscriptSegment } from "@/types/meeting";

export interface IncrementalSummaryPayload {
  previousSummary: MeetingSummary;
  newTranscript: string;
  meetingTitle: string;
  currentTime: string;
}

export function formatTimestamp(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function segmentsSince(segments: TranscriptSegment[], index: number): TranscriptSegment[] {
  return segments.slice(Math.max(0, index)).filter((segment) => segment.completed && segment.text.trim());
}

export function buildIncrementalSummaryPayload(
  session: Pick<MeetingSession, "summary" | "title" | "transcript">,
  summarizedThrough: number,
  currentTime = new Date().toISOString(),
): IncrementalSummaryPayload | null {
  const freshSegments = segmentsSince(session.transcript, summarizedThrough);
  if (!freshSegments.length) return null;

  return {
    previousSummary: session.summary,
    newTranscript: freshSegments
      .map((segment) => `[${formatTimestamp(segment.startedAtMs)}] ${segment.text.trim()}`)
      .join("\n"),
    meetingTitle: session.title,
    currentTime,
  };
}

export function shouldAutoSummarize({
  newTranscript,
  millisecondsSinceLastRequest,
  requestInFlight,
}: {
  newTranscript: string;
  millisecondsSinceLastRequest: number;
  requestInFlight: boolean;
}): boolean {
  if (requestInFlight || !newTranscript.trim()) return false;
  if (millisecondsSinceLastRequest < 30_000) return false;
  return newTranscript.length >= 280 || millisecondsSinceLastRequest >= 45_000;
}
