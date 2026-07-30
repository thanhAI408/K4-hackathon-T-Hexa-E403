export type RealtimeConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

export type RealtimeClientErrorCode =
  | "NO_AUDIO_TRACK"
  | "ALREADY_CLOSED"
  | "SESSION_REQUEST_FAILED"
  | "INVALID_SESSION_RESPONSE"
  | "PEER_CONNECTION_FAILED"
  | "DATA_CHANNEL_ERROR"
  | "SERVER_ERROR";

export class RealtimeClientError extends Error {
  constructor(
    public readonly code: RealtimeClientErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "RealtimeClientError";
  }
}

export interface RealtimeTranscriptDelta {
  type: "delta";
  key: string;
  itemId: string;
  contentIndex: number;
  text: string;
}

export interface RealtimeTranscriptCompleted {
  type: "completed";
  key: string;
  itemId: string;
  contentIndex: number;
  text: string;
}

export interface RealtimeItemOrder {
  type: "order";
  itemId: string;
  previousItemId: string | null;
}

export type ParsedRealtimeServerEvent =
  | RealtimeItemOrder
  | RealtimeTranscriptDelta
  | RealtimeTranscriptCompleted
  | { type: "error"; message: string };

export interface RealtimeClientCallbacks {
  onOrder?: (event: RealtimeItemOrder) => void;
  onDelta?: (event: RealtimeTranscriptDelta) => void;
  onCompleted?: (event: RealtimeTranscriptCompleted) => void;
  onConnection?: (state: RealtimeConnectionState) => void;
  onError?: (error: RealtimeClientError) => void;
}

interface RealtimeClientOptions extends RealtimeClientCallbacks {
  stream: MediaStream;
  endpoint?: string;
  fetchImpl?: typeof fetch;
  peerConnectionFactory?: () => RTCPeerConnection;
}

const TRANSCRIPT_DELTA_EVENT = "conversation.item.input_audio_transcription.delta";
const TRANSCRIPT_COMPLETED_EVENT = "conversation.item.input_audio_transcription.completed";
const TRANSCRIPT_FAILED_EVENT = "conversation.item.input_audio_transcription.failed";
const INPUT_AUDIO_COMMITTED_EVENT = "input_audio_buffer.committed";
const CONVERSATION_ITEM_ORDER_EVENTS = new Set([
  "conversation.item.created",
  "conversation.item.added",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function eventKey(itemId: string, contentIndex: number): string {
  return `${itemId}:${contentIndex}`;
}

/**
 * Parse only the Realtime events used by the meeting UI. Unknown lifecycle
 * events are intentionally ignored so API additions do not break the client.
 */
export function parseRealtimeServerEvent(raw: unknown): ParsedRealtimeServerEvent | null {
  if (!isRecord(raw) || typeof raw.type !== "string") return null;

  if (raw.type === "error") {
    const nestedError = isRecord(raw.error) ? raw.error : null;
    const message = nestedError && typeof nestedError.message === "string"
      ? nestedError.message
      : "OpenAI Realtime báo lỗi trong phiên transcription.";
    return { type: "error", message };
  }

  if (raw.type === TRANSCRIPT_FAILED_EVENT) {
    return {
      type: "error",
      message: "Một đoạn âm thanh không thể được nhận dạng. Đang chuyển sang chế độ dự phòng.",
    };
  }

  if (
    raw.type === INPUT_AUDIO_COMMITTED_EVENT ||
    CONVERSATION_ITEM_ORDER_EVENTS.has(raw.type)
  ) {
    const rawItemId = raw.type === INPUT_AUDIO_COMMITTED_EVENT
      ? raw.item_id
      : isRecord(raw.item)
        ? raw.item.id
        : null;
    const previousItemId = raw.previous_item_id;
    if (
      typeof rawItemId !== "string" ||
      !rawItemId.trim() ||
      (previousItemId !== null &&
        (typeof previousItemId !== "string" || !previousItemId.trim()))
    ) {
      return null;
    }

    return {
      type: "order",
      itemId: rawItemId.trim(),
      previousItemId: previousItemId === null ? null : previousItemId.trim(),
    };
  }

  if (raw.type !== TRANSCRIPT_DELTA_EVENT && raw.type !== TRANSCRIPT_COMPLETED_EVENT) {
    return null;
  }

  if (
    typeof raw.item_id !== "string" ||
    !raw.item_id.trim() ||
    typeof raw.content_index !== "number" ||
    !Number.isInteger(raw.content_index) ||
    raw.content_index < 0
  ) {
    return null;
  }

  const itemId = raw.item_id;
  const contentIndex = raw.content_index;
  const key = eventKey(itemId, contentIndex);

  if (raw.type === TRANSCRIPT_DELTA_EVENT) {
    if (typeof raw.delta !== "string") return null;
    return { type: "delta", key, itemId, contentIndex, text: raw.delta };
  }

  if (typeof raw.transcript !== "string") return null;
  return {
    type: "completed",
    key,
    itemId,
    contentIndex,
    text: raw.transcript,
  };
}

function normalizeError(error: unknown, fallbackCode: RealtimeClientErrorCode): RealtimeClientError {
  if (error instanceof RealtimeClientError) return error;
  return new RealtimeClientError(
    fallbackCode,
    "Không thể kết nối OpenAI Realtime. Hãy thử lại hoặc chuyển sang chế độ near real-time.",
    error instanceof Error ? { cause: error } : undefined,
  );
}

async function safeResponseMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body)) {
      const message = typeof body.error === "string"
        ? body.error
        : typeof body.message === "string"
          ? body.message
          : null;
      if (message) return message.slice(0, 300);
    }
  } catch {
    // The SDP endpoint can legitimately return plain text. Never surface an
    // arbitrary upstream body to the user when it is an error response.
  }
  return `Không thể tạo phiên Realtime (HTTP ${response.status}).`;
}

