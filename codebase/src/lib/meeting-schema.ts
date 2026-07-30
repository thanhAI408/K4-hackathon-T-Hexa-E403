import { z } from "zod";

export const DecisionSchema = z.object({
  content: z.string().trim().min(1).max(1_000),
  evidence: z.string().trim().min(1).max(500).nullable(),
});

export const ActionItemSchema = z.object({
  task: z.string().trim().min(1).max(1_000),
  owner: z.string().trim().min(1).max(200).nullable(),
  deadline: z.string().trim().min(1).max(200).nullable(),
  status: z.literal("todo"),
});

export const MeetingSummarySchema = z.object({
  summary: z.string().trim().max(4_000),
  keyPoints: z.array(z.string().trim().min(1).max(1_000)).max(20),
  decisions: z.array(DecisionSchema).max(20),
  actionItems: z.array(ActionItemSchema).max(30),
  openQuestions: z.array(z.string().trim().min(1).max(1_000)).max(20),
});

export const TranscriptSegmentSchema = z.object({
  id: z.string().min(1).max(200),
  text: z.string().max(20_000),
  startedAtMs: z.number().finite().nonnegative(),
  completed: z.boolean(),
});

export const MeetingSessionSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().trim().min(1).max(150),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
  durationSeconds: z.number().finite().nonnegative(),
  transcript: z.array(TranscriptSegmentSchema).max(5_000),
  summary: MeetingSummarySchema,
  summarySource: z.enum(["none", "ai", "mock"]),
  mode: z.enum(["demo", "realtime", "near-realtime", "history"]),
  audioSource: z.enum(["microphone", "display", "mixed"]).nullable(),
});

export const MeetingSessionListSchema = z.array(MeetingSessionSchema).max(100);

export const SummaryRequestSchema = z.object({
  previousSummary: MeetingSummarySchema,
  newTranscript: z.string().trim().min(1).max(60_000),
  meetingTitle: z.string().trim().min(1).max(150),
  currentTime: z.iso.datetime(),
});
