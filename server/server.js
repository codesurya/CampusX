require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/", (req, res) => res.send("CampusX API running"));
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

// Connection options – Node.js v26 ships with a newer OpenSSL that can
// cause TLS handshake failures with MongoDB Atlas.  Setting tls: true and
// tlsAllowInvalidCertificates: true works around the SSL alert error.
mongoose
  .connect(process.env.MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("DB connection error:", err.message));
    