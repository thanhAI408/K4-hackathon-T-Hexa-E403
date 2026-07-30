"use client";

import { useId, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";

import { useDialogFocusTrap } from "@/lib/use-dialog-focus-trap";
import type { MeetingSession } from "@/types/meeting";

interface RenameDialogProps {
  session: MeetingSession | null;
  onClose(): void;
  onConfirm(title: string): void;
}

export function RenameDialog({ session, onClose, onConfirm }: RenameDialogProps) {
  if (!session) return null;
  return (
    <RenameDialogContent
      key={session.id}
      onClose={onClose}
      onConfirm={onConfirm}
      session={session}
    />
  );
}

function RenameDialogContent({ session, onClose, onConfirm }: Omit<RenameDialogProps, "session"> & { session: MeetingSession }) {
  const [title, setTitle] = useState(session.title);
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDialogFocusTrap(dialogRef, true, onClose, false, inputRef);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className="dialog-card dialog-card--small"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-card__header">
          <div><span className="eyebrow">Lịch sử</span><h2 id={titleId}>Đổi tên phiên họp</h2></div>
          <button aria-label="Đóng" className="icon-button" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <label className="field-label" htmlFor="rename-title">Tên mới</label>
        <input
          ref={inputRef}
          className="text-input"
          id="rename-title"
          maxLength={150}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && title.trim()) onConfirm(title.trim());
          }}
          value={title}
        />
        <div className="dialog-actions dialog-actions--end">
          <button className="button button--ghost" onClick={onClose} type="button">Hủy</button>
          <button className="button button--primary" disabled={!title.trim()} onClick={() => onConfirm(title.trim())} type="button">Lưu tên</button>
        </div>
      </section>
    </div>
  );
}

interface DeleteDialogProps {
  session: MeetingSession | null;
  onClose(): void;
  onConfirm(): void;
}

export function DeleteDialog({ session, onClose, onConfirm }: DeleteDialogProps) {
  if (!session) return null;
  return (
    <DeleteDialogContent
      key={session.id}
      onClose={onClose}
      onConfirm={onConfirm}
      session={session}
    />
  );
}

function DeleteDialogContent({ session, onClose, onConfirm }: Omit<DeleteDialogProps, "session"> & { session: MeetingSession }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useDialogFocusTrap(dialogRef, true, onClose, false, cancelRef);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className="dialog-card dialog-card--small"
        role="alertdialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="danger-icon"><Trash2 size={22} /></div>
        <h2 id={titleId}>Xóa phiên họp này?</h2>
        <p className="dialog-description">
          “{session.title}” sẽ bị xóa khỏi trình duyệt này. Thao tác không thể hoàn tác.
        </p>
        <div className="dialog-actions dialog-actions--end">
          <button ref={cancelRef} className="button button--ghost" onClick={onClose} type="button">Giữ lại</button>
          <button className="button button--danger" onClick={onConfirm} type="button"><Trash2 size={16} /> Xóa phiên</button>
        </div>
      </section>
    </div>
  );
}
