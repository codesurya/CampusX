const router = require("express").Router();
const auth = require("../middleware/auth");
const Note = require("../models/Note");

const SAMPLE_NOTES = [
  {
    title: "Data Structures & Algorithms - Complete Handwritten Notes",
    subject: "DSA",
    unit: "Unit 1-5 Complete",
    semester: 3,
    branch: "CSE",
    description: "Trees, Graphs, Dynamic Programming and Sorting algorithms with diagrams and practice questions.",
    fileType: "PDF",
    downloads: 142,
    uploadedBy: "Rahul Verma (Topper 2025)",
  },
  {
    title: "Operating Systems - Process Scheduling & Memory Management",
    subject: "OS",
    unit: "Unit 2 & 3",
    semester: 4,
    branch: "CSE",
    description: "Detailed breakdown of CPU scheduling algorithms, Deadlocks, Paging and Virtual Memory.",
    fileType: "PDF",
    downloads: 98,
    uploadedBy: "Prof. S. Sen Lecture Notes",
  },
  {
    title: "Database Management Systems (SQL + Normalization Cheat Sheet)",
    subject: "DBMS",
    unit: "Unit 3 & 4",
    semester: 4,
    branch: "IT / CSE",
    description: "ER Diagrams, 1NF to BCNF with step-by-step solved exam problems and SQL queries.",
    fileType: "PDF",
    downloads: 215,
    uploadedBy: "Ananya Roy",
  },
  {
    title: "Computer Networks - OSI & TCP/IP Layer Wise Notes",
    subject: "Networks",
    unit: "Unit 1-4",
    semester: 5,
    branch: "CSE",
    description: "Layer architectures, Subnetting calculations, Flow control & Congestion protocols.",
    fileType: "PDF",
    downloads: 76,
    uploadedBy: "Tech Club Academic Wing",
  },
  {
    title: "Cloud Computing & AWS Architecture Essentials",
    subject: "Cloud",
    unit: "Unit 1 & 2",
    semester: 6,
    branch: "CSE",
    description: "Virtualization, IaaS/PaaS/SaaS models, AWS EC2, S3, IAM overview with lab screenshots.",
    fileType: "PDF",
    downloads: 64,
    uploadedBy: "Aman Gupta",
  },
];

// GET /api/notes - list all notes with search & filtering
router.get("/", auth, async (req, res) => {
  try {
    let notes = await Note.find().sort({ createdAt: -1 });
    if (notes.length === 0) {
      // Auto seed sample notes
      const docs = SAMPLE_NOTES.map((n) => ({ ...n, user: req.user.id }));
      notes = await Note.insertMany(docs);
    }
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notes" });
  }
});

// POST /api/notes - create note
router.post("/", auth, async (req, res) => {
  try {
    const { title, subject, unit, semester, branch, description, fileType, fileUrl } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });
    if (!subject || !subject.trim()) return res.status(400).json({ message: "Subject is required" });

    const note = await Note.create({
      title: title.trim(),
      subject: subject.trim(),
      unit: unit ? unit.trim() : "Unit 1",
      semester: Number(semester) || 1,
      branch: branch || "CSE",
      description: description ? description.trim() : "",
      fileType: fileType || "PDF",
      fileUrl: fileUrl || "#",
      uploadedBy: req.user.name || "Student",
      user: req.user.id,
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to upload note" });
  }
});

// PATCH /api/notes/:id/download - increment download count
router.patch("/:id/download", auth, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to track download" });
  }
});

// DELETE /api/notes/:id - owner or admin delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Allow author or admin
    if (note.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note" });
  }
});

module.exports = router;