/**
 * Browser-side OpenAI Realtime transcription transport.
 *
 * The application Route Handler only exchanges the initial SDP. Once the
 * remote description is installed, media flows directly between this peer
 * connection and OpenAI. This class does not stop the supplied MediaStream;
 * the audio-capture owner can therefore reuse it for the near-real-time
 * fallback. close() only disables its audio tracks and releases WebRTC state.
 */
export class RealtimeTranscriptionClient {
  private readonly stream: MediaStream;
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;
  private readonly peerConnectionFactory: () => RTCPeerConnection;
  private readonly callbacks: RealtimeClientCallbacks;

  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private requestController: AbortController | null = null;
  private connectPromise: Promise<void> | null = null;
  private lastConnectionState: RealtimeConnectionState | null = null;
  private closed = false;
  private paused = false;

  constructor(options: RealtimeClientOptions) {
    this.stream = options.stream;
    this.endpoint = options.endpoint ?? "/api/realtime/session";
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.peerConnectionFactory =
      options.peerConnectionFactory ?? (() => new RTCPeerConnection());
    this.callbacks = {
      onOrder: options.onOrder,
      onDelta: options.onDelta,
      onCompleted: options.onCompleted,
      onConnection: options.onConnection,
      onError: options.onError,
    };
  }

  connect(): Promise<void> {
    if (this.closed) {
      return Promise.reject(
        new RealtimeClientError("ALREADY_CLOSED", "Phiên Realtime đã được đóng."),
      );
    }
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = this.openConnection();
    return this.connectPromise;
  }

  pause(): void {
    if (this.closed || this.paused) return;
    this.paused = true;
    this.setAudioTracksEnabled(false);
  }

