import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

export default function HRApplications() {
  const [apps, setApps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [scheduling, setScheduling] = useState(null);
  const [form, setForm] = useState({ date: "", time: "", mode: "Online" });
  const [formErr, setFormErr] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/applications")
      .then((res) => setApps(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load applications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id, action) => {
    setBusyId(id + action);
    try {
      await api.patch(`/api/applications/${id}/${action}`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const submitSchedule = async (e) => {
    e.preventDefault();
    setFormErr("");
    try {
      await api.patch(`/api/applications/${scheduling._id}/interview`, form);
      setScheduling(null);
      setForm({ date: "", time: "", mode: "Online" });
      load();
    } catch (err) {
      setFormErr(err?.response?.data?.message || "Failed to schedule");
    }
  };

  if (loading) return <Loader label="Loading applications" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Recruiting</span>
          <h1>Applications</h1>
          <div className="page-sub">Applicants for your company's open drives.</div>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState mark="⟡" title="No applications yet" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>USN</th>
                  <th>Role</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>ATS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{a.usn}</td>
                    <td>{a.role}</td>
                    <td style={{ color: "var(--slate)" }}>{new Date(a.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>{a.atsScore != null ? `${a.atsScore}%` : "—"}</td>
                    <td>
                      <div className="btn-row" style={{ marginTop: 0 }}>
                        <button className="btn btn-outline btn-sm" disabled={busyId === a._id + "shortlist"} onClick={() => act(a._id, "shortlist")}>
                          Shortlist
                        </button>
                        <button className="btn btn-outline btn-sm" disabled={busyId === a._id + "select"} onClick={() => act(a._id, "select")}>
                          Select
                        </button>
                        <button className="btn btn-danger btn-sm" disabled={busyId === a._id + "reject"} onClick={() => act(a._id, "reject")}>
                          Reject
                        </button>
                        <button className="btn btn-brass btn-sm" onClick={() => setScheduling(a)}>
                          Schedule
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scheduling && (
        <Modal title={`Schedule interview — ${scheduling.name}`} subtitle={scheduling.usn} onClose={() => setScheduling(null)}>
          {formErr && <div className="alert alert-error">{formErr}</div>}
          <form onSubmit={submitSchedule}>
            <div className="form-grid">
              <div className="field">
                <label>Date</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="field">
                <label>Time</label>
                <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="field">
                <label>Mode</label>
                <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  <option>Online</option>
                  <option>In-person</option>
                  <option>Telephonic</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary">Confirm schedule</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
