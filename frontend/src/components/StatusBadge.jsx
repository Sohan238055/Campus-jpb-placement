const MAP = {
  Applied: "badge-neutral",
  Shortlisted: "badge-good",
  "Interview Scheduled": "badge-warn",
  Selected: "badge-good",
  Rejected: "badge-bad"
};

export default function StatusBadge({ status }) {
  const cls = MAP[status] || "badge-neutral";
  return <span className={`badge ${cls}`}>{status || "Unknown"}</span>;
}
