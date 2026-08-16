import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function StudentDrives() {
  const [drives, setDrives] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [notice, setNotice] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [driveRes, appRes] = await Promise.all([api.get("/api/drives"), api.get("/api/applications")]);
      setDrives(driveRes.data.data);
      setApplications(appRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load drives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const appliedDriveIds = new Set(applications.map((a) => a.driveId));

  const apply = async (id) => {
    setApplyingId(id);
    try {
      await api.post(`/api/applications/apply/${id}`);
      setNotice({ id, type: "success", msg: "Application submitted" });
      const { data } = await api.get("/api/applications");
      setApplications(data.data);
    } catch (err) {
      setNotice({ id, type: "error", msg: err?.response?.data?.message || "Could not apply" });
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <Loader label="Loading drives" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Opportunities</span>
          <h1>Placement drives</h1>
          <div className="page-sub">Apply to drives you're eligible for based on CGPA.</div>
        </div>
      </div>

      {drives.length === 0 ? (
        <EmptyState mark="⟡" title="No drives open right now" />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {drives.map((d) => {
            const applied = appliedDriveIds.has(d._id);
            return (
              <div className="card card-pad" key={d._id} style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <h3 style={{ fontSize: 17 }}>{d.company}</h3>
                    <span style={{ fontSize: 12.5, color: "var(--slate)" }}>{d.role}</span>
                  </div>
                  {d.description && <p style={{ fontSize: 13, color: "var(--slate)", marginTop: 6, maxWidth: 560 }}>{d.description}</p>}
                  <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12.5, fontFamily: "var(--font-mono)", color: "var(--slate)" }}>
                    <span>Package: {d.package || "—"}</span>
                    <span>Min CGPA: {d.mincgpa}</span>
                    <span>Deadline: {d.deadline || "—"}</span>
                  </div>
                  {notice.id === d._id && (
                    <div className={`alert ${notice.type === "success" ? "alert-success" : "alert-error"}`} style={{ marginTop: 10, marginBottom: 0 }}>
                      {notice.msg}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button className="btn btn-brass" disabled={applied || applyingId === d._id} onClick={() => apply(d._id)}>
                    {applied ? "Applied" : applyingId === d._id ? "Applying…" : "Apply"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
