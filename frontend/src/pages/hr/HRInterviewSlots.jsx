import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function HRInterviewSlots() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ driveId: "", date: "", time: "", mode: "Online" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [driveRes, slotRes] = await Promise.all([api.get("/api/drives"), api.get("/api/interviews/slots/hr")]);
      setDrives(driveRes.data.data.filter((d) => d.company === user.company));
      setSlots(slotRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/api/interviews/slots", form);
      setForm({ driveId: form.driveId, date: "", time: "", mode: "Online" });
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create slot");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading slots" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Recruiting</span>
          <h1>Interview slots</h1>
          <div className="page-sub">Publish slots for shortlisted candidates to book.</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        {formError && <div className="alert alert-error">{formError}</div>}
        {drives.length === 0 ? (
          <EmptyState mark="⟡" title="No drives found for your company" hint="Ask the placement office to publish a drive first." />
        ) : (
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="field">
                <label>Drive</label>
                <select required value={form.driveId} onChange={(e) => setForm({ ...form, driveId: e.target.value })}>
                  <option value="">Select a drive</option>
                  {drives.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.role} — {d.company}
                    </option>
                  ))}
                </select>
              </div>
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
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Publishing…" : "Publish slot"}
            </button>
          </form>
        )}
      </div>

      {slots.length === 0 ? (
        <EmptyState mark="⟡" title="No slots published yet" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Booked by</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s._id}>
                    <td>{s.date}</td>
                    <td>{s.time}</td>
                    <td>{s.mode}</td>
                    <td>
                      <span className={`badge ${s.booked ? "badge-good" : "badge-neutral"}`}>{s.booked ? "Booked" : "Open"}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{s.studentUSN || "—"}</td>
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
