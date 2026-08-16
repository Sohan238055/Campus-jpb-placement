import { useState } from "react";
import api from "../../api/client";
import EmptyState from "../../components/EmptyState";

export default function StudentResults() {
  const [sem, setSem] = useState("1");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const { data } = await api.get(`/api/students/results/${sem}`);
      setResult(data.result);
    } catch (err) {
      setResult(null);
      setError(err?.response?.data?.message || "Result not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Academics</span>
          <h1>Results</h1>
          <div className="page-sub">Look up your published semester results.</div>
        </div>
      </div>

      <form onSubmit={fetchResult} className="btn-row" style={{ marginBottom: 24, alignItems: "flex-end" }}>
        <div className="field" style={{ marginBottom: 0, width: 140 }}>
          <label>Semester</label>
          <select value={sem} onChange={(e) => setSem(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Fetching…" : "View result"}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 17 }}>Semester {result.sem}</h3>
            <div style={{ fontSize: 13.5, color: "var(--slate)" }}>
              {result.percentage}% · CGPA {result.cgpa}
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
              {result.subjects.map((s, i) => (
                <tr key={i}>
                  <td>{s.subject}</td>
                  <td>{s.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!result && !error && searched && !loading && <EmptyState mark="⟡" title="No result to display" />}
    </div>
  );
}
