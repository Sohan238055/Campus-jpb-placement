import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  admin: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/companies", label: "Companies" },
    { to: "/admin/drives", label: "Drives" },
    { to: "/admin/announcements", label: "Announcements" }
  ],
  student: [
    { to: "/student", label: "Dashboard", end: true },
    { to: "/student/profile", label: "Profile" },
    { to: "/student/drives", label: "Drives" },
    { to: "/student/applications", label: "Applications" },
    { to: "/student/interviews", label: "Interviews" },
    { to: "/student/results", label: "Results" }
  ],
  hr: [
    { to: "/hr", label: "Applications", end: true },
    { to: "/hr/ats", label: "ATS Scanner" },
    { to: "/hr/interviews", label: "Interview Slots" }
  ]
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">Placement Cell</span>
            <span className="brand-tag">Registry</span>
          </NavLink>

          <nav className="nav-links">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="session-chip">
            <span className="role-tag">{user?.role}</span>
            <span style={{ fontSize: 13, color: "rgba(243,241,234,0.85)" }}>{user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
