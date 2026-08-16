# College Placement Backend

REST API backend for the React College Placement Management System.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and add your MongoDB connection string.

```bash
npm run dev
```

Server:

`http://localhost:5000`

Frontend:

`http://localhost:3000`

## Main API groups

- `/api/auth`
- `/api/admin`
- `/api/students`
- `/api/companies`
- `/api/drives`
- `/api/applications`
- `/api/interviews`
- `/api/announcements`
- `/api/ats`

## Important

Never commit `.env` or expose your MongoDB username/password in GitHub.
