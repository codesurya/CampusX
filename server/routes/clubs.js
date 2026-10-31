const router = require("express").Router();
const auth = require("../middleware/auth");
const Club = require("../models/Club");

const SAMPLE_CLUBS = [
  {
    name: "Google Developer Student Club (GDSC)",
    category: "Technical",
    description: "Peer-to-peer learning community for students interested in Google developer technologies, Android, Flutter, Cloud, and Machine Learning.",
    coordinator: "Rohan Kulkarni (Final Year CSE)",
    contactEmail: "gdsc@campusx.edu",
    meetingSchedule: "Wednesdays at 4:30 PM",
    icon: "💻",
  },
  {
    name: "Robotics & Automation Society (RoboX)",
    category: "Technical",
    description: "Hands-on projects on Autonomous Mobile Robots, Drone Dynamics, Line Followers, and National Robocon competition prep.",
    coordinator: "Megha S. (ECE 3rd Year)",
    contactEmail: "robox@campusx.edu",
    meetingSchedule: "Saturdays at 2:00 PM",
    icon: "🤖",
  },
  {
    name: "Dhwani - Music & Performing Arts Society",
    category: "Cultural",
    description: "Vocalists, instrumentalists, and composers collaborating across Indian Classical, Indie, Rock, and Jazz genres with regular jam sessions.",
    coordinator: "Kabir Sen (Civil 2nd Year)",
    contactEmail: "dhwani@campusx.edu",
    meetingSchedule: "Tuesdays & Fridays 5:00 PM",
    icon: "🎸",
  },
  {
    name: "E-Cell (Entrepreneurship & Start-up Incubator)",
    category: "Innovation",
    description: "Fostering startup ideas, pitch deck workshops, venture capitalist networking, and organizing the annual campus E-Summit.",
    coordinator: "Ayesha Khan (MBA/B.Tech Tech Lead)",
    contactEmail: "ecell@campusx.edu",
    meetingSchedule: "Thursdays at 5:30 PM",
    icon: "🚀",
  },
  {
    name: "Rotaract Youth & Social Service Club",
    category: "Social",
    description: "Community welfare, campus blood donation camps, digital literacy for local school children, and environmental tree-plantation drives.",
    coordinator: "Devendra Rathore (Mechanical 3rd Year)",
    contactEmail: "rotaract@campusx.edu",
    meetingSchedule: "Alternate Sundays 10:00 AM",
    icon: "🌱",
  },
];

// GET /api/clubs - list all clubs
router.get("/", auth, async (req, res) => {
  try {
    let clubs = await Club.find().sort({ name: 1 });
    if (clubs.length === 0) {
      const docs = SAMPLE_CLUBS.map((c) => ({
        ...c,
        createdBy: req.user.id,
        members: [req.user.id], // Initial member for demo
      }));
      clubs = await Club.insertMany(docs);
    }

    const formatted = clubs.map((c) => {
      const isMember = c.members.some((m) => m.toString() === req.user.id);
      return {
        ...c.toObject(),
        isMember,
        memberCount: c.members.length,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to load clubs" });
  }
});

// POST /api/clubs - create club
router.post("/", auth, async (req, res) => {
  try {
    const { name, category, description, coordinator, contactEmail, meetingSchedule, icon } = req.body;
    if (!name || !description || !coordinator) {
      return res.status(400).json({ message: "Name, description and coordinator are required" });
    }

    const existing = await Club.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: "A club with this name already exists" });

    const club = await Club.create({
      name: name.trim(),
      category: category || "Technical",
      description: description.trim(),
      coordinator: coordinator.trim(),
      contactEmail: contactEmail ? contactEmail.trim() : "",
      meetingSchedule: meetingSchedule ? meetingSchedule.trim() : "TBD",
      icon: icon || "🎯",
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      ...club.toObject(),
      isMember: true,
      memberCount: 1,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create club" });
  }
});

// POST /api/clubs/:id/join - join club
router.post("/:id/join", auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const alreadyMember = club.members.some((m) => m.toString() === req.user.id);
    if (alreadyMember) return res.status(400).json({ message: "Already a member of this club" });

    club.members.push(req.user.id);
    await club.save();

    res.json({
      message: "Successfully joined " + club.name,
      isMember: true,
      memberCount: club.members.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to join club" });
  }
});

// POST /api/clubs/:id/leave - leave club
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    club.members = club.members.filter((m) => m.toString() !== req.user.id);
    await club.save();

    res.json({
      message: "Left " + club.name,
      isMember: false,
      memberCount: club.members.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave club" });
  }
});

// DELETE /api/clubs/:id - delete club
router.delete("/:id", auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (club.createdBy && club.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this club" });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: "Club removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete club" });
  }
});

module.exports = router;

