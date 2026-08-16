import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function HRATSScan() {
  const [apps, setApps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanningId, setScanningId] = useState(null);
  const [result, setResult] = useState(null);
  const [scanErr, setScanErr] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/applications")
      .then((res) => setApps(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const scan = async (app) => {
    setScanningId(app._id);
    setScanErr("");
    setResult(null);
    try {
      const { data } = await api.get(`/api/ats/scan/${app.usn}/${app.driveId}`);
      setResult({ app, ...data });
    } catch (err) {
      setScanErr(err?.response?.data?.message || "Scan failed");
    } finally {
      setScanningId(null);
    }
  };

  if (loading) return <Loader label="Loading applicants" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Screening</span>
          <h1>ATS resume scanner</h1>
          <div className="page-sub">Match a candidate's resume against the drive's job description.</div>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState mark="⟡" title="No applicants to scan yet" />
      ) : (
        <div className="split-2">
          <div className="card">
            <div className="table-wrap">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>USN</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{a.usn}</td>
                      <td>{a.role}</td>
                      <td>
                        <button className="btn btn-brass btn-sm" disabled={scanningId === a._id} onClick={() => scan(a)}>
                          {scanningId === a._id ? "Scanning…" : "Scan resume"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {scanErr && <div className="alert alert-error">{scanErr}</div>}
            {!result && !scanErr && (
              <div className="card card-pad">
                <EmptyState mark="⟡" title="No scan yet" hint="Choose a candidate to see their ATS match." />
              </div>
            )}
            {result && (
              <div className="card card-pad">
                <h3 style={{ fontSize: 16 }}>{result.student.fullname}</h3>
                <div style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 16 }}>
                  {result.drive.company} · {result.drive.role}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
                  <div className="stat-num" style={{ fontSize: 40 }}>
                    {result.ats.score}%
                  </div>
                  <span className={`badge ${result.ats.score > 70 ? "badge-good" : "badge-warn"}`}>{result.ats.result}</span>
                </div>

                <div className="section-title">Matched skills</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {result.ats.matchedSkills.length === 0 ? (
                    <span style={{ fontSize: 12.5, color: "var(--slate)" }}>None</span>
                  ) : (
                    result.ats.matchedSkills.map((s) => (
                      <span key={s} className="badge badge-good">
                        {s}
                      </span>
                    ))
                  )}
                </div>

                <div className="section-title">Missing skills</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {result.ats.missingSkills.length === 0 ? (
                    <span style={{ fontSize: 12.5, color: "var(--slate)" }}>None</span>
                  ) : (
                    result.ats.missingSkills.map((s) => (
                      <span key={s} className="badge badge-bad">
                        {s}
                      </span>
                    ))
                  )}
                </div>

                <div className="divider" />
                <div style={{ fontSize: 12.5, color: "var(--slate)" }}>
                  Application status updated to: <strong style={{ color: "var(--ink)" }}>{result.application.status}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
