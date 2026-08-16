import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const BLANK = { company: "", role: "", mincgpa: "", interviewDate: "", deadline: "", package: "", description: "" };

export default function AdminDrives() {
  const [drives, setDrives] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/drives")
      .then((res) => setDrives(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load drives"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/api/drives", form);
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to add drive");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Administration</span>
          <h1>Placement drives</h1>
          <div className="page-sub">Open a drive so eligible students can apply.</div>
        </div>
        <button className="btn btn-brass" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New drive"}
        </button>
      </div>

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="field">
                <label>Company</label>
                <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="field">
                <label>Role</label>
                <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div className="field">
                <label>Minimum CGPA</label>
                <input type="number" step="0.01" required value={form.mincgpa} onChange={(e) => setForm({ ...form, mincgpa: e.target.value })} />
              </div>
              <div className="field">
                <label>Package</label>
                <input value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} placeholder="₹10 LPA" />
              </div>
              <div className="field">
                <label>Interview date</label>
                <input type="date" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} />
              </div>
              <div className="field">
                <label>Application deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Description / requirements</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description used by the ATS resume scanner" />
            </div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Publishing…" : "Publish drive"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <Loader label="Loading drives" />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : drives.length === 0 ? (
        <EmptyState mark="⟡" title="No drives published yet" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Package</th>
                  <th>Min CGPA</th>
                  <th>Interview date</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {drives.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{d.company}</td>
                    <td>{d.role}</td>
                    <td>{d.package || "—"}</td>
                    <td>{d.mincgpa}</td>
                    <td>{d.interviewDate || "—"}</td>
                    <td>{d.deadline || "—"}</td>
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
