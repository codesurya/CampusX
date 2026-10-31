const express = require("express");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");

const router = express.Router();

// Default academic subjects for new accounts
const DEFAULT_SUBJECTS = [
  { code: "CS501", name: "Operating Systems", attended: 28, total: 34 },
  { code: "CS502", name: "Computer Networks", attended: 22, total: 34 },
  { code: "CS503", name: "DBMS", attended: 31, total: 34 },
  { code: "CS504", name: "Algorithms", attended: 24, total: 34 },
  { code: "CS505", name: "Software Engineering", attended: 29, total: 34 },
];

/**
 * GET /api/attendance
 * Fetch all attendance records for the authenticated student.
 * If no records exist, seed with default subjects.
 */
router.get("/", auth, async (req, res) => {
  try {
    let subjects = await Attendance.find({ user: req.user.id }).sort({ createdAt: 1 });

    // Seed defaults if the student does not have any subjects yet
    if (subjects.length === 0) {
      const seedData = DEFAULT_SUBJECTS.map((s) => ({
        ...s,
        user: req.user.id,
      }));
      subjects = await Attendance.insertMany(seedData);
    }

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
});

/**
 * POST /api/attendance
 * Add a new subject to the student's attendance tracker.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { code, name, attended = 0, total = 0 } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: "Subject code and name are required" });
    }

    const numAttended = Math.max(0, parseInt(attended, 10) || 0);
    const numTotal = Math.max(0, parseInt(total, 10) || 0);

    if (numAttended > numTotal) {
      return res.status(400).json({ message: "Attended classes cannot exceed total classes" });
    }

    const newSubject = await Attendance.create({
      user: req.user.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      attended: numAttended,
      total: numTotal,
    });

    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ message: "Failed to add subject", error: err.message });
  }
});

/**
 * PATCH /api/attendance/:id/mark
 * Mark a class as Present or Absent for a subject.
 */
router.patch("/:id/mark", auth, async (req, res) => {
  try {
    const { present } = req.body;

    if (typeof present !== "boolean") {
      return res.status(400).json({ message: "Field 'present' (boolean) is required" });
    }

    const update = {
      $inc: {
        total: 1,
        attended: present ? 1 : 0,
      },
    };

    const subject = await Attendance.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: "Failed to update attendance", error: err.message });
  }
});

/**
 * DELETE /api/attendance/:id
 * Remove a subject from the student's attendance list.
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const subject = await Attendance.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject removed successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete subject", error: err.message });
  }
});

module.exports = router;

