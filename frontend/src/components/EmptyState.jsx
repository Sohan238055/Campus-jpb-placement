export default function EmptyState({ mark = "—", title, hint }) {
  return (
    <div className="empty-state">
      <div className="eyebrow">{mark}</div>
      <div style={{ fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      {hint && <div style={{ fontSize: 12.5, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
