"use client";

import { useId, useRef, useState } from "react";
import { Check, Laptop, Mic, Radio, Sparkles, X } from "lucide-react";

import { useDialogFocusTrap } from "@/lib/use-dialog-focus-trap";
import type { AudioSource } from "@/types/meeting";

interface StartMeetingDialogProps {
  open: boolean;
  aiConfigured: boolean;
  busy: boolean;
  error: string | null;
  onClose(): void;
  onStart(config: { title: string; source: AudioSource; demo: boolean }): void;
}

const SOURCES: Array<{
  value: AudioSource;
  icon: typeof Mic;
  label: string;
  description: string;
}> = [
  {
    value: "microphone",
    icon: Mic,
    label: "Chỉ microphone",
    description: "Phù hợp khi mọi người cùng ngồi trong một phòng.",
  },
  {
    value: "display",
    icon: Laptop,
    label: "Âm thanh màn hình",
    description: "Chọn tab/cửa sổ họp và bật Chia sẻ âm thanh.",
  },
  {
    value: "mixed",
    icon: Radio,
    label: "Microphone + màn hình",
    description: "Trộn giọng của bạn với âm thanh cuộc họp, không phát lại ra loa.",
  },
];

export function StartMeetingDialog({
  open,
  aiConfigured,
  busy,
  error,
  onClose,
  onStart,
}: StartMeetingDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("Họp phân công dự án hackathon");
  const [source, setSource] = useState<AudioSource>("mixed");
  const [consent, setConsent] = useState(false);

  useDialogFocusTrap(dialogRef, open, onClose, busy, firstInputRef);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={() => !busy && onClose()}>
      <section
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className="dialog-card"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-card__header">
          <div>
            <span className="eyebrow">Thiết lập nhanh</span>
            <h2 id={titleId}>Bắt đầu cuộc họp</h2>
          </div>
          <button
            aria-label="Đóng hộp thoại"
            className="icon-button"
            data-tooltip="Đóng"
            disabled={busy}
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <label className="field-label" htmlFor="meeting-title">
          Tên cuộc họp
        </label>
        <input
          ref={firstInputRef}
          className="text-input"
          id="meeting-title"
          maxLength={150}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ví dụ: Họp phân công dự án"
          value={title}
        />

        <fieldset className="source-picker">
          <legend>Nguồn âm thanh</legend>
          {SOURCES.map((option) => {
            const Icon = option.icon;
            const selected = source === option.value;
            return (
              <button
                aria-pressed={selected}
                className={`source-option${selected ? " source-option--selected" : ""}`}
                key={option.value}
                onClick={() => setSource(option.value)}
                type="button"
              >
                <span className="source-option__icon">
                  <Icon size={20} />
                </span>
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                {selected && <Check aria-hidden="true" className="source-option__check" size={17} />}
              </button>
            );
          })}
        </fieldset>

        <div className="browser-tip">
          <Laptop size={17} />
          <p>
            Dùng <strong>Chrome desktop</strong>. Khi chia sẻ tab hoặc cửa sổ, nhớ bật tùy chọn
            “Chia sẻ âm thanh”. MeetFlow không hiển thị hay tải video lên.
          </p>
        </div>

        <label className="consent-check">
          <input
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            type="checkbox"
          />
          <span>
            Tôi xác nhận: <strong>chỉ ghi âm khi tất cả người tham gia đã đồng ý.</strong>
          </span>
        </label>

        {!aiConfigured && (
          <div className="inline-notice inline-notice--warning">
            Chưa cấu hình OpenAI. Ghi âm thật đang tạm khóa; chế độ demo vẫn hoạt động đầy đủ với dữ liệu mô phỏng.
          </div>
        )}
        {error && (
          <div aria-live="assertive" className="inline-notice inline-notice--error">
            {error}
          </div>
        )}

        <div className="dialog-actions">
          <button
            className="button button--secondary"
            disabled={busy}
            onClick={() => onStart({ title: title.trim() || "Cuộc họp mới", source, demo: true })}
            type="button"
          >
            <Sparkles size={17} /> Dùng dữ liệu mô phỏng
          </button>
          <button
            className="button button--primary"
            disabled={!consent || !title.trim() || !aiConfigured || busy}
            onClick={() => onStart({ title: title.trim(), source, demo: false })}
            type="button"
          >
            {busy ? <span className="spinner" /> : <Mic size={17} />}
            {busy ? "Đang kết nối…" : "Bắt đầu ghi"}
          </button>
        </div>
      </section>
    </div>
  );
}
