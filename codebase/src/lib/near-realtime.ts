export const DEFAULT_NEAR_REALTIME_CHUNK_MS = 7_000;
export const MIN_NEAR_REALTIME_CHUNK_MS = 6_000;
export const MAX_NEAR_REALTIME_CHUNK_MS = 8_000;

export type NearRealtimeErrorCode =
  | "UNSUPPORTED"
  | "NO_AUDIO_TRACK"
  | "INVALID_CHUNK_DURATION"
  | "RECORDER_ERROR"
  | "UPLOAD_FAILED"
  | "INVALID_RESPONSE"
  | "ALREADY_STOPPED";

export class NearRealtimeError extends Error {
  constructor(
    public readonly code: NearRealtimeErrorCode,
    message: string,
    public readonly sequence?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "NearRealtimeError";
  }
}

export interface NearRealtimeCompletedEvent {
  sequence: number;
  itemId: string;
  text: string;
}

export interface NearRealtimeCallbacks {
  onCompleted?: (event: NearRealtimeCompletedEvent) => void;
  onError?: (error: NearRealtimeError) => void;
  onQueueChange?: (pending: number) => void;
}

type RecorderFactory = (stream: MediaStream, options?: MediaRecorderOptions) => MediaRecorder;

interface NearRealtimeOptions extends NearRealtimeCallbacks {
  stream: MediaStream;
  endpoint?: string;
  meetingId?: string;
  chunkDurationMs?: number;
  requestTimeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
  recorderFactory?: RecorderFactory;
  isTypeSupported?: (mimeType: string) => boolean;
}

interface UploadJob {
  sequence: number;
  blob: Blob;
  mimeType: string;
}

type RecorderState = "idle" | "running" | "paused" | "stopping" | "stopped";

