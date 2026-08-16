import { useEffect, useState } from "react";
import api, { fileUrl } from "../../api/client";
import Loader from "../../components/Loader";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadErr, setUploadErr] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/api/students/profile")
      .then((res) => setStudent(res.data.student))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const uploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setUploading(true);
    setUploadErr("");
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("resume", resumeFile);
      const { data } = await api.post("/api/students/resume", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadMsg(`Uploaded: ${data.resumeName}`);
      setResumeFile(null);
      load();
    } catch (err) {
      setUploadErr(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader label="Loading profile" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">My Profile</span>
          <h1>{student.fullname}</h1>
          <div className="page-sub">{student.usn}</div>
        </div>
      </div>

      <div className="split-2">
        <div className="card card-pad">
          <h2 className="section-title">Academic record</h2>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
            <img
              src={fileUrl(`/api/students/${student.usn}/photo`)}
              alt=""
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              className="avatar-frame-lg"
            />
          </div>
          <dl style={{ margin: 0 }}>
            {[
              ["Email", student.email],
              ["Branch", student.branch || "—"],
              ["Semester", student.sem ?? "—"],
              ["CGPA", student.cgpa ?? "—"]
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid var(--line)" }}>
                <dt style={{ color: "var(--slate)", fontSize: 13 }}>{label}</dt>
                <dd style={{ margin: 0, fontWeight: 600, fontSize: 13.5 }}>{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card card-pad">
          <h2 className="section-title">Resume</h2>
          {student.resumeName ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13.5, marginBottom: 6 }}>
                Current file: <strong>{student.resumeName}</strong>
              </div>
              <a href={fileUrl("/api/students/resume")} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                View current resume
              </a>
            </div>
          ) : (
            <div style={{ fontSize: 13.5, color: "var(--slate)", marginBottom: 16 }}>No resume uploaded yet.</div>
          )}

          {uploadMsg && <div className="alert alert-success">{uploadMsg}</div>}
          {uploadErr && <div className="alert alert-error">{uploadErr}</div>}

          <form onSubmit={uploadResume}>
            <div className="field">
              <label>Upload new resume (PDF only)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} required />
              <small>Used by recruiters' ATS scanner — keep it text-based, not a scanned image.</small>
            </div>
            <button className="btn btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload resume"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
