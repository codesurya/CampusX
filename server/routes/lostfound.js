const router = require("express").Router();
const auth = require("../middleware/auth");
const LostFound = require("../models/LostFound");

const SAMPLE_REPORTS = [
  {
    title: "Black HP Wireless Mouse found in CS Lab 2",
    description: "Found on PC-14 desk after 3rd year Operating Systems practical lab session. Kept safely with lab assistant.",
    type: "found",
    category: "Electronics",
    location: "Computer Lab 2 (Academic Block B, 2nd Floor)",
    date: "30 Oct 2026",
    contactInfo: "Contact Lab Assistant Mr. Rakesh or text 98765 11223",
    reporterName: "Lab Staff",
    status: "open",
  },
  {
    title: "Lost University ID Card & Bus Pass (CSE23B082)",
    description: "Lost somewhere between the Central Cafeteria and Main Library entrance around 1:30 PM. Has name 'Kunal Joshi' and blue lanyard.",
    type: "lost",
    category: "ID Card",
    location: "Between Canteen and Central Library",
    date: "29 Oct 2026",
    contactInfo: "Call Kunal: 98111 22334 (Urgent, need for upcoming midterms)",
    reporterName: "Kunal Joshi",
    status: "open",
  },
  {
    title: "Set of 3 Bike Keys with Iron Man Keychain",
    description: "Found hanging on the outer fence near Student Parking Shed 1.",
    type: "found",
    category: "Keys",
    location: "Parking Shed 1",
    date: "31 Oct 2026",
    contactInfo: "Deposited at Main Security Gate 1",
    reporterName: "Security Desk",
    status: "open",
  },
  {
    title: "Lost Navy Blue Milton Thermo Steel Water Bottle",
    description: "Left in Lecture Hall LH-101 on row 4 during Engineering Economics lecture.",
    type: "lost",
    category: "Bottles/Accessories",
    location: "Lecture Hall LH-101",
    date: "28 Oct 2026",
    contactInfo: "Ping @ritika_c on Telegram",
    reporterName: "Ritika Chauhan",
    status: "resolved",
  },
];

// GET /api/lostfound - list all items
router.get("/", auth, async (req, res) => {
  try {
    let items = await LostFound.find().sort({ createdAt: -1 });
    if (items.length === 0) {
      const docs = SAMPLE_REPORTS.map((r) => ({ ...r, user: req.user.id }));
      items = await LostFound.insertMany(docs);
    }

    const formatted = items.map((it) => ({
      ...it.toObject(),
      isOwner: it.user.toString() === req.user.id || req.user.role === "admin",
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to load lost & found reports" });
  }
});

// POST /api/lostfound - report lost or found item
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, type, category, location, date, contactInfo, reporterName } = req.body;
    if (!title || !description || !type || !location || !contactInfo) {
      return res.status(400).json({ message: "Title, description, type, location and contact details are required" });
    }

    const item = await LostFound.create({
      title: title.trim(),
      description: description.trim(),
      type: type === "found" ? "found" : "lost",
      category: category || "Other",
      location: location.trim(),
      date: date || new Date().toLocaleDateString("en-IN"),
      contactInfo: contactInfo.trim(),
      reporterName: (reporterName && reporterName.trim()) || req.user.name || "Student",
      status: "open",
      user: req.user.id,
    });

    res.status(201).json({
      ...item.toObject(),
      isOwner: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit report" });
  }
});

// PATCH /api/lostfound/:id/status - toggle status (open / resolved)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Report not found" });

    if (item.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update status" });
    }

    item.status = req.body.status || (item.status === "open" ? "resolved" : "open");
    await item.save();

    res.json({
      ...item.toObject(),
      isOwner: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// DELETE /api/lostfound/:id - delete report
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Report not found" });

    if (item.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this report" });
    }

    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report" });
  }
});

module.exports = router;

