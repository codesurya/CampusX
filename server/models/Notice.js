/**
 * Notice Model – stores college notices/updates for each user.
 * Each notice belongs to one user (data isolation by userId).
 */
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    // Owner – links notice to the user who created it
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Notice title (required, max 200 chars)
    title: { type: String, required: true, maxlength: 200, trim: true },

    // Detailed description / body text
    body: { type: String, required: true, maxlength: 2000, trim: true },

    // Category for filtering
    category: {
      type: String,
      enum: ["Exam", "Holiday", "Academic", "General", "Event"],
      default: "General",
    },

    // Priority level – "high" notices get a visual badge
    priority: {
      type: String,
      enum: ["normal", "high"],
      default: "normal",
    },

    // Who posted the notice (free-text, defaults to "Admin")
    postedBy: { type: String, default: "Admin", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);

