import { useEffect, useState } from "react";
import api, { fileUrl } from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const BLANK = { company: "", email: "", role: "", package: "", mincgpa: "", deadline: "", description: "" };

export default function AdminCompanies() {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/companies")
      .then((res) => setCompanies(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load companies"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm(BLANK);
    setLogoFile(null);
    setFormError("");
    setModalMode("add");
  };

  const openEdit = (c) => {
    setForm({
      company: c.company || "",
      email: c.email || "",
      role: c.role || "",
      package: c.package || "",
      mincgpa: c.mincgpa ?? "",
      deadline: c.deadline ? c.deadline.substring(0, 10) : "",
      description: c.description || ""
    });
    setEditId(c._id);
    setFormError("");
    setModalMode("edit");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "add") {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (logoFile) fd.append("logo", logoFile);
        const { data } = await api.post("/api/companies", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setNotice(`Company added. Default HR login password: ${data.defaultPassword}`);
      } else {
        await api.put(`/api/companies/${editId}`, form);
      }
      setModalMode(null);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/api/companies/${id}`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Administration</span>
          <h1>Companies</h1>
          <div className="page-sub">Recruiting companies and their HR accounts.</div>
        </div>
        <button className="btn btn-brass" onClick={openAdd}>
          + Add company
        </button>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice("")}>
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <Loader label="Loading companies" />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : companies.length === 0 ? (
        <EmptyState mark="⟡" title="No companies added yet" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th></th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Package</th>
                  <th>Min CGPA</th>
                  <th>Deadline</th>
                  <th>HR Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <img
                        src={fileUrl(`/api/companies/${c._id}/logo`)}
                        alt=""
                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                        style={{ width: 30, height: 30, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 3 }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.company}</td>
                    <td>{c.role || "—"}</td>
                    <td>{c.package || "—"}</td>
                    <td>{c.mincgpa ?? "—"}</td>
                    <td>{c.deadline || "—"}</td>
                    <td style={{ color: "var(--slate)" }}>{c.email}</td>
                    <td>
                      <div className="btn-row" style={{ marginTop: 0 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(c._id, c.company)}>
                          Delete
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

      {modalMode && (
        <Modal title={modalMode === "add" ? "Add company" : `Edit ${form.company}`} onClose={() => setModalMode(null)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="field">
                <label>Company name</label>
                <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="field">
                <label>HR email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Role offered</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="SDE-1" />
              </div>
              <div className="field">
                <label>Package</label>
                <input value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} placeholder="₹12 LPA" />
              </div>
              <div className="field">
                <label>Minimum CGPA</label>
                <input type="number" step="0.01" value={form.mincgpa} onChange={(e) => setForm({ ...form, mincgpa: e.target.value })} />
              </div>
              <div className="field">
                <label>Application deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Description / JD keywords</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Used by the ATS scanner to match resume skills" />
            </div>
            {modalMode === "add" && (
              <div className="field">
                <label>Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
              </div>
            )}
            <div className="btn-row">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save company"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setModalMode(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
