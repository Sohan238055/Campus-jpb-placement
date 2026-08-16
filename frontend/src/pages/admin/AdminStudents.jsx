import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { fileUrl } from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const BLANK = { usn: "", fullname: "", email: "", branch: "", sem: "", cgpa: "" };

export default function AdminStudents() {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [form, setForm] = useState(BLANK);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/students")
      .then((res) => setStudents(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load students"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const runSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/students/search", { params: { keyword } });
      setStudents(data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(BLANK);
    setPhotoFile(null);
    setFormError("");
    setModalMode("add");
  };

  const openEdit = (s) => {
    setForm({ usn: s.usn, fullname: s.fullname, email: s.email, branch: s.branch || "", sem: s.sem ?? "", cgpa: s.cgpa ?? "" });
    setPhotoFile(null);
    setFormError("");
    setModalMode("edit");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("fullname", form.fullname);
      fd.append("email", form.email);
      fd.append("branch", form.branch);
      fd.append("sem", form.sem);
      fd.append("cgpa", form.cgpa);
      if (photoFile) fd.append("photo", photoFile);

      if (modalMode === "add") {
        fd.append("usn", form.usn);
        await api.post("/api/admin/students", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.put(`/api/admin/students/${form.usn}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setModalMode(null);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (usn) => {
    if (!confirm(`Delete student ${usn}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/students/${usn}`);
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
          <h1>Students</h1>
          <div className="page-sub">Add, search, and maintain student records.</div>
        </div>
        <button className="btn btn-brass" onClick={openAdd}>
          + Add student
        </button>
      </div>

      <form onSubmit={runSearch} className="btn-row" style={{ marginBottom: 20 }}>
        <input
          className="field-input"
          style={{ flex: 1, minWidth: 220, border: "1px solid var(--line)", borderRadius: 3, padding: "9px 12px", background: "var(--paper-raised)" }}
          placeholder="Search by name…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="btn btn-outline" type="submit">
          Search
        </button>
        {keyword && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setKeyword("");
              load();
            }}
          >
            Reset
          </button>
        )}
      </form>

      {loading ? (
        <Loader label="Loading students" />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : students.length === 0 ? (
        <EmptyState mark="⟡" title="No students found" hint="Add a student to get started." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th></th>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Sem</th>
                  <th>CGPA</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <img
                        src={fileUrl(`/api/admin/students/${s.usn}/photo`)}
                        alt=""
                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--line)" }}
                      />
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{s.usn}</td>
                    <td>
                      <Link to={`/admin/students/${s.usn}`} style={{ fontWeight: 600, textDecoration: "none", color: "var(--ink)" }}>
                        {s.fullname}
                      </Link>
                    </td>
                    <td>{s.branch || "—"}</td>
                    <td>{s.sem ?? "—"}</td>
                    <td>{s.cgpa ?? "—"}</td>
                    <td style={{ color: "var(--slate)" }}>{s.email}</td>
                    <td>
                      <div className="btn-row" style={{ marginTop: 0 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(s.usn)}>
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
        <Modal title={modalMode === "add" ? "Add student" : `Edit ${form.usn}`} onClose={() => setModalMode(null)}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={submit}>
            <div className="form-grid">
              {modalMode === "add" && (
                <div className="field">
                  <label>USN</label>
                  <input required value={form.usn} onChange={(e) => setForm({ ...form, usn: e.target.value })} placeholder="1XX20CS000" />
                </div>
              )}
              <div className="field">
                <label>Full name</label>
                <input required value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Branch</label>
                <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="CSE" />
              </div>
              <div className="field">
                <label>Semester</label>
                <input type="number" min="1" max="8" value={form.sem} onChange={(e) => setForm({ ...form, sem: e.target.value })} />
              </div>
              <div className="field">
                <label>CGPA</label>
                <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Photo {modalMode === "edit" && "(leave blank to keep current)"}</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save student"}
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