  resume(): void {
    if (this.closed || !this.paused) return;
    this.paused = false;
    this.setAudioTracksEnabled(true);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.paused = false;
    this.setAudioTracksEnabled(false);

    this.requestController?.abort();
    this.requestController = null;

    if (this.dataChannel) {
      this.dataChannel.onopen = null;
      this.dataChannel.onmessage = null;
      this.dataChannel.onerror = null;
      this.dataChannel.onclose = null;
      if (this.dataChannel.readyState !== "closed") this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = null;
      if (this.peerConnection.connectionState !== "closed") this.peerConnection.close();
      this.peerConnection = null;
    }

    this.emitConnection("closed");
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get isClosed(): boolean {
    return this.closed;
  }

  private async openConnection(): Promise<void> {
    const audioTracks = this.stream.getAudioTracks();
    if (!audioTracks.length) {
      const error = new RealtimeClientError(
        "NO_AUDIO_TRACK",
        "Nguồn đã chọn không có audio track để gửi tới Realtime.",
      );
      this.callbacks.onError?.(error);
      throw error;
    }

    this.setAudioTracksEnabled(true);
    this.emitConnection("connecting");

    try {
      const peerConnection = this.peerConnectionFactory();
      this.peerConnection = peerConnection;
      peerConnection.onconnectionstatechange = () => {
        if (this.closed) return;
        switch (peerConnection.connectionState) {
          case "connected":
            this.emitConnection("connected");
            break;
          case "disconnected":
            this.emitConnection("disconnected");
            break;
          case "failed":
            this.emitConnection("failed");
            this.callbacks.onError?.(
              new RealtimeClientError(
                "PEER_CONNECTION_FAILED",
                "Kết nối Realtime đã bị mất. Hãy thử lại hoặc chuyển sang near real-time.",
              ),
            );
            break;
          case "closed":
            this.emitConnection("closed");
            break;
        }
      };

      for (const track of audioTracks) peerConnection.addTrack(track, this.stream);

      const dataChannel = peerConnection.createDataChannel("oai-events");
      this.dataChannel = dataChannel;
      dataChannel.onopen = () => this.emitConnection("connected");
      dataChannel.onmessage = (event) => this.handleDataChannelMessage(event.data);
      dataChannel.onerror = () => {
        if (this.closed) return;
        this.callbacks.onError?.(
          new RealtimeClientError(
            "DATA_CHANNEL_ERROR",
            "Kênh sự kiện transcript gặp lỗi.",
          ),
        );
      };
      dataChannel.onclose = () => {
        if (!this.closed) this.emitConnection("disconnected");
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      const localSdp = peerConnection.localDescription?.sdp ?? offer.sdp;
      if (!localSdp) {
        throw new RealtimeClientError(
          "PEER_CONNECTION_FAILED",
          "Trình duyệt không tạo được SDP offer cho phiên Realtime.",
        );
      }

      const controller = new AbortController();
      this.requestController = controller;
      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: localSdp,
        cache: "no-store",
        signal: controller.signal,
      });
      this.requestController = null;

      if (!response.ok) {
        throw new RealtimeClientError(
          "SESSION_REQUEST_FAILED",
          await safeResponseMessage(response),
        );
      }

      const answerSdp = (await response.text()).trim();
      if (!answerSdp) {
        throw new RealtimeClientError(
          "INVALID_SESSION_RESPONSE",
          "Máy chủ không trả về SDP answer hợp lệ.",
        );
      }

      if (this.closed) return;
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (error) {
      if (this.closed && error instanceof DOMException && error.name === "AbortError") return;
      const normalized = normalizeError(error, "PEER_CONNECTION_FAILED");
      this.emitConnection("failed");
      this.callbacks.onError?.(normalized);
      throw normalized;
    }
  }

  private handleDataChannelMessage(raw: unknown): void {
    if (this.closed || typeof raw !== "string") return;

    let decoded: unknown;
    try {
      decoded = JSON.parse(raw);
    } catch {
      return;
    }

    const event = parseRealtimeServerEvent(decoded);
    if (!event) return;
    if (event.type === "order") this.callbacks.onOrder?.(event);
    else if (event.type === "delta") this.callbacks.onDelta?.(event);
    else if (event.type === "completed") this.callbacks.onCompleted?.(event);
    else {
      this.callbacks.onError?.(
        new RealtimeClientError("SERVER_ERROR", event.message),
      );
    }
  }

  private setAudioTracksEnabled(enabled: boolean): void {
    for (const track of this.stream.getAudioTracks()) track.enabled = enabled;
  }

  private emitConnection(state: RealtimeConnectionState): void {
    if (this.lastConnectionState === state) return;
    this.lastConnectionState = state;
    this.callbacks.onConnection?.(state);
  }
}
