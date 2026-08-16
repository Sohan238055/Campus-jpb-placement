import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const s = data.stats;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Administration</span>
          <h1>Overview</h1>
          <div className="page-sub">Live counts across the placement registry.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{s.students}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{s.companies}</div>
          <div className="stat-label">Companies</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{s.drives}</div>
          <div className="stat-label">Drives</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{s.applications}</div>
          <div className="stat-label">Applications</div>
        </div>
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-title" style={{ marginBottom: 0, border: "none" }}>
            Recent announcements
          </h2>
          <Link to="/admin/announcements" className="btn btn-outline btn-sm">
            Manage
          </Link>
        </div>
        {data.announcements.length === 0 ? (
          <EmptyState mark="⟡" title="No announcements yet" />
        ) : (
          <div style={{ marginTop: 12 }}>
            {data.announcements.map((a) => (
              <div key={a._id} style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 3 }}>{a.message}</div>
                <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                  {new Date(a.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
