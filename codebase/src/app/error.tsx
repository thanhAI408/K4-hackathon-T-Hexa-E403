"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="fatal-state">
      <div className="fatal-state__card">
        <span className="eyebrow">MeetFlow AI</span>
        <h1>Không thể mở không gian cuộc họp</h1>
        <p>Dữ liệu của bạn vẫn nằm trong trình duyệt. Hãy thử tải lại giao diện.</p>
        <button className="button button--primary" onClick={reset} type="button">
          <RotateCcw size={17} /> Thử lại
        </button>
      </div>
    </main>
  );
}
