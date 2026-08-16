import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { fileUrl } from "../../api/client";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const RESULT_BLANK = {
  semester: "",
  sub1: "",
  mark1: "",
  sub2: "",
  mark2: "",
  sub3: "",
  mark3: "",
  sub4: "",
  mark4: "",
  sub5: "",
  mark5: "",
  sub6: "",
  mark6: "",
  percentage: "",
  cgpa: ""
};

export default function AdminStudentDetail() {
  const { usn } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(RESULT_BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(`/api/admin/students/${usn}`)
      .then((res) => setStudent(res.data.student))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load student"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [usn]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submitResult = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await api.post(`/api/admin/students/${usn}/results`, form);
      setForm(RESULT_BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to add result");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading student" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <Link to="/admin/students" style={{ fontSize: 12.5, color: "var(--slate)", textDecoration: "none" }}>
        ← Back to students
      </Link>

      <div className="page-head" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <img
            src={fileUrl(`/api/admin/students/${usn}/photo`)}
            alt=""
            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            className="avatar-frame-lg"
          />
          <div>
            <span className="page-eyebrow">{student.usn}</span>
            <h1>{student.fullname}</h1>
            <div className="page-sub">
              {student.branch || "—"} · Sem {student.sem ?? "—"} · CGPA {student.cgpa ?? "—"} · {student.email}
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-title" style={{ marginBottom: 0, border: "none" }}>
            Semester results
          </h2>
          <button className="btn btn-brass btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ Add result"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitResult} style={{ marginTop: 16 }}>
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-grid">
              <div className="field">
                <label>Semester</label>
                <input type="number" min="1" max="8" required value={form.semester} onChange={update("semester")} />
              </div>
              <div className="field">
                <label>Percentage</label>
                <input type="number" step="0.01" required value={form.percentage} onChange={update("percentage")} />
              </div>
              <div className="field">
                <label>CGPA</label>
                <input type="number" step="0.01" required value={form.cgpa} onChange={update("cgpa")} />
              </div>
            </div>
            <div className="section-title" style={{ marginTop: 8 }}>
              Subjects
            </div>
            <div className="form-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} style={{ display: "flex", gap: 8 }}>
                  <div className="field" style={{ flex: 2 }}>
                    <label>Subject {n}</label>
                    <input required value={form[`sub${n}`]} onChange={update(`sub${n}`)} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Marks</label>
                    <input type="number" required value={form[`mark${n}`]} onChange={update(`mark${n}`)} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save result"}
            </button>
          </form>
        )}
      </div>

      {(!student.results || student.results.length === 0) ? (
        <EmptyState mark="⟡" title="No results published yet" />
      ) : (
        [...student.results].sort((a, b) => b.sem - a.sem).map((r, i) => (
          <div className="card card-pad" key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ fontSize: 16 }}>Semester {r.sem}</h3>
              <div style={{ fontSize: 13, color: "var(--slate)" }}>
                {r.percentage}% · CGPA {r.cgpa}
              </div>
            </div>
            <table className="ledger results-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {r.subjects.map((sub, j) => (
                  <tr key={j}>
                    <td>{sub.subject}</td>
                    <td>{sub.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
