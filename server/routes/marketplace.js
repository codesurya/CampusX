const router = require("express").Router();
const auth = require("../middleware/auth");
const MarketplaceItem = require("../models/MarketplaceItem");

const SAMPLE_ITEMS = [
  {
    title: "Engineering Mathematics Vol. 1 & 2 (B.S. Grewal)",
    description: "Standard syllabus textbook in mint condition. No pen markings or torn pages. Very useful for 1st & 2nd sem math.",
    category: "Books",
    price: 450,
    condition: "Like New",
    sellerName: "Aditya Sharma",
    contactInfo: "WhatsApp: +91 98765 43210 (Hostel Block C, Room 214)",
    status: "Available",
  },
  {
    title: "Casio FX-991EX Scientific Classwiz Calculator",
    description: "Original Casio fx-991EX with matrix, complex numbers, and equation solver. Includes protective slide-on hard case.",
    category: "Electronics",
    price: 850,
    condition: "Good",
    sellerName: "Pooja Verma",
    contactInfo: "Call or SMS: 98123 45678",
    status: "Available",
  },
  {
    title: "Hero Sprint 21-Speed Mountain Gear Bicycle",
    description: "Used for 1 year for daily campus commute from outer hostel to academic block. New brake pads and bell included.",
    category: "Cycles/Vehicles",
    price: 3200,
    condition: "Good",
    sellerName: "Tanmay Deshmukh",
    contactInfo: "Telegram: @tanmay_campus / Room B-102",
    status: "Available",
  },
  {
    title: "Mini Dorm Study Table Lamp (Rechargeable LED)",
    description: "3 touch brightness levels, flexible 360-degree neck, USB-C rechargeable with 8 hours battery backup.",
    category: "Dorm/Hostel",
    price: 280,
    condition: "Brand New",
    sellerName: "Sneha Nair",
    contactInfo: "Email: sneha.nair@campusx.edu",
    status: "Available",
  },
  {
    title: "Complete Mini Drafter + Engineering Drawing Kit",
    description: "Includes Omega steel arm mini-drafter, drawing board clips, set squares, and roll storage tube.",
    category: "Stationery",
    price: 350,
    condition: "Like New",
    sellerName: "Varun Patil",
    contactInfo: "Hostel A-304 (Evening 6-9 PM)",
    status: "Available",
  },
];

// GET /api/marketplace - list all active listings
router.get("/", auth, async (req, res) => {
  try {
    let items = await MarketplaceItem.find().sort({ createdAt: -1 });
    if (items.length === 0) {
      const docs = SAMPLE_ITEMS.map((item) => ({ ...item, user: req.user.id }));
      items = await MarketplaceItem.insertMany(docs);
    }

    const formatted = items.map((it) => ({
      ...it.toObject(),
      isOwner: it.user.toString() === req.user.id || req.user.role === "admin",
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to load marketplace items" });
  }
});

// POST /api/marketplace - create item listing
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, category, price, condition, sellerName, contactInfo } = req.body;
    if (!title || !description || price === undefined || !contactInfo) {
      return res.status(400).json({ message: "Title, description, price and contact details are required" });
    }

    const item = await MarketplaceItem.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "Books",
      price: Number(price) || 0,
      condition: condition || "Good",
      sellerName: (sellerName && sellerName.trim()) || req.user.name || "Student",
      contactInfo: contactInfo.trim(),
      status: "Available",
      user: req.user.id,
    });

    res.status(201).json({
      ...item.toObject(),
      isOwner: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to post listing" });
  }
});

// PATCH /api/marketplace/:id/status - toggle status (Available / Sold)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update status" });
    }

    item.status = req.body.status || (item.status === "Available" ? "Sold" : "Available");
    await item.save();

    res.json({
      ...item.toObject(),
      isOwner: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update item status" });
  }
});

// DELETE /api/marketplace/:id - delete listing
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await MarketplaceItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing" });
  }
});

module.exports = router;

