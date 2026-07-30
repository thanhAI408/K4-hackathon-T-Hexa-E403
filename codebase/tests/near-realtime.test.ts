import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NearRealtimeTranscriber,
  selectNearRealtimeMimeType,
} from "@/lib/near-realtime";

function audioTrack(): MediaStreamTrack {
  return { enabled: true } as MediaStreamTrack;
}

function audioStream(track = audioTrack()): MediaStream {
  return { getAudioTracks: () => [track] } as unknown as MediaStream;
}

class FakeRecorder {
  state: RecordingState = "inactive";
  mimeType = "audio/webm;codecs=opus";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  start(): void {
    this.state = "recording";
  }

  stop(): void {
    if (this.state === "inactive") return;
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob(["audio"], { type: this.mimeType }),
    } as BlobEvent);
    this.onstop?.({} as Event);
  }
}

afterEach(() => {
  vi.useRealTimers();
});

describe("selectNearRealtimeMimeType", () => {
  it("prefers independently uploadable Opus WebM", () => {
    expect(selectNearRealtimeMimeType((mime) => mime === "audio/webm;codecs=opus")).toBe(
      "audio/webm;codecs=opus",
    );
  });
});

describe("NearRealtimeTranscriber", () => {
  it("creates a fresh recorder per chunk and uploads chunks sequentially", async () => {
    vi.useFakeTimers();
    const recorders: FakeRecorder[] = [];
    const completions: number[] = [];
    let releaseFirst: () => void = vi.fn();
    const firstBlocked = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let activeRequests = 0;
    let maxActiveRequests = 0;

    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const form = init?.body as FormData;
      const sequence = Number(form.get("sequence"));
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      if (sequence === 0) await firstBlocked;
      activeRequests -= 1;
      return Response.json({ text: `chunk ${sequence}` });
    }) as unknown as typeof fetch;

    const transcriber = new NearRealtimeTranscriber({
      stream: audioStream(),
      fetchImpl,
      chunkDurationMs: 6_000,
      maxRetries: 0,
      recorderFactory: () => {
        const recorder = new FakeRecorder();
        recorders.push(recorder);
        return recorder as unknown as MediaRecorder;
      },
      isTypeSupported: () => true,
      onCompleted: ({ sequence }) => completions.push(sequence),
    });

    transcriber.start();
    await vi.advanceTimersByTimeAsync(6_000);
    await vi.advanceTimersByTimeAsync(6_000);
    expect(recorders).toHaveLength(3);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    releaseFirst();
    await transcriber.stop();

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(completions).toEqual([0, 1, 2]);
    expect(maxActiveRequests).toBe(1);
  });

  it("pauses tracks and cleanup is idempotent", () => {
    const track = audioTrack();
    const recorder = new FakeRecorder();
    const transcriber = new NearRealtimeTranscriber({
      stream: audioStream(track),
      recorderFactory: () => recorder as unknown as MediaRecorder,
      isTypeSupported: () => true,
    });

    transcriber.start();
    transcriber.pause();
    expect(track.enabled).toBe(false);
    transcriber.resume();
    expect(track.enabled).toBe(true);
    transcriber.close();
    transcriber.close();
    expect(track.enabled).toBe(false);
    expect(transcriber.status).toBe("stopped");
  });
});
