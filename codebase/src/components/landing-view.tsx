"use client";

import {
  ArrowRight,
  Bot,
  CalendarClock,
  ChevronRight,
  Clock3,
  FileCheck2,
  History,
  LockKeyhole,
  Mic2,
  Moon,
  Pencil,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  WandSparkles,
} from "lucide-react";

import { formatTimestamp } from "@/lib/summary";
import type { MeetingSession } from "@/types/meeting";

interface LandingViewProps {
  aiConfigured: boolean;
  sessions: MeetingSession[];
  historyReady: boolean;
  darkMode: boolean;
  onToggleTheme(): void;
  onStart(): void;
  onDemo(): void;
  onOpenSession(session: MeetingSession): void;
  onRenameSession(session: MeetingSession): void;
  onDeleteSession(session: MeetingSession): void;
}

const STEPS = [
  {
    number: "01",
    icon: Mic2,
    title: "Chọn nguồn âm thanh",
    body: "Dùng microphone, âm thanh tab họp hoặc trộn cả hai ngay trong Chrome.",
  },
  {
    number: "02",
    icon: WandSparkles,
    title: "AI ghi nhận theo thời gian",
    body: "Transcript cập nhật liên tục, không cần bot tham gia phòng họp.",
  },
  {
    number: "03",
    icon: FileCheck2,
    title: "Ra quyết định, không chỉ ghi chép",
    body: "Nhận biên bản có quyết định, người phụ trách, deadline và câu hỏi mở.",
  },
];

