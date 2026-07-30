"use client";

import {
  Clipboard,
  Download,
  FileJson,
  Pause,
  Play,
  Square,
} from "lucide-react";

import { formatTimestamp } from "@/lib/summary";
import type { MeetingMode, MeetingStatus } from "@/types/meeting";

interface MeetingControlsProps {
  durationSeconds: number;
  status: MeetingStatus;
  mode: MeetingMode;
  readOnly: boolean;
  onPause(): void;
  onResume(): void;
  onEnd(): void;
  onCopy(): void;
  onExportMarkdown(): void;
  onExportJson(): void;
}

export function MeetingControls({
  durationSeconds,
  status,
  mode,
  readOnly,
  onPause,
  onResume,
  onEnd,
  onCopy,
  onExportMarkdown,
  onExportJson,
}: MeetingControlsProps) {
  const canPause = status === "recording";
  const canResume = status === "paused";
  const canEnd = ["recording", "paused", "connecting", "error"].includes(status);
  const timerLabel = readOnly
    ? "Đã kết thúc"
    : status === "error"
      ? "Transcription lỗi — hãy kết thúc để lưu"
      : status === "paused"
        ? "Đang tạm dừng"
        : status === "connecting"
          ? "Đang kết nối"
          : mode === "demo"
            ? "Đang mô phỏng"
            : "Đang ghi nhận";

  return (
    <footer className="meeting-controls">
      <div className="meeting-controls__timer" aria-label="Thời lượng cuộc họp">
        <span className={`record-dot${status === "recording" ? " record-dot--active" : ""}`} />
        <strong>{formatTimestamp(durationSeconds * 1_000)}</strong>
        <span>{timerLabel}</span>
      </div>

      {!readOnly && (
        <div className="meeting-controls__primary">
          {status === "error" ? (
            <span className="status-pill status-pill--warning">Đã dừng nhận dạng</span>
          ) : canPause ? (
            <button className="button button--control" onClick={onPause} type="button">
              <Pause size={17} /> Tạm dừng
            </button>
          ) : (
            <button
              className="button button--control"
              disabled={!canResume}
              onClick={onResume}
              type="button"
            >
              <Play size={17} /> Tiếp tục
            </button>
          )}
          <button
            className="button button--danger"
            disabled={!canEnd}
            onClick={onEnd}
            type="button"
          >
            <Square size={15} fill="currentColor" /> Kết thúc
          </button>
        </div>
      )}

      <div className="meeting-controls__exports">
        <button
          aria-label="Copy biên bản"
          className="icon-button"
          data-tooltip="Copy biên bản"
          onClick={onCopy}
          type="button"
        >
          <Clipboard size={17} />
        </button>
        <button
          aria-label="Tải Markdown"
          className="icon-button"
          data-tooltip="Tải Markdown"
          onClick={onExportMarkdown}
          type="button"
        >
          <Download size={17} />
        </button>
        <button
          aria-label="Tải JSON"
          className="icon-button"
          data-tooltip="Tải JSON"
          onClick={onExportJson}
          type="button"
        >
          <FileJson size={17} />
        </button>
      </div>
    </footer>
  );
}
