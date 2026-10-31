/**
 * Notices API routes
 * All routes are protected by the auth middleware (JWT).
 * Each user can only see/manage their own notices.
 *
 * GET    /api/notices         – list all notices for the logged-in user
 * GET    /api/notices/seed    – seed sample notices (only if user has 0 notices)
 * POST   /api/notices         – create a new notice
 * DELETE /api/notices/:id     – delete a notice (owner only)
 */
const router = require("express").Router();
const auth = require("../middleware/auth");
const Notice = require("../models/Notice");

// ── Sample notices used for seeding ────────────────────────────────────────
const SAMPLE_NOTICES = [
  {
    title: "Mid-Semester Exam Schedule Released",
    body: "The mid-semester examination schedule for all departments has been published. Exams will begin from November 15, 2026. Students are advised to check the timetable on the university portal and prepare accordingly.",
    category: "Exam",
    priority: "high",
    postedBy: "Examination Cell",
  },
  {
    title: "Diwali Holiday – Campus Closed",
    body: "The campus will remain closed from November 1 to November 5, 2026, on account of Diwali celebrations. The library and labs will reopen on November 6. Wishing everyone a happy and safe Diwali!",
    category: "Holiday",
    priority: "normal",
    postedBy: "Administration",
  },
  {
    title: "Guest Lecture on AI & Machine Learning",
    body: "A guest lecture by Dr. Priya Sharma from IIT Delhi on 'Advances in AI & ML' will be held on November 10, 2026, at 11:00 AM in Seminar Hall A. All CSE and IT students are encouraged to attend.",
    category: "Academic",
    priority: "normal",
    postedBy: "CSE Department",
  },
  {
    title: "TechFest 2026 Registration Open",
    body: "Registrations for TechFest 2026 are now open! Events include hackathon, coding contest, robotics challenge, and more. Last date to register is November 8, 2026. Visit the fest website for details.",
    category: "Event",
    priority: "high",
    postedBy: "TechFest Committee",
  },
  {
    title: "Library Timings Updated",
    body: "Effective from November 1, the central library will operate from 8:00 AM to 10:00 PM on weekdays and 9:00 AM to 6:00 PM on weekends. Digital library access remains available 24/7.",
    category: "General",
    priority: "normal",
    postedBy: "Central Library",
  },
  {
    title: "Scholarship Applications – Last Date Extended",
    body: "The last date for Merit-cum-Means scholarship applications has been extended to November 20, 2026. Eligible students must submit their documents to the Dean's office or upload them on the student portal.",
    category: "Academic",
    priority: "high",
    postedBy: "Scholarship Cell",
  },
];

// ── GET /api/notices – list user's notices ──────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const notices = await Notice.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notices" });
  }
});

// ── GET /api/notices/seed – seed sample notices for new users ───────────────
router.get("/seed", auth, async (req, res) => {
  try {
    const count = await Notice.countDocuments({ user: req.user.id });
    if (count > 0) {
      return res.json({ message: "Notices already exist", seeded: false });
    }
    // Create sample notices for this user
    const docs = SAMPLE_NOTICES.map((n) => ({ ...n, user: req.user.id }));
    const created = await Notice.insertMany(docs);
    res.status(201).json({ message: `Seeded ${created.length} sample notices`, seeded: true, notices: created });
  } catch (err) {
    res.status(500).json({ message: "Failed to seed notices" });
  }
});

// ── POST /api/notices – create a new notice ─────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { title, body, category, priority, postedBy } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ message: "Title must be 200 characters or less" });
    }
    if (body.trim().length > 2000) {
      return res.status(400).json({ message: "Description must be 2000 characters or less" });
    }

    const notice = await Notice.create({
      user: req.user.id,
      title: title.trim(),
      body: body.trim(),
      category: category || "General",
      priority: priority || "normal",
      postedBy: (postedBy && postedBy.trim()) || "Admin",
    });

    res.status(201).json(notice);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to create notice" });
  }
});

// ── DELETE /api/notices/:id – delete a notice (owner only) ──────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const notice = await Notice.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // ensures owner-only deletion
    });
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notice" });
  }
});

module.exports = router;

