const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true },
    unit: { type: String, default: "Unit 1", trim: true },
    semester: { type: Number, default: 1 },
    branch: { type: String, default: "CSE", trim: true },
    description: { type: String, default: "", trim: true },
    fileType: { type: String, enum: ["PDF", "DOCX", "PPT", "NOTES"], default: "PDF" },
    fileUrl: { type: String, default: "#" },
    downloads: { type: Number, default: 0 },
    uploadedBy: { type: String, default: "Student" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);