export function LandingView({
  aiConfigured,
  sessions,
  historyReady,
  darkMode,
  onToggleTheme,
  onStart,
  onDemo,
  onOpenSession,
  onRenameSession,
  onDeleteSession,
}: LandingViewProps) {
  return (
    <main className="landing-page">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="site-header page-width">
        <a aria-label="MeetFlow AI — Trang chủ" className="brand" href="#top">
          <span className="brand__mark">
            <Sparkles size={20} />
          </span>
          <span>
            MeetFlow <strong>AI</strong>
          </span>
        </a>
        <nav aria-label="Điều hướng chính" className="site-header__actions">
          <span className={`api-status${aiConfigured ? " api-status--ready" : ""}`}>
            <i /> {aiConfigured ? "AI sẵn sàng" : "Demo sẵn sàng"}
          </span>
          <button
            aria-label={darkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            className="icon-button"
            data-tooltip={darkMode ? "Giao diện sáng" : "Giao diện tối"}
            onClick={onToggleTheme}
            type="button"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="button button--header" onClick={onStart} type="button">
            Bắt đầu cuộc họp <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      <section className="hero page-width" id="top">
        <div className="hero__copy">
          <div className="hero-badge">
            <span><Bot size={14} /> AI Meeting Copilot</span>
            <i />
            <span>Vietnamese-first</span>
          </div>
          <h1>
            Biến cuộc họp thành <span>quyết định</span> và hành động.
          </h1>
          <p className="hero__lead">
            MeetFlow AI lắng nghe cuộc họp, tạo transcript và liên tục cập nhật biên bản — để
            nhóm bạn nhớ đúng việc, đúng người, đúng hạn.
          </p>
          <div className="hero__actions">
            <button className="button button--primary button--large" onClick={onStart} type="button">
              <Mic2 size={18} /> Bắt đầu cuộc họp
            </button>
            <button className="button button--secondary button--large" onClick={onDemo} type="button">
              <Play fill="currentColor" size={16} /> Xem demo 30 giây
            </button>
          </div>
          <div className="trust-row">
            <span><LockKeyhole size={15} /> Không lưu audio</span>
            <span><ShieldCheck size={15} /> API key ở server</span>
            <span><History size={15} /> Lịch sử trên trình duyệt</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Xem trước meeting workspace">
          <div className="hero-visual__glow" />
          <div className="preview-window">
            <div className="preview-window__topbar">
              <div className="preview-logo"><Sparkles size={14} /></div>
              <span>Họp phân công dự án</span>
              <span className="preview-live"><i /> LIVE · 12:48</span>
            </div>
            <div className="preview-grid">
              <div className="preview-transcript">
                <div className="preview-panel-title">
                  <span>Live transcript</span><small>VI</small>
                </div>
                <PreviewLine time="12:42" text="Mình chốt dùng Next.js cho bản demo." />
                <PreviewLine time="12:44" text="Lan nhận frontend, Huy phụ trách AI integration." />
                <PreviewLine time="12:47" text="Deadline là 18 giờ thứ Sáu." active />
                <div className="preview-wave">
                  {Array.from({ length: 20 }, (_, index) => <i key={index} />)}
                </div>
              </div>
              <div className="preview-summary">
                <div className="preview-panel-title"><span>Biên bản AI</span><Sparkles size={13} /></div>
                <small>QUYẾT ĐỊNH</small>
                <p>Dùng Next.js App Router cho prototype.</p>
                <small>ACTION ITEMS</small>
                <div className="preview-task"><i /> <span><strong>Lan</strong> · Hoàn thiện frontend</span></div>
                <div className="preview-task"><i /> <span><strong>Huy</strong> · Tích hợp Realtime</span></div>
                <div className="preview-deadline"><CalendarClock size={13} /> Thứ Sáu · 18:00</div>
              </div>
            </div>
          </div>
          <div className="floating-chip floating-chip--privacy"><ShieldCheck size={15} /> Privacy-first</div>
          <div className="floating-chip floating-chip--ai"><Sparkles size={15} /> 3 action items</div>
        </div>
      </section>

      <section className="how-it-works page-width" aria-labelledby="how-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Từ lời nói đến việc làm</span>
            <h2 id="how-heading">Ba bước, không bỏ sót đầu việc</h2>
          </div>
          <p>Không cài bot, không cấu hình workspace phức tạp.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <article className="step-card" key={step.number}>
                <div className="step-card__top">
                  <span className="step-icon"><Icon size={21} /></span>
                  <small>{step.number}</small>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="recent-section page-width" aria-labelledby="recent-heading">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="eyebrow">Lưu cục bộ</span>
            <h2 id="recent-heading">Phiên họp gần đây</h2>
          </div>
          <span className="history-note"><History size={15} /> Chỉ trên trình duyệt này</span>
        </div>

        {!historyReady ? (
          <div className="recent-grid" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => <div className="skeleton skeleton-session" key={index} />)}
          </div>
        ) : sessions.length ? (
          <div className="recent-grid">
            {sessions.slice(0, 6).map((session) => (
              <article className="session-card" key={session.id}>
                <button className="session-card__main" onClick={() => onOpenSession(session)} type="button">
                  <span className="session-card__icon"><Clock3 size={19} /></span>
                  <span className="session-card__copy">
                    <strong>{session.title}</strong>
                    <small>
                      {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
                        new Date(session.startedAt),
                      )}
                    </small>
                    <span>{formatTimestamp(session.durationSeconds * 1_000)} · {session.transcript.length} đoạn</span>
                  </span>
                  <ChevronRight size={18} />
                </button>
                <div className="session-card__actions">
                  <button
                    aria-label={`Đổi tên ${session.title}`}
                    className="icon-button icon-button--quiet"
                    data-tooltip="Đổi tên"
                    onClick={() => onRenameSession(session)}
                    type="button"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    aria-label={`Xóa ${session.title}`}
                    className="icon-button icon-button--quiet icon-button--delete"
                    data-tooltip="Xóa phiên"
                    onClick={() => onDeleteSession(session)}
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="history-empty">
            <span className="empty-orb"><History size={23} /></span>
            <div>
              <h3>Chưa có phiên họp nào</h3>
              <p>Chạy demo hoặc bắt đầu một cuộc họp để thấy biên bản xuất hiện tại đây.</p>
            </div>
            <button className="button button--secondary" onClick={onDemo} type="button">
              <Sparkles size={16} /> Tạo phiên demo đầu tiên
            </button>
          </div>
        )}
      </section>

      <footer className="site-footer page-width">
        <span>MeetFlow AI · Hackathon MVP</span>
        <span>Ghi âm có đồng thuận · Không lưu audio/video</span>
      </footer>
    </main>
  );
}

function PreviewLine({ time, text, active = false }: { time: string; text: string; active?: boolean }) {
  return (
    <div className={`preview-line${active ? " preview-line--active" : ""}`}>
      <time>{time}</time><span>{text}</span>
    </div>
  );
}
