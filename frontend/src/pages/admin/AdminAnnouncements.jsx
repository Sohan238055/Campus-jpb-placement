import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

export default function AdminAnnouncements() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/announcements")
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load announcements"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post("/api/announcements", form);
      setForm({ title: "", message: "" });
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to post announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Administration</span>
          <h1>Announcements</h1>
          <div className="page-sub">Broadcast notices to every signed-in student and HR.</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea rows={3} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Posting…" : "Post announcement"}
          </button>
        </form>
      </div>

      {loading ? (
        <Loader label="Loading announcements" />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : items.length === 0 ? (
        <EmptyState mark="⟡" title="No announcements yet" />
      ) : (
        <div className="card card-pad">
          {items.map((a) => (
            <div key={a._id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: 13.5, color: "var(--slate)", marginTop: 4 }}>{a.message}</div>
              <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                {new Date(a.date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
