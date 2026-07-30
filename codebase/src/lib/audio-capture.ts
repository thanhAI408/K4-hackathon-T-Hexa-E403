import type { AudioSource } from "@/types/meeting";

export type AudioCaptureErrorCode =
  | "UNSUPPORTED"
  | "PERMISSION_DENIED"
  | "NO_SYSTEM_AUDIO"
  | "NO_AUDIO_TRACK"
  | "AUDIO_CONTEXT_SUSPENDED"
  | "CAPTURE_FAILED";

export class AudioCaptureError extends Error {
  constructor(
    public readonly code: AudioCaptureErrorCode,
    message: string,
    public readonly canFallbackToMicrophone = false,
  ) {
    super(message);
    this.name = "AudioCaptureError";
  }
}

export interface AudioCapture {
  stream: MediaStream;
  source: AudioSource;
  setEnabled(enabled: boolean): void;
  stop(): Promise<void>;
}

interface CaptureOptions {
  onUnexpectedEnd?: () => void;
}

function stopStreams(streams: MediaStream[]): void {
  const tracks = new Set(streams.flatMap((stream) => stream.getTracks()));
  tracks.forEach((track) => track.stop());
}

function toCaptureError(error: unknown): AudioCaptureError {
  if (error instanceof AudioCaptureError) return error;
  if (error instanceof DOMException && ["NotAllowedError", "PermissionDeniedError"].includes(error.name)) {
    return new AudioCaptureError(
      "PERMISSION_DENIED",
      "Quyền ghi âm hoặc chia sẻ màn hình đã bị từ chối. Bạn có thể thử lại từ thanh địa chỉ của trình duyệt.",
    );
  }
  return new AudioCaptureError(
    "CAPTURE_FAILED",
    "Không thể mở nguồn âm thanh. Hãy kiểm tra thiết bị và thử lại trên Chrome desktop.",
  );
}

async function microphoneStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: true,
      echoCancellation: true,
      noiseSuppression: true,
    },
    video: false,
  });
}

async function displayStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
}

export async function captureAudio(
  source: AudioSource,
  options: CaptureOptions = {},
): Promise<AudioCapture> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    throw new AudioCaptureError(
      "UNSUPPORTED",
      "Trình duyệt này không hỗ trợ API thu âm. Hãy dùng Chrome desktop trên localhost hoặc HTTPS.",
    );
  }

  const inputStreams: MediaStream[] = [];
  let outputStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let intentionalStop = false;

  try {
    if (source === "microphone") {
      const microphone = await microphoneStream();
      inputStreams.push(microphone);
      outputStream = new MediaStream(microphone.getAudioTracks());
    } else {
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new AudioCaptureError(
          "UNSUPPORTED",
          "Trình duyệt không hỗ trợ chia sẻ âm thanh màn hình.",
          true,
        );
      }

      const display = await displayStream();
      inputStreams.push(display);
      const displayAudioTracks = display.getAudioTracks();
      if (!displayAudioTracks.length) {
        stopStreams(inputStreams);
        throw new AudioCaptureError(
          "NO_SYSTEM_AUDIO",
          "Nguồn chia sẻ không có audio. Hãy bật “Chia sẻ âm thanh” hoặc chuyển sang microphone.",
          true,
        );
      }

      const shareEndedTrack = display.getVideoTracks()[0] ?? displayAudioTracks[0];
      shareEndedTrack?.addEventListener(
        "ended",
        () => {
          if (!intentionalStop) options.onUnexpectedEnd?.();
        },
        { once: true },
      );

      if (source === "display") {
        outputStream = new MediaStream(displayAudioTracks);
      } else {
        const microphone = await microphoneStream();
        inputStreams.push(microphone);
        audioContext = new AudioContext();
        if (audioContext.state === "suspended") await audioContext.resume();
        if (audioContext.state !== "running") {
          throw new AudioCaptureError(
            "AUDIO_CONTEXT_SUSPENDED",
            "Bộ trộn âm thanh chưa được trình duyệt kích hoạt. Hãy bấm thử lại sau một thao tác người dùng.",
            true,
          );
        }

        const destination = audioContext.createMediaStreamDestination();
        audioContext.createMediaStreamSource(microphone).connect(destination);
        audioContext.createMediaStreamSource(display).connect(destination);
        outputStream = destination.stream;
      }
    }

    if (!outputStream || !outputStream.getAudioTracks().length) {
      throw new AudioCaptureError("NO_AUDIO_TRACK", "Không tìm thấy audio track trong nguồn đã chọn.");
    }
    const capturedStream = outputStream;

    return {
      stream: capturedStream,
      source,
      setEnabled(enabled: boolean) {
        const tracks = new Set(
          [capturedStream, ...inputStreams].flatMap((stream) => stream.getAudioTracks()),
        );
        tracks.forEach((track) => {
          track.enabled = enabled;
        });
      },
      async stop() {
        intentionalStop = true;
        stopStreams([capturedStream, ...inputStreams]);
        if (audioContext && audioContext.state !== "closed") await audioContext.close();
      },
    };
  } catch (error) {
    intentionalStop = true;
    stopStreams([...(outputStream ? [outputStream] : []), ...inputStreams]);
    if (audioContext && audioContext.state !== "closed") await audioContext.close();
    throw toCaptureError(error);
  }
}
