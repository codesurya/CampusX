const router = require("express").Router();
const auth = require("../middleware/auth");
const Event = require("../models/Event");

const SAMPLE_EVENTS = [
  {
    title: "TechFest 2026: 36-Hour National Hackathon",
    description: "Build cutting-edge AI, Web3, and IoT solutions. Mentors from top tech firms, total cash prizes worth ₹1,50,000, and direct internship opportunities.",
    date: "15 Nov 2026",
    time: "09:00 AM",
    venue: "Main Auditorium & Innovation Lab",
    category: "Technical",
    organizer: "Coding Club & ACM Chapter",
    capacity: 250,
  },
  {
    title: "Spandan: Annual Cultural Gala & Battle of Bands",
    description: "Live band performances, solo dance, street theatre, and celebrity guest DJ night. Food trucks, photobooths, and student artwork stalls.",
    date: "22 Nov 2026",
    time: "04:30 PM",
    venue: "Open Air Amphitheatre",
    category: "Cultural",
    organizer: "Cultural Society",
    capacity: 1000,
  },
  {
    title: "Placement Masterclass: Cracking FAANG Coding Rounds",
    description: "Interactive session by alumni working at Google and Microsoft on system design, behavioral rounds, and resume building tips.",
    date: "18 Nov 2026",
    time: "11:00 AM",
    venue: "Seminar Hall B & Live Stream",
    category: "Workshop",
    organizer: "Training & Placement Cell",
    capacity: 180,
  },
  {
    title: "Inter-Department Cricket & Football Tournament",
    description: "Annual university sports cup. 16 departmental teams competing across 4 days for the campus champion trophy.",
    date: "28 Nov 2026",
    time: "08:00 AM",
    venue: "University Sports Complex",
    category: "Sports",
    organizer: "Sports Council",
    capacity: 500,
  },
  {
    title: "AI & Robotics Hands-on BootCamp",
    description: "Learn Computer Vision and Autonomous Bot navigation using ROS2 and OpenCV. Hardware kits provided for registered teams.",
    date: "05 Dec 2026",
    time: "02:00 PM",
    venue: "Robotics Research Centre (Lab 4)",
    category: "Workshop",
    organizer: "Robotics Club",
    capacity: 60,
  },
];

// GET /api/events - list all events
router.get("/", auth, async (req, res) => {
  try {
    let events = await Event.find().sort({ createdAt: -1 });
    if (events.length === 0) {
      const docs = SAMPLE_EVENTS.map((e) => ({
        ...e,
        createdBy: req.user.id,
        registeredUsers: [req.user.id], // register initial user for demonstration
      }));
      events = await Event.insertMany(docs);
    }

    // Map events with dynamic `isRegistered` flag for current user
    const formatted = events.map((ev) => {
      const isReg = ev.registeredUsers.some((u) => u.toString() === req.user.id);
      return {
        ...ev.toObject(),
        isRegistered: isReg,
        registeredCount: ev.registeredUsers.length,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to load events" });
  }
});

// POST /api/events - create event
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, date, time, venue, category, organizer, capacity } = req.body;
    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({ message: "All event fields are required" });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      venue: venue.trim(),
      category: category || "Technical",
      organizer: organizer ? organizer.trim() : "Student Council",
      capacity: Number(capacity) || 100,
      createdBy: req.user.id,
      registeredUsers: [],
    });

    res.status(201).json({
      ...event.toObject(),
      isRegistered: false,
      registeredCount: 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

// POST /api/events/:id/register - register/RSVP
router.post("/:id/register", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const alreadyReg = event.registeredUsers.some((u) => u.toString() === req.user.id);
    if (alreadyReg) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    event.registeredUsers.push(req.user.id);
    await event.save();

    res.json({
      message: "Successfully registered for event",
      isRegistered: true,
      registeredCount: event.registeredUsers.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to register" });
  }
});

// POST /api/events/:id/unregister - cancel RSVP
router.post("/:id/unregister", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.registeredUsers = event.registeredUsers.filter((u) => u.toString() !== req.user.id);
    await event.save();

    res.json({
      message: "Registration cancelled",
      isRegistered: false,
      registeredCount: event.registeredUsers.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to unregister" });
  }
});

// DELETE /api/events/:id - delete event
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      event.createdBy &&
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Only event organizers or admins can delete events" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

module.exports = router;

