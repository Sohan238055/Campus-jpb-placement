import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

export default function StudentApplications() {
  const [apps, setApps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/applications")
      .then((res) => setApps(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading applications" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">My Record</span>
          <h1>Applications</h1>
          <div className="page-sub">Track the status of everything you've applied to.</div>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState mark="⟡" title="No applications yet" hint="Head to Drives to apply." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>ATS score</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.company}</td>
                    <td>{a.role}</td>
                    <td style={{ color: "var(--slate)" }}>{new Date(a.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>{a.atsScore != null ? `${a.atsScore}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
