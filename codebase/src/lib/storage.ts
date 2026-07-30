import { MeetingSessionListSchema } from "@/lib/meeting-schema";
import type { MeetingSession } from "@/types/meeting";

export const MEETING_STORAGE_KEY = "meetflow.sessions.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadMeetingSessions(storage: StorageLike): MeetingSession[] {
  try {
    const raw = storage.getItem(MEETING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = MeetingSessionListSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveMeetingSessions(storage: StorageLike, sessions: MeetingSession[]): void {
  const validSessions = MeetingSessionListSchema.parse(sessions);
  storage.setItem(MEETING_STORAGE_KEY, JSON.stringify(validSessions));
}

export function upsertMeetingSession(
  sessions: MeetingSession[],
  session: MeetingSession,
): MeetingSession[] {
  const validated = MeetingSessionListSchema.element.parse(session);
  const withoutCurrent = sessions.filter((item) => item.id !== validated.id);
  return [validated, ...withoutCurrent]
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, 100);
}

export function renameMeetingSession(
  sessions: MeetingSession[],
  id: string,
  title: string,
): MeetingSession[] {
  const cleanTitle = title.trim().slice(0, 150);
  if (!cleanTitle) return sessions;
  return sessions.map((session) => (session.id === id ? { ...session, title: cleanTitle } : session));
}

export function deleteMeetingSession(sessions: MeetingSession[], id: string): MeetingSession[] {
  return sessions.filter((session) => session.id !== id);
}
