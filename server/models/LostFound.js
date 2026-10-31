const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    type: { type: String, enum: ["lost", "found"], required: true },
    category: {
      type: String,
      enum: ["ID Card", "Electronics", "Keys", "Bags/Books", "Bottles/Accessories", "Other"],
      default: "Other",
    },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    contactInfo: { type: String, required: true, trim: true },
    reporterName: { type: String, default: "Anonymous Student", trim: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);

