# College Placement Frontend

React (Vite) frontend for the College Placement Management System backend.

Matches the backend's three roles and every route in `app.js`:
`/api/auth`, `/api/admin`, `/api/students`, `/api/companies`, `/api/drives`,
`/api/applications`, `/api/interviews`, `/api/announcements`, `/api/ats`.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if your backend isn't on `http://localhost:5000`:

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:3000` (matches backend's `FRONTEND_URL` / CORS setting).

## Backend requirement

The backend uses `express-session` cookies for auth, so requests are sent with
`withCredentials: true`. Make sure the backend's CORS config allows your
frontend origin and `credentials: true` (it already does via `FRONTEND_URL`).

## Roles & login

- **Admin** — registers via the Register page, logs in with email + password.
- **Student** — created by an admin; logs in with email + their **USN** as the password.
- **Company / HR** — created by an admin (default password `company123`); logs in with email + password.

## Structure

```
src/
  api/client.js          axios instance (withCredentials)
  context/AuthContext.jsx session state via /api/auth/me
  components/            Layout, ProtectedRoute, Modal, StatusBadge, etc.
  pages/
    Login.jsx, Register.jsx
    admin/                Dashboard, Students (CRUD + results), Companies, Drives, Announcements
    student/               Dashboard, Profile + resume upload, Drives (apply), Applications,
                            Interviews (book slots), Results
    hr/                     Applications (shortlist/reject/select/schedule), ATS Scanner, Interview Slots
```

## Build

```bash
npm run build
```

Outputs static files to `dist/`.
