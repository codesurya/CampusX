require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ── Production-Grade CORS Configuration ────────────────────────────────────
// Supports: custom CLIENT_URL, comma-separated origins, Vercel deployments (*.vercel.app),
// and localhost for local development. Non-browser callers (curl, Render health check) pass through.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((u) => u.trim().replace(/\/+$/, ""))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health probes, uptime robots)
      if (!origin) return callback(null, true);

      // If CLIENT_URL is explicitly wildcard or unset in non-production
      if (process.env.CLIENT_URL === "*" || (!process.env.CLIENT_URL && process.env.NODE_ENV !== "production")) {
        return callback(null, true);
      }

      const normalized = origin.replace(/\/+$/, "");

      // Match explicit configured CLIENT_URL
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      // Automatically allow Vercel production and preview subdomains
      if (/\.vercel\.app$/.test(normalized)) {
        return callback(null, true);
      }

      // Allow localhost in development
      if (
        process.env.NODE_ENV !== "production" &&
        (normalized.includes("localhost") || normalized.includes("127.0.0.1"))
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ── Health Check & Root Endpoints (Required for Render & Monitoring) ───────
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "CampusX API",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "production",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CampusX API is healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CampusX API is healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Application API Routes ────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/routine", require("./routes/routine"));
app.use("/api/notices", require("./routes/notices"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/events", require("./routes/events"));
app.use("/api/clubs", require("./routes/clubs"));
app.use("/api/marketplace", require("./routes/marketplace"));
app.use("/api/lostfound", require("./routes/lostfound"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/admin", require("./routes/admin"));

// ── Database Connection & Server Startup ──────────────────────────────────
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.warn("WARNING: MONGO_URI environment variable is not defined!");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`CampusX server listening on port ${PORT} [0.0.0.0]`)
    );
  })
  .catch((err) => {
    console.error("DB connection error:", err.message);
  });