const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function selectNearRealtimeMimeType(
  isTypeSupported: (mimeType: string) => boolean,
): string | undefined {
  return MIME_TYPES.find((mimeType) => isTypeSupported(mimeType));
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

function normalizeUploadError(error: unknown, sequence: number): NearRealtimeError {
  if (error instanceof NearRealtimeError) return error;
  return new NearRealtimeError(
    "UPLOAD_FAILED",
    `Không thể gửi audio chunk ${sequence} để nhận dạng.`,
    sequence,
    error instanceof Error ? { cause: error } : undefined,
  );
}

/**
 * Near-real-time transcription using bounded, independently decodable files.
 * A new MediaRecorder instance is created for every 6–8 second chunk. Blobs
 * live only in the in-memory upload queue and are released after each request.
 */
export class NearRealtimeTranscriber {
  private readonly stream: MediaStream;
  private readonly endpoint: string;
  private readonly meetingId?: string;
  private readonly chunkDurationMs: number;
  private readonly requestTimeoutMs: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly recorderFactory: RecorderFactory;
  private readonly mimeType?: string;
  private readonly callbacks: NearRealtimeCallbacks;

  private state: RecorderState = "idle";
  private recorder: MediaRecorder | null = null;
  private recorderTimer: ReturnType<typeof setTimeout> | null = null;
  private recorderDone: Promise<void> | null = null;
  private resolveRecorderDone: (() => void) | null = null;
  private uploadChain: Promise<void> = Promise.resolve();
  private activeRequest: AbortController | null = null;
  private stopPromise: Promise<void> | null = null;
  private sequence = 0;
  private pendingUploads = 0;
  private disposed = false;

  constructor(options: NearRealtimeOptions) {
    this.stream = options.stream;
    this.endpoint = options.endpoint ?? "/api/transcribe";
    this.meetingId = options.meetingId;
    this.chunkDurationMs = options.chunkDurationMs ?? DEFAULT_NEAR_REALTIME_CHUNK_MS;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 25_000;
    this.maxRetries = options.maxRetries ?? 1;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.callbacks = {
      onCompleted: options.onCompleted,
      onError: options.onError,
      onQueueChange: options.onQueueChange,
    };

    if (
      this.chunkDurationMs < MIN_NEAR_REALTIME_CHUNK_MS ||
      this.chunkDurationMs > MAX_NEAR_REALTIME_CHUNK_MS
    ) {
      throw new NearRealtimeError(
        "INVALID_CHUNK_DURATION",
        "Audio chunk near real-time phải dài từ 6 đến 8 giây.",
      );
    }

    const Recorder = typeof MediaRecorder === "undefined" ? null : MediaRecorder;
    if (!options.recorderFactory && !Recorder) {
      throw new NearRealtimeError(
        "UNSUPPORTED",
        "Trình duyệt không hỗ trợ MediaRecorder cho chế độ near real-time.",
      );
    }

    this.recorderFactory =
      options.recorderFactory ?? ((stream, recorderOptions) => new MediaRecorder(stream, recorderOptions));
    const supportCheck = options.isTypeSupported ?? Recorder?.isTypeSupported.bind(Recorder);
    this.mimeType = supportCheck ? selectNearRealtimeMimeType(supportCheck) : undefined;
  }

  start(): void {
    if (this.disposed || this.state === "stopped" || this.state === "stopping") {
      throw new NearRealtimeError("ALREADY_STOPPED", "Bộ ghi near real-time đã được đóng.");
    }
    if (this.state === "running" || this.state === "paused") return;
    if (!this.stream.getAudioTracks().length) {
      throw new NearRealtimeError(
        "NO_AUDIO_TRACK",
        "Nguồn đã chọn không có audio track cho near real-time.",
      );
    }

    this.state = "running";
    this.setAudioTracksEnabled(true);
    this.startIndependentRecorder();
  }

  pause(): void {
    if (this.disposed || this.state !== "running") return;
    this.state = "paused";
    this.setAudioTracksEnabled(false);
    this.clearRecorderTimer();
    this.finishCurrentRecorder();
  }

  resume(): void {
    if (this.disposed || this.state !== "paused") return;
    this.state = "running";
    this.setAudioTracksEnabled(true);
    // If stop() is still delivering the previous Blob, its onstop handler will
    // start the next independent recorder. Otherwise start immediately.
    if (!this.recorder) this.startIndependentRecorder();
  }

  stop(): Promise<void> {
    if (this.stopPromise) return this.stopPromise;
    this.stopPromise = this.stopAndFlush();
    return this.stopPromise;
  }

  /** Abort uploads and discard any not-yet-emitted audio. Safe to call twice. */
  close(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.state = "stopped";
    this.setAudioTracksEnabled(false);
    this.clearRecorderTimer();
    this.activeRequest?.abort();
    this.activeRequest = null;

    const recorder = this.recorder;
    this.recorder = null;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== "inactive") recorder.stop();
    }
    this.resolveRecorderDone?.();
    this.resolveRecorderDone = null;
    this.recorderDone = null;
  }

  get status(): RecorderState {
    return this.state;
  }

  private startIndependentRecorder(): void {
    if (this.disposed || this.state !== "running" || this.recorder) return;

    const chunks: Blob[] = [];
    const recorder = this.recorderFactory(
      this.stream,
      this.mimeType ? { mimeType: this.mimeType } : undefined,
    );
    this.recorder = recorder;
    this.recorderDone = new Promise<void>((resolve) => {
      this.resolveRecorderDone = resolve;
    });

    recorder.ondataavailable = (event) => {
      if (!this.disposed && event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      if (this.disposed) return;
      this.callbacks.onError?.(
        new NearRealtimeError("RECORDER_ERROR", "MediaRecorder gặp lỗi khi tạo audio chunk."),
      );
    };
    recorder.onstop = () => {
      this.clearRecorderTimer();
      if (this.recorder === recorder) this.recorder = null;

      if (!this.disposed && chunks.length) {
        const mimeType = recorder.mimeType || this.mimeType || chunks[0].type || "audio/webm";
        const blob = new Blob(chunks, { type: mimeType });
        chunks.length = 0;
        if (blob.size > 0) this.enqueueUpload({ sequence: this.sequence++, blob, mimeType });
      } else {
        chunks.length = 0;
      }

      this.resolveRecorderDone?.();
      this.resolveRecorderDone = null;
      this.recorderDone = null;
      if (!this.disposed && this.state === "running") this.startIndependentRecorder();
    };

    recorder.start();
    this.recorderTimer = setTimeout(() => this.finishCurrentRecorder(), this.chunkDurationMs);
  }

  private finishCurrentRecorder(): void {
    this.clearRecorderTimer();
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
  }

  private enqueueUpload(job: UploadJob): void {
    this.pendingUploads += 1;
    this.callbacks.onQueueChange?.(this.pendingUploads);

    this.uploadChain = this.uploadChain
      .then(async () => {
        if (this.disposed) return;
        try {
          const text = await this.uploadWithRetry(job);
          if (!this.disposed && text.trim()) {
            this.callbacks.onCompleted?.({
              sequence: job.sequence,
              itemId: `near-${job.sequence}`,
              text: text.trim(),
            });
          }
        } catch (error) {
          if (!this.disposed) this.callbacks.onError?.(normalizeUploadError(error, job.sequence));
        }
      })
      .finally(() => {
        this.pendingUploads = Math.max(0, this.pendingUploads - 1);
        this.callbacks.onQueueChange?.(this.pendingUploads);
      });
  }

  private async uploadWithRetry(job: UploadJob): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      if (this.disposed) return "";
      try {
        return await this.upload(job);
      } catch (error) {
        lastError = error;
        if (error instanceof DOMException && error.name === "AbortError") break;
      }
    }
    throw normalizeUploadError(lastError, job.sequence);
  }

  private async upload(job: UploadJob): Promise<string> {
    const form = new FormData();
    form.append(
      "file",
      job.blob,
      `chunk-${job.sequence}.${extensionForMimeType(job.mimeType)}`,
    );
    form.append("sequence", String(job.sequence));
    if (this.meetingId) form.append("meetingId", this.meetingId);

    const controller = new AbortController();
    this.activeRequest = controller;
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        body: form,
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new NearRealtimeError(
          "UPLOAD_FAILED",
          `Transcription chunk ${job.sequence} thất bại (HTTP ${response.status}).`,
          job.sequence,
        );
      }

      const body: unknown = await response.json();
      if (!isRecord(body)) {
        throw new NearRealtimeError(
          "INVALID_RESPONSE",
          `Phản hồi transcription chunk ${job.sequence} không hợp lệ.`,
          job.sequence,
        );
      }
      const text = typeof body.text === "string"
        ? body.text
        : typeof body.transcript === "string"
          ? body.transcript
          : null;
      if (text === null) {
        throw new NearRealtimeError(
          "INVALID_RESPONSE",
          `Phản hồi transcription chunk ${job.sequence} thiếu transcript.`,
          job.sequence,
        );
      }
      return text;
    } finally {
      clearTimeout(timeout);
      if (this.activeRequest === controller) this.activeRequest = null;
    }
  }

  private async stopAndFlush(): Promise<void> {
    if (this.disposed || this.state === "stopped") return;
    this.state = "stopping";
    this.setAudioTracksEnabled(false);
    this.clearRecorderTimer();
    const recorderDone = this.recorderDone;
    this.finishCurrentRecorder();
    if (recorderDone) await recorderDone;
    await this.uploadChain;
    if (!this.disposed) this.state = "stopped";
  }

  private setAudioTracksEnabled(enabled: boolean): void {
    for (const track of this.stream.getAudioTracks()) track.enabled = enabled;
  }

  private clearRecorderTimer(): void {
    if (this.recorderTimer !== null) clearTimeout(this.recorderTimer);
    this.recorderTimer = null;
  }
}
