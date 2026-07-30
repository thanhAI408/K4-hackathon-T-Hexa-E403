"use client";

import { ArrowLeft, CloudOff, Laptop, Mic, Radio, Sparkles, Wifi, WifiOff } from "lucide-react";

import { MeetingControls } from "@/components/meeting-controls";
import { SummaryPanel } from "@/components/summary-panel";
import { TranscriptPanel } from "@/components/transcript-panel";
import type {
  ActionItem,
  Decision,
  MeetingSession,
  MeetingStatus,
} from "@/types/meeting";

interface MeetingWorkspaceProps {
  session: MeetingSession;
  status: MeetingStatus;
  interim: string;
  summaryLoading: boolean;
  onBack(): void;
  onPause(): void;
  onResume(): void;
  onEnd(): void;
  onCopyTranscript(): void;
  onCopyMinutes(): void;
  onExportMarkdown(): void;
  onExportJson(): void;
  onRefreshSummary(): void;
  onUpdateDecision(index: number, decision: Decision): void;
  onDeleteDecision(index: number): void;
  onUpdateActionItem(index: number, item: ActionItem): void;
  onDeleteActionItem(index: number): void;
}

export function MeetingWorkspace({
  session,
  status,
  interim,
  summaryLoading,
  onBack,
  onPause,
  onResume,
  onEnd,
  onCopyTranscript,
  onCopyMinutes,
  onExportMarkdown,
  onExportJson,
  onRefreshSummary,
  onUpdateDecision,
  onDeleteDecision,
  onUpdateActionItem,
  onDeleteActionItem,
}: MeetingWorkspaceProps) {
  const readOnly = status === "ended" || session.mode === "history";
  const connectionHealthy = ["recording", "paused"].includes(status);
  const isDemoActive = session.mode === "demo" && connectionHealthy;
  const connectionLabel = readOnly
    ? "Đã lưu"
    : status === "error"
      ? "Transcription lỗi"
      : isDemoActive
        ? "Đang mô phỏng"
        : connectionHealthy
          ? "Đã kết nối"
          : "Đang kết nối";

  return (
    <main className="meeting-page">
      <header className="meeting-header">
        <div className="meeting-header__left">
          <button
            aria-label="Quay lại trang chính"
            className="icon-button"
            data-tooltip="Quay lại"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="brand__mark brand__mark--small"><Sparkles size={16} /></span>
          <div className="meeting-title-block">
            <strong>{session.title}</strong>
            <small>MeetFlow AI</small>
          </div>
        </div>

        <div className="meeting-header__badges">
          {session.mode === "demo" && (
            <span className="status-pill status-pill--demo"><Sparkles size={13} /> Dữ liệu mô phỏng</span>
          )}
          {session.mode === "near-realtime" && (
            <span className="status-pill status-pill--warning"><CloudOff size={13} /> Near real-time mode</span>
          )}
          <span
            className={`status-pill${
              status === "error"
                ? " status-pill--warning"
                : connectionHealthy
                  ? " status-pill--online"
                  : ""
            }`}
          >
            {isDemoActive ? (
              <Sparkles size={13} />
            ) : connectionHealthy ? (
              <Wifi size={13} />
            ) : (
              <WifiOff size={13} />
            )}
            {connectionLabel}
          </span>
          <span className="status-pill">
            <AudioSourceIcon source={session.audioSource} />
            {session.mode === "demo"
              ? "Không dùng microphone"
              : session.audioSource === "mixed"
                ? "Mic + màn hình"
                : session.audioSource === "display"
                  ? "Âm thanh màn hình"
                  : "Microphone"}
          </span>
        </div>
      </header>

      <div className="workspace-grid">
        <TranscriptPanel
          interim={interim}
          mode={session.mode}
          onCopy={onCopyTranscript}
          segments={session.transcript}
          status={status}
        />
        <SummaryPanel
          canRefresh={session.transcript.length > 0}
          loading={summaryLoading}
          onDeleteActionItem={onDeleteActionItem}
          onDeleteDecision={onDeleteDecision}
          onRefresh={onRefreshSummary}
          onUpdateActionItem={onUpdateActionItem}
          onUpdateDecision={onUpdateDecision}
          source={session.summarySource}
          summary={session.summary}
        />
      </div>

      <MeetingControls
        durationSeconds={session.durationSeconds}
        onCopy={onCopyMinutes}
        onEnd={onEnd}
        onExportJson={onExportJson}
        onExportMarkdown={onExportMarkdown}
        onPause={onPause}
        onResume={onResume}
        readOnly={readOnly}
        mode={session.mode}
        status={status}
      />
    </main>
  );
}

function AudioSourceIcon({ source }: { source: MeetingSession["audioSource"] }) {
  if (source === "display") return <Laptop size={13} />;
  if (source === "mixed") return <Radio size={13} />;
  return <Mic size={13} />;
}
