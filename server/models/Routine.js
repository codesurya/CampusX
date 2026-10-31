const mongoose = require("mongoose");

/**
 * Routine Schema
 * Represents a single timetable entry (one class slot) for a student.
 * Each entry belongs to one user and holds subject, faculty, room,
 * day of week, and start/end times.
 */
const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    faculty: {
      type: String,
      default: "",
      trim: true,
    },
    room: {
      type: String,
      default: "",
      trim: true,
    },
    // 0 = Monday, 1 = Tuesday, ... 5 = Saturday, 6 = Sunday
    day: {
      type: Number,
      required: [true, "Day is required"],
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Routine", routineSchema);

