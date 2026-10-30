const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    collegeId: { type: String, default: "" },
    branch: { type: String, default: "B.Tech CSE" },
    semester: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
