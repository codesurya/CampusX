/**
 * Admin Panel API Routes
 * Strictly protected by the adminAuth middleware.
 * Only verified accounts with role === "admin" in MongoDB can access these endpoints.
 */
const router = require("express").Router();
const adminAuth = require("../middleware/adminAuth");

// Models
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Routine = require("../models/Routine");
const Notice = require("../models/Notice");
const Note = require("../models/Note");
const Event = require("../models/Event");
const Club = require("../models/Club");
const MarketplaceItem = require("../models/MarketplaceItem");
const LostFound = require("../models/LostFound");

// Enforce adminAuth on ALL routes in this file
router.use(adminAuth);

// ── 1. DASHBOARD STATS ──────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalAttendance,
      totalRoutine,
      totalNotices,
      totalNotes,
      totalEvents,
      totalClubs,
      totalMarketplace,
      totalLostFound,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      Attendance.countDocuments(),
      Routine.countDocuments(),
      Notice.countDocuments(),
      Note.countDocuments(),
      Event.countDocuments(),
      Club.countDocuments(),
      MarketplaceItem.countDocuments(),
      LostFound.countDocuments(),
    ]);

    res.json({
      users: { total: totalUsers, students: totalStudents, admins: totalAdmins },
      academic: { attendance: totalAttendance, routines: totalRoutine, notes: totalNotes },
      campus: { notices: totalNotices, events: totalEvents, clubs: totalClubs },
      services: { marketplace: totalMarketplace, lostfound: totalLostFound },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin statistics", error: err.message });
  }
});

// ── 2. USER MANAGEMENT ──────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { q, role } = req.query;
    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { collegeId: regex }, { branch: regex }];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user accounts" });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'student' or 'admin'." });
    }

    // Safety: prevent admin from demoting themselves to avoid accidental lockout
    if (req.params.id === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "Self-demotion prohibited. Another admin must perform this action." });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: `Role updated to ${role}`, user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own active administrator account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up related private data
    await Promise.all([
      Attendance.deleteMany({ user: req.params.id }),
      Routine.deleteMany({ user: req.params.id }),
    ]);

    res.json({ message: `User ${user.email} and associated academic records deleted.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user account" });
  }
});

// ── 3. NOTICES MANAGEMENT ───────────────────────────────────────────────────
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notices" });
  }
});

router.post("/notices", async (req, res) => {
  try {
    const { title, body, category, priority, postedBy } = req.body;
    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const notice = await Notice.create({
      user: req.user.id,
      title: title.trim(),
      body: body.trim(),
      category: category || "General",
      priority: priority || "normal",
      postedBy: (postedBy && postedBy.trim()) || "Campus Administration",
    });

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: "Failed to create notice" });
  }
});

router.patch("/notices/:id", async (req, res) => {
  try {
    const { title, body, category, priority, postedBy } = req.body;
    const updates = {};
    if (title) updates.title = title.trim();
    if (body) updates.body = body.trim();
    if (category) updates.category = category;
    if (priority) updates.priority = priority;
    if (postedBy) updates.postedBy = postedBy.trim();

    const updated = await Notice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Notice not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notice" });
  }
});

router.delete("/notices/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notice" });
  }
});

// ── 4. CLASS ROUTINES MANAGEMENT ────────────────────────────────────────────
router.get("/routines", async (req, res) => {
  try {
    const routines = await Routine.find().populate("user", "name email branch").sort({ day: 1, startTime: 1 });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ message: "Failed to load routines" });
  }
});

router.post("/routines", async (req, res) => {
  try {
    const { subject, faculty, room, day, startTime, endTime, userId } = req.body;
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const routine = await Routine.create({
      user: userId || req.user.id,
      subject: subject.trim(),
      faculty: faculty ? faculty.trim() : "",
      room: room ? room.trim() : "",
      day: Number(day) || 0,
      startTime,
      endTime,
    });

    res.status(201).json(routine);
  } catch (err) {
    res.status(500).json({ message: "Failed to create routine slot" });
  }
});

router.patch("/routines/:id", async (req, res) => {
  try {
    const { subject, faculty, room, day, startTime, endTime } = req.body;
    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const updated = await Routine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Routine slot not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update routine slot" });
  }
});

router.delete("/routines/:id", async (req, res) => {
  try {
    const routine = await Routine.findByIdAndDelete(req.params.id);
    if (!routine) return res.status(404).json({ message: "Routine slot not found" });
    res.json({ message: "Routine slot deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete routine slot" });
  }
});

// ── 5. NOTES REPOSITORY MANAGEMENT ──────────────────────────────────────────
router.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notes" });
  }
});

router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note resource removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

// ── 6. EVENTS MANAGEMENT ────────────────────────────────────────────────────
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to load events" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const { title, description, date, time, venue, category, organizer, capacity } = req.body;
    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({ message: "Title, description, date, time and venue are required" });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      venue: venue.trim(),
      category: category || "Technical",
      organizer: organizer ? organizer.trim() : "Campus Administration",
      capacity: Number(capacity) || 200,
      createdBy: req.user.id,
      registeredUsers: [],
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// ── 7. CLUBS MANAGEMENT ─────────────────────────────────────────────────────
router.get("/clubs", async (req, res) => {
  try {
    const clubs = await Club.find().sort({ name: 1 });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load clubs" });
  }
});

router.post("/clubs", async (req, res) => {
  try {
    const { name, category, description, coordinator, contactEmail, meetingSchedule, icon } = req.body;
    if (!name || !description || !coordinator) {
      return res.status(400).json({ message: "Name, description and coordinator are required" });
    }

    const club = await Club.create({
      name: name.trim(),
      category: category || "Technical",
      description: description.trim(),
      coordinator: coordinator.trim(),
      contactEmail: contactEmail ? contactEmail.trim() : "",
      meetingSchedule: meetingSchedule ? meetingSchedule.trim() : "Weekly",
      icon: icon || "🎯",
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ message: "Failed to create club" });
  }
});

router.patch("/clubs/:id", async (req, res) => {
  try {
    const updated = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Club not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update club" });
  }
});

router.delete("/clubs/:id", async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.json({ message: "Club deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete club" });
  }
});

// ── 8. MARKETPLACE MODERATION ───────────────────────────────────────────────
router.get("/marketplace", async (req, res) => {
  try {
    const items = await MarketplaceItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load marketplace items" });
  }
});

router.patch("/marketplace/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const item = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      { status: status || "Available" },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing status" });
  }
});

router.delete("/marketplace/:id", async (req, res) => {
  try {
    const item = await MarketplaceItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Marketplace listing removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove listing" });
  }
});

// ── 9. LOST & FOUND MODERATION ──────────────────────────────────────────────
router.get("/lostfound", async (req, res) => {
  try {
    const reports = await LostFound.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reports" });
  }
});

router.patch("/lostfound/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const report = await LostFound.findByIdAndUpdate(
      req.params.id,
      { status: status || "open" },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to update report status" });
  }
});

router.delete("/lostfound/:id", async (req, res) => {
  try {
    const report = await LostFound.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Lost & found report removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove report" });
  }
});

module.exports = router;

