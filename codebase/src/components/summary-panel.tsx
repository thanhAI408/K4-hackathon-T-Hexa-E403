"use client";

import {
  Bot,
  CheckCircle2,
  CircleHelp,
  ListChecks,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import type { ActionItem, Decision, MeetingSummary, SummarySource } from "@/types/meeting";

interface SummaryPanelProps {
  summary: MeetingSummary;
  source: SummarySource;
  loading: boolean;
  canRefresh: boolean;
  onRefresh(): void;
  onUpdateDecision(index: number, decision: Decision): void;
  onDeleteDecision(index: number): void;
  onUpdateActionItem(index: number, item: ActionItem): void;
  onDeleteActionItem(index: number): void;
}

export function SummaryPanel({
  summary,
  source,
  loading,
  canRefresh,
  onRefresh,
  onUpdateDecision,
  onDeleteDecision,
  onUpdateActionItem,
  onDeleteActionItem,
}: SummaryPanelProps) {
  const hasContent = Boolean(
    summary.summary ||
      summary.keyPoints.length ||
      summary.decisions.length ||
      summary.actionItems.length ||
      summary.openQuestions.length,
  );

  return (
    <section className="workspace-panel summary-panel">
      <div className="workspace-panel__header">
        <div>
          <span className="eyebrow">Biên bản hành động</span>
          <h2>Tóm tắt hiện tại</h2>
        </div>
        <div className="summary-header-actions">
          {source !== "none" && (
            <span className={`provenance-badge provenance-badge--${source}`}>
              {source === "ai" ? <Bot size={13} /> : <Sparkles size={13} />}
              {source === "ai" ? "AI thật" : "Mock summary"}
            </span>
          )}
          <button
            className="button button--small"
            disabled={!canRefresh || loading}
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw className={loading ? "spin" : ""} size={15} />
            {loading ? "Đang xử lý" : "Cập nhật"}
          </button>
        </div>
      </div>

      {loading && !hasContent ? (
        <div className="summary-skeleton" aria-label="AI đang tạo tóm tắt" aria-busy="true">
          <div className="skeleton skeleton-line skeleton-line--wide" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line--short" />
          <div className="skeleton skeleton-block" />
          <div className="skeleton skeleton-block" />
        </div>
      ) : !hasContent ? (
        <div className="panel-empty-state">
          <span className="empty-orb empty-orb--violet">
            <Sparkles size={23} />
          </span>
          <h3>Chưa đủ nội dung để tóm tắt</h3>
          <p>Khi có thêm transcript, AI sẽ gom ý chính, quyết định và công việc cần làm.</p>
        </div>
      ) : (
        <div className="summary-scroll">
          <div className="summary-overview">
            <p>{summary.summary || "Chưa có tóm tắt tổng quan."}</p>
          </div>

          <SummarySection icon={ListChecks} title="Ý chính" count={summary.keyPoints.length}>
            {summary.keyPoints.length ? (
              <ul className="clean-list key-point-list">
                {summary.keyPoints.map((point, index) => (
                  <li key={`${point}-${index}`}>{point}</li>
                ))}
              </ul>
            ) : (
              <EmptyInline>Chưa ghi nhận ý chính.</EmptyInline>
            )}
          </SummarySection>

          <SummarySection icon={CheckCircle2} title="Quyết định" count={summary.decisions.length}>
            {summary.decisions.length ? (
              <div className="decision-list">
                {summary.decisions.map((decision, index) => (
                  <article className="editable-card" key={`${decision.content}-${index}`}>
                    <div className="editable-card__row">
                      <textarea
                        aria-label={`Nội dung quyết định ${index + 1}`}
                        defaultValue={decision.content}
                        onBlur={(event) => {
                          const content = event.target.value.trim();
                          if (content && content !== decision.content) {
                            onUpdateDecision(index, { ...decision, content });
                          }
                        }}
                        rows={2}
                      />
                      <button
                        aria-label={`Xóa quyết định ${index + 1}`}
                        className="icon-button icon-button--quiet"
                        data-tooltip="Xóa quyết định"
                        onClick={() => onDeleteDecision(index)}
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {decision.evidence && <blockquote>“{decision.evidence}”</blockquote>}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyInline>Chưa có quyết định đã thống nhất.</EmptyInline>
            )}
          </SummarySection>

          <SummarySection icon={ListChecks} title="Action items" count={summary.actionItems.length}>
            {summary.actionItems.length ? (
              <div className="action-list">
                {summary.actionItems.map((item, index) => (
                  <article
                    className="action-card"
                    key={`${item.task}-${item.owner ?? ""}-${item.deadline ?? ""}-${index}`}
                  >
                    <div className="editable-card__row">
                      <textarea
                        aria-label={`Công việc ${index + 1}`}
                        defaultValue={item.task}
                        onBlur={(event) => {
                          const task = event.target.value.trim();
                          if (task && task !== item.task) {
                            onUpdateActionItem(index, { ...item, task });
                          }
                        }}
                        rows={2}
                      />
                      <button
                        aria-label={`Xóa công việc ${index + 1}`}
                        className="icon-button icon-button--quiet"
                        data-tooltip="Xóa công việc"
                        onClick={() => onDeleteActionItem(index)}
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="action-meta">
                      <label>
                        <span>Phụ trách</span>
                        <input
                          defaultValue={item.owner ?? ""}
                          onBlur={(event) => {
                            const owner = event.target.value.trim() || null;
                            if (owner !== item.owner) onUpdateActionItem(index, { ...item, owner });
                          }}
                          placeholder="Chưa xác định"
                        />
                      </label>
                      <label>
                        <span>Deadline</span>
                        <input
                          defaultValue={item.deadline ?? ""}
                          onBlur={(event) => {
                            const deadline = event.target.value.trim() || null;
                            if (deadline !== item.deadline) {
                              onUpdateActionItem(index, { ...item, deadline });
                            }
                          }}
                          placeholder="Chưa xác định"
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyInline>Chưa có công việc được giao rõ ràng.</EmptyInline>
            )}
          </SummarySection>

          <SummarySection icon={CircleHelp} title="Câu hỏi mở" count={summary.openQuestions.length}>
            {summary.openQuestions.length ? (
              <ul className="clean-list question-list">
                {summary.openQuestions.map((question, index) => (
                  <li key={`${question}-${index}`}>{question}</li>
                ))}
              </ul>
            ) : (
              <EmptyInline>Không có câu hỏi chưa giải quyết.</EmptyInline>
            )}
          </SummarySection>
        </div>
      )}
    </section>
  );
}

function SummarySection({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="summary-section">
      <header>
        <span>
          <Icon size={16} /> {title}
        </span>
        <small>{count}</small>
      </header>
      {children}
    </section>
  );
}

function EmptyInline({ children }: { children: React.ReactNode }) {
  return <p className="empty-inline">{children}</p>;
}
