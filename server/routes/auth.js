const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role || "student" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// POST /api/auth/register
// Public registration strictly assigns 'student' role. Admin accounts must be created via secure CLI script.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, collegeId, branch, semester } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password required" });

    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    // Explicitly enforce student role for public registration
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      collegeId: collegeId ? collegeId.trim() : "",
      branch: branch || "B.Tech CSE",
      semester: Number(semester) || 1,
      role: "student",
    });

    res.status(201).json({
      token: makeToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      token: makeToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "student",
        branch: user.branch,
        semester: user.semester,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/auth/profile (protected) - update profile details
// Note: Users CANNOT alter their own role. Role promotion is strictly restricted to verified Admins or CLI.
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, collegeId, branch, semester } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (collegeId !== undefined) updates.collegeId = collegeId.trim();
    if (branch) updates.branch = branch.trim();
    if (semester) updates.semester = Number(semester);

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.json({
      message: "Profile updated successfully",
      user,
      token: makeToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
