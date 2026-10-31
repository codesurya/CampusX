const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Workshop", "Seminar", "Other"],
      default: "Technical",
    },
    organizer: { type: String, default: "Student Council", trim: true },
    capacity: { type: Number, default: 200 },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);

