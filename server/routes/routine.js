const express = require("express");
const Routine = require("../models/Routine");
const auth = require("../middleware/auth");

const router = express.Router();

// Day names for validation labels
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Helper: validate HH:MM time string
 */
function isValidTime(t) {
  return /^\d{2}:\d{2}$/.test(t);
}

/**
 * Helper: check startTime is before endTime
 */
function isStartBeforeEnd(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return sh * 60 + sm < eh * 60 + em;
}

/**
 * GET /api/routine
 * Return all routine entries for the logged-in user, sorted by day then startTime.
 */
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Routine.find({ user: req.user.id }).sort({ day: 1, startTime: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch routine", error: err.message });
  }
});

/**
 * POST /api/routine
 * Add a new timetable entry for the logged-in user.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { subject, faculty, room, day, startTime, endTime } = req.body;

    // Validate required fields
    if (!subject || subject.trim() === "") {
      return res.status(400).json({ message: "Subject name is required" });
    }
    const dayNum = Number(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return res.status(400).json({ message: "Day must be a number between 0 (Monday) and 6 (Sunday)" });
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ message: "Times must be in HH:MM format (e.g. 09:00)" });
    }
    if (!isStartBeforeEnd(startTime, endTime)) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const entry = await Routine.create({
      user: req.user.id,
      subject: subject.trim(),
      faculty: (faculty || "").trim(),
      room: (room || "").trim(),
      day: dayNum,
      startTime,
      endTime,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Failed to add routine entry", error: err.message });
  }
});

/**
 * PATCH /api/routine/:id
 * Update a specific routine entry (only the owner can update it).
 */
router.patch("/:id", auth, async (req, res) => {
  try {
    const { subject, faculty, room, day, startTime, endTime } = req.body;

    const update = {};
    if (subject !== undefined) update.subject = subject.trim();
    if (faculty !== undefined) update.faculty = faculty.trim();
    if (room !== undefined) update.room = room.trim();

    if (day !== undefined) {
      const dayNum = Number(day);
      if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
        return res.status(400).json({ message: "Day must be between 0 and 6" });
      }
      update.day = dayNum;
    }

    if (startTime !== undefined || endTime !== undefined) {
      // Fetch existing entry to validate against unchanged field
      const existing = await Routine.findOne({ _id: req.params.id, user: req.user.id });
      if (!existing) return res.status(404).json({ message: "Entry not found" });

      const finalStart = startTime !== undefined ? startTime : existing.startTime;
      const finalEnd = endTime !== undefined ? endTime : existing.endTime;

      if (!isValidTime(finalStart) || !isValidTime(finalEnd)) {
        return res.status(400).json({ message: "Times must be in HH:MM format" });
      }
      if (!isStartBeforeEnd(finalStart, finalEnd)) {
        return res.status(400).json({ message: "Start time must be before end time" });
      }
      update.startTime = finalStart;
      update.endTime = finalEnd;
    }

    const entry = await Routine.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!entry) return res.status(404).json({ message: "Routine entry not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Failed to update routine entry", error: err.message });
  }
});

/**
 * DELETE /api/routine/:id
 * Delete a specific routine entry (only the owner can delete it).
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const entry = await Routine.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: "Routine entry not found" });
    res.json({ message: "Routine entry deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete routine entry", error: err.message });
  }
});

module.exports = router;

