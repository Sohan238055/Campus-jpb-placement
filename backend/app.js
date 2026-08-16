require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const driveRoutes = require("./routes/driveRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const atsRoutes = require("./routes/atsRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Required on Vercel (and most serverless hosts) so that req.secure /
// the "x-forwarded-proto" header is honored, which express-session
// needs in order to set secure cookies correctly.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless functions spin up fresh instances per request, so we can't
// rely on connectDB() having already run at boot (like server.js does
// for local dev). This makes sure a DB connection exists before any
// route handler runs. connectDB() is cached internally, so this is a
// cheap no-op after the first call on a warm instance.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "placementportal",
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGO_URI
      ? MongoStore.create({
          mongoUrl: process.env.MONGO_URI,
          dbName: process.env.DB_NAME || "college",
          collectionName: "sessions",
          ttl: 60 * 60 * 24 * 7 // 7 days
        })
      : undefined, // falls back to in-memory store only if no Mongo URI (e.g. tests)
    cookie: {
      httpOnly: true,
      // In production, frontend and backend live on different Vercel
      // domains, so the cookie must be marked secure + SameSite=None
      // or browsers will silently drop it on cross-site requests.
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "College Placement Management API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/ats", atsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

module.exports = app;
