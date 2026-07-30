"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clipboard, Mic2, Search, Sparkles } from "lucide-react";

import { formatTimestamp } from "@/lib/summary";
import type { MeetingMode, MeetingStatus, TranscriptSegment } from "@/types/meeting";

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  interim: string;
  status: MeetingStatus;
  mode: MeetingMode;
  onCopy(): void;
}

export function TranscriptPanel({ segments, interim, status, mode, onCopy }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredSegments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    if (!normalizedQuery) return segments;
    return segments.filter((segment) =>
      segment.text.toLocaleLowerCase("vi").includes(normalizedQuery),
    );
  }, [query, segments]);

  useEffect(() => {
    if (query) return;
    const element = scrollRef.current;
    element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [interim, query, segments.length]);

  const copyTranscript = () => {
    onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  return (
    <section className="workspace-panel transcript-panel">
      <div className="workspace-panel__header">
        <div>
          <span className="eyebrow">Luồng trực tiếp</span>
          <h2>Live transcript</h2>
        </div>
        <div className="panel-actions">
          <label className="search-box">
            <Search aria-hidden="true" size={15} />
            <span className="sr-only">Tìm trong transcript</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm nội dung…"
              value={query}
            />
          </label>
          <button
            aria-label="Copy transcript"
            className="icon-button"
            data-tooltip="Copy transcript"
            onClick={copyTranscript}
            type="button"
          >
            {copied ? <Check size={17} /> : <Clipboard size={17} />}
          </button>
        </div>
      </div>

      <div className="audio-activity">
        <div className={`waveform${status === "recording" ? " waveform--active" : ""}`} aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span key={index} style={{ animationDelay: `${(index % 7) * -90}ms` }} />
          ))}
        </div>
        <div>
          <strong>
            {status === "recording" && mode === "demo"
              ? "Đang mô phỏng"
              : status === "recording"
                ? "Đang lắng nghe"
              : status === "paused"
                ? "Đã tạm dừng"
                : status === "connecting"
                  ? "Đang kết nối"
                  : status === "error"
                    ? "Transcription gặp lỗi"
                    : "Phiên đã kết thúc"}
          </strong>
          <small>
            {mode === "demo"
              ? "Transcript mô phỏng theo thời gian"
              : mode === "near-realtime"
                ? "Near real-time mode · xử lý theo từng đoạn ngắn"
                : mode === "history"
                  ? "Bản ghi đã lưu trên trình duyệt"
                  : "OpenAI Realtime · tiếng Việt + thuật ngữ kỹ thuật"}
          </small>
        </div>
      </div>

      <div aria-live="polite" className="transcript-scroll" ref={scrollRef}>
        {!segments.length && !interim ? (
          <div className="panel-empty-state">
            <span className="empty-orb">
              <Mic2 size={23} />
            </span>
            <h3>Transcript sẽ xuất hiện tại đây</h3>
            <p>MeetFlow chỉ giữ văn bản; raw audio và video không được lưu.</p>
          </div>
        ) : !filteredSegments.length && query ? (
          <div className="panel-empty-state panel-empty-state--compact">
            <Search size={22} />
            <h3>Không tìm thấy nội dung</h3>
            <p>Thử một từ khóa khác.</p>
          </div>
        ) : (
          <div className="transcript-list">
            {filteredSegments.map((segment) => (
              <article className="transcript-line" key={segment.id}>
                <time>{formatTimestamp(segment.startedAtMs)}</time>
                <p>{segment.text}</p>
              </article>
            ))}
            {!query && interim && (
              <article className="transcript-line transcript-line--interim">
                <span className="interim-icon">
                  <Sparkles size={14} />
                </span>
                <p>{interim}</p>
                <span className="typing-dots" aria-label="AI đang nhận dạng">
                  <i /> <i /> <i />
                </span>
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
