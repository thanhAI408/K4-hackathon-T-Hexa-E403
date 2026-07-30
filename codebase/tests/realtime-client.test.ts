import { describe, expect, it, vi } from "vitest";

import {
  RealtimeTranscriptionClient,
  parseRealtimeServerEvent,
  type RealtimeConnectionState,
} from "@/lib/realtime-client";

function audioTrack(): MediaStreamTrack {
  return { enabled: true } as MediaStreamTrack;
}

function audioStream(track = audioTrack()): MediaStream {
  return { getAudioTracks: () => [track] } as unknown as MediaStream;
}

class FakeDataChannel {
  readyState: RTCDataChannelState = "open";
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;
  close = vi.fn(() => {
    this.readyState = "closed";
  });
}

class FakePeerConnection {
  connectionState: RTCPeerConnectionState = "new";
  localDescription: RTCSessionDescription | null = null;
  onconnectionstatechange: ((event: Event) => void) | null = null;
  readonly channel = new FakeDataChannel();
  readonly addTrack = vi.fn();
  readonly close = vi.fn(() => {
    this.connectionState = "closed";
  });
  readonly createDataChannel = vi.fn(() => this.channel as unknown as RTCDataChannel);
  readonly createOffer = vi.fn(async () => ({ type: "offer", sdp: "offer-sdp" }) as RTCSessionDescriptionInit);
  readonly setLocalDescription = vi.fn(async (description: RTCSessionDescriptionInit) => {
    this.localDescription = description as RTCSessionDescription;
  });
  readonly setRemoteDescription = vi.fn(async () => undefined);
}

describe("parseRealtimeServerEvent", () => {
  it("parses conversation order before asynchronous transcription completes", () => {
    expect(
      parseRealtimeServerEvent({
        type: "input_audio_buffer.committed",
        item_id: "item-a",
        previous_item_id: null,
      }),
    ).toEqual({ type: "order", itemId: "item-a", previousItemId: null });

    expect(
      parseRealtimeServerEvent({
        type: "input_audio_buffer.committed",
        item_id: "item-b",
        previous_item_id: "item-a",
      }),
    ).toEqual({ type: "order", itemId: "item-b", previousItemId: "item-a" });

    expect(
      parseRealtimeServerEvent({
        type: "conversation.item.created",
        previous_item_id: "item-b",
        item: { id: "item-c", type: "message" },
      }),
    ).toEqual({ type: "order", itemId: "item-c", previousItemId: "item-b" });

    expect(
      parseRealtimeServerEvent({
        type: "conversation.item.added",
        previous_item_id: "item-c",
        item: { id: "item-d", type: "message" },
      }),
    ).toEqual({ type: "order", itemId: "item-d", previousItemId: "item-c" });
  });

  it("uses item_id and content_index as the stable event key", () => {
    expect(
      parseRealtimeServerEvent({
        type: "conversation.item.input_audio_transcription.delta",
        item_id: "item-7",
        content_index: 2,
        delta: "Xin ",
      }),
    ).toEqual({
      type: "delta",
      key: "item-7:2",
      itemId: "item-7",
      contentIndex: 2,
      text: "Xin ",
    });

    expect(
      parseRealtimeServerEvent({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "item-7",
        content_index: 2,
        transcript: "Xin chào",
      }),
    ).toEqual({
      type: "completed",
      key: "item-7:2",
      itemId: "item-7",
      contentIndex: 2,
      text: "Xin chào",
    });
  });

  it("ignores unknown and malformed events", () => {
    expect(parseRealtimeServerEvent({ type: "session.created" })).toBeNull();
    expect(
      parseRealtimeServerEvent({
        type: "conversation.item.input_audio_transcription.delta",
        item_id: "",
        content_index: 0,
        delta: "ignored",
      }),
    ).toBeNull();
  });

  it("turns an official transcription failed event into a safe client error", () => {
    expect(
      parseRealtimeServerEvent({
        type: "conversation.item.input_audio_transcription.failed",
        item_id: "item-9",
        content_index: 0,
        error: { message: "upstream detail must not be rendered" },
      }),
    ).toEqual({
      type: "error",
      message: "Một đoạn âm thanh không thể được nhận dạng. Đang chuyển sang chế độ dự phòng.",
    });
  });
});

describe("RealtimeTranscriptionClient", () => {
  it("posts raw SDP, dispatches transcript callbacks, pauses and closes idempotently", async () => {
    const peer = new FakePeerConnection();
    const track = audioTrack();
    track.enabled = false;
    const states: RealtimeConnectionState[] = [];
    const onOrder = vi.fn();
    const onDelta = vi.fn();
    const onCompleted = vi.fn();
    const onError = vi.fn();
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.headers).toEqual({ "Content-Type": "application/sdp" });
      expect(init?.body).toBe("offer-sdp");
      return new Response("answer-sdp", { status: 200 });
    }) as unknown as typeof fetch;

    const client = new RealtimeTranscriptionClient({
      stream: audioStream(track),
      fetchImpl,
      peerConnectionFactory: () => peer as unknown as RTCPeerConnection,
      onConnection: (state) => states.push(state),
      onOrder,
      onDelta,
      onCompleted,
      onError,
    });

    await client.connect();
    expect(track.enabled).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/realtime/session",
      expect.objectContaining({ method: "POST", body: "offer-sdp" }),
    );
    expect(peer.setRemoteDescription).toHaveBeenCalledWith({
      type: "answer",
      sdp: "answer-sdp",
    });

    peer.channel.onmessage?.({
      data: JSON.stringify({
        type: "input_audio_buffer.committed",
        item_id: "item-1",
        previous_item_id: null,
      }),
    } as MessageEvent);
    peer.channel.onmessage?.({
      data: JSON.stringify({
        type: "conversation.item.input_audio_transcription.delta",
        item_id: "item-1",
        content_index: 0,
        delta: "Chào",
      }),
    } as MessageEvent);
    peer.channel.onmessage?.({
      data: JSON.stringify({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "item-1",
        content_index: 0,
        transcript: "Chào cả nhóm",
      }),
    } as MessageEvent);

    expect(onOrder).toHaveBeenCalledWith({
      type: "order",
      itemId: "item-1",
      previousItemId: null,
    });
    expect(onDelta).toHaveBeenCalledWith(expect.objectContaining({ key: "item-1:0" }));
    expect(onCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ key: "item-1:0", text: "Chào cả nhóm" }),
    );

    peer.channel.onmessage?.({
      data: JSON.stringify({
        type: "conversation.item.input_audio_transcription.failed",
        item_id: "item-2",
        content_index: 0,
      }),
    } as MessageEvent);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SERVER_ERROR" }),
    );

    client.pause();
    expect(track.enabled).toBe(false);
    client.resume();
    expect(track.enabled).toBe(true);

    client.close();
    client.close();
    expect(track.enabled).toBe(false);
    expect(peer.close).toHaveBeenCalledTimes(1);
    expect(peer.channel.close).toHaveBeenCalledTimes(1);
    expect(states).toEqual(["connecting", "closed"]);
  });
});
