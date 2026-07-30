export default function Loading() {
  return (
    <main className="page-shell" aria-busy="true" aria-label="Đang tải MeetFlow AI">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-grid">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </main>
  );
}
