import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetail from "./pages/admin/AdminStudentDetail";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminDrives from "./pages/admin/AdminDrives";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentDrives from "./pages/student/StudentDrives";
import StudentApplications from "./pages/student/StudentApplications";
import StudentInterviews from "./pages/student/StudentInterviews";
import StudentResults from "./pages/student/StudentResults";

import HRApplications from "./pages/hr/HRApplications";
import HRATSScan from "./pages/hr/HRATSScan";
import HRInterviewSlots from "./pages/hr/HRInterviewSlots";

function RootRedirect() {
  const { user, checking } = useAuth();
  if (checking) return <Loader label="Loading" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:usn"
          element={
            <ProtectedRoute role="admin">
              <AdminStudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute role="admin">
              <AdminCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drives"
          element={
            <ProtectedRoute role="admin">
              <AdminDrives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute role="admin">
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/drives"
          element={
            <ProtectedRoute role="student">
              <StudentDrives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute role="student">
              <StudentApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/interviews"
          element={
            <ProtectedRoute role="student">
              <StudentInterviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute role="student">
              <StudentResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr"
          element={
            <ProtectedRoute role="hr">
              <HRApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/ats"
          element={
            <ProtectedRoute role="hr">
              <HRATSScan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interviews"
          element={
            <ProtectedRoute role="hr">
              <HRInterviewSlots />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
