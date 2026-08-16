import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-mark">College Placement Cell</div>
        <h1>Sign in</h1>
        <p className="auth-sub">Access the registry with your issued credentials.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="role-hint-grid">
          <div className="role-hint">
            <span>Admin</span>
            <strong>registered email + password</strong>
          </div>
          <div className="role-hint">
            <span>Student</span>
            <strong>email + USN as password</strong>
          </div>
          <div className="role-hint">
            <span>Company / HR</span>
            <strong>email + issued password</strong>
          </div>
        </div>

        <div className="auth-switch">
          New admin account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}
