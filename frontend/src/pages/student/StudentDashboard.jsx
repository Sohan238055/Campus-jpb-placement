import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { fileUrl } from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/students/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { student, companiesList, myApplications, news } = data;

  return (
    <div>
      <div className="page-head">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <img
            src={fileUrl(`/api/students/${student.usn}/photo`)}
            alt=""
            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            className="avatar-frame"
          />
          <div>
            <span className="page-eyebrow">{student.usn}</span>
            <h1>Welcome, {student.fullname.split(" ")[0]}</h1>
            <div className="page-sub">
              {student.branch || "—"} · Sem {student.sem ?? "—"} · CGPA {student.cgpa ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{companiesList.length}</div>
          <div className="stat-label">Open drives</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{myApplications.length}</div>
          <div className="stat-label">My applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{myApplications.filter((a) => a.status === "Shortlisted" || a.status === "Interview Scheduled").length}</div>
          <div className="stat-label">Active interviews</div>
        </div>
      </div>

      <div className="split-2">
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title" style={{ marginBottom: 0, border: "none" }}>
              My recent applications
            </h2>
            <Link to="/student/applications" className="btn btn-outline btn-sm">
              View all
            </Link>
          </div>
          {myApplications.length === 0 ? (
            <EmptyState mark="⟡" title="No applications yet" hint="Browse open drives to apply." />
          ) : (
            <div style={{ marginTop: 10 }}>
              {myApplications.slice(0, 5).map((a) => (
                <div key={a._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.company}</div>
                    <div style={{ fontSize: 12.5, color: "var(--slate)" }}>{a.role}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-pad">
          <h2 className="section-title">Announcements</h2>
          {news.length === 0 ? (
            <EmptyState mark="⟡" title="Nothing posted yet" />
          ) : (
            news.slice(0, 5).map((a) => (
              <div key={a._id} style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 2 }}>{a.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
