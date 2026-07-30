import { describe, expect, it } from "vitest";

import {
  MEETING_STORAGE_KEY,
  deleteMeetingSession,
  loadMeetingSessions,
  renameMeetingSession,
  saveMeetingSessions,
  upsertMeetingSession,
  type StorageLike,
} from "@/lib/storage";
import { EMPTY_SUMMARY, type MeetingSession } from "@/types/meeting";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const session: MeetingSession = {
  id: "meeting-1",
  title: "Họp dự án",
  startedAt: "2026-07-30T08:00:00.000Z",
  endedAt: null,
  durationSeconds: 12,
  transcript: [],
  summary: EMPTY_SUMMARY,
  summarySource: "none",
  mode: "demo",
  audioSource: null,
};

describe("meeting storage", () => {
  it("saves, reads, renames, upserts and deletes sessions", () => {
    const storage = new MemoryStorage();
    saveMeetingSessions(storage, [session]);
    expect(loadMeetingSessions(storage)).toEqual([session]);

    let sessions = renameMeetingSession([session], session.id, "Tên mới");
    expect(sessions[0].title).toBe("Tên mới");
    sessions = upsertMeetingSession(sessions, { ...session, durationSeconds: 30 });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].durationSeconds).toBe(30);
    expect(deleteMeetingSession(sessions, session.id)).toEqual([]);
  });

  it("returns an empty list for corrupt or invalid persisted data", () => {
    const storage = new MemoryStorage();
    storage.setItem(MEETING_STORAGE_KEY, "not-json");
    expect(loadMeetingSessions(storage)).toEqual([]);
    storage.setItem(MEETING_STORAGE_KEY, JSON.stringify([{ title: "missing fields" }]));
    expect(loadMeetingSessions(storage)).toEqual([]);
  });
});
