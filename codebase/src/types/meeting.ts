export type AudioSource = "microphone" | "display" | "mixed";

export type MeetingMode = "demo" | "realtime" | "near-realtime" | "history";

export type MeetingStatus = "idle" | "connecting" | "recording" | "paused" | "ended" | "error";

export interface TranscriptSegment {
  id: string;
  text: string;
  startedAtMs: number;
  completed: boolean;
}

export interface Decision {
  content: string;
  evidence: string | null;
}

export interface ActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
  status: "todo";
}

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  decisions: Decision[];
  actionItems: ActionItem[];
  openQuestions: string[];
}

export type SummarySource = "none" | "ai" | "mock";

export interface MeetingSession {
  id: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  transcript: TranscriptSegment[];
  summary: MeetingSummary;
  summarySource: SummarySource;
  mode: MeetingMode;
  audioSource: AudioSource | null;
}

export const EMPTY_SUMMARY: MeetingSummary = {
  summary: "",
  keyPoints: [],
  decisions: [],
  actionItems: [],
  openQuestions: [],
};
