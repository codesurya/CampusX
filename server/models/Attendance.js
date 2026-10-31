const mongoose = require("mongoose");

/**
 * Attendance Schema
 * Represents a student's subject attendance record in MongoDB.
 */
const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    attended: {
      type: Number,
      default: 0,
      min: [0, "Attended classes cannot be negative"],
    },
    total: {
      type: Number,
      default: 0,
      min: [0, "Total classes cannot be negative"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);

