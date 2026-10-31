const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Literary", "Social", "Innovation"],
      default: "Technical",
    },
    description: { type: String, required: true, trim: true },
    coordinator: { type: String, required: true, trim: true },
    contactEmail: { type: String, default: "" },
    meetingSchedule: { type: String, default: "Every Wednesday 4:00 PM" },
    icon: { type: String, default: "🚀" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Club", clubSchema);

