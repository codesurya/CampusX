const router = require("express").Router();
const auth = require("../middleware/auth");
const Attendance = require("../models/Attendance");
const Routine = require("../models/Routine");
const Notice = require("../models/Notice");

// Knowledge base responses for campus assistant
const CAMPUS_FAQ = [
  {
    keywords: ["attendance", "75", "shortage", "detained", "percentage"],
    reply: "📊 **Attendance Policy at CampusX:**\n- The minimum mandatory attendance required to sit for final semester examinations is **75%**.\n- If your attendance drops below 75%, our Attendance Tracker warns you and calculates how many consecutive classes you must attend (using formula: *3*total - 4*attended*) to reach the safe zone!\n- Check your current standing anytime in the **Attendance Tracker** tab.",
  },
  {
    keywords: ["routine", "timetable", "class", "schedule", "period", "timing"],
    reply: "📅 **Class Routine & Schedule:**\n- Your weekly timetable is accessible in the **Class Routine** tab.\n- You can filter by day of the week (Monday through Sunday) to see start times, end times, classroom/hall numbers, and faculty names.\n- You can also add or customize your own subject slots at any time.",
  },
  {
    keywords: ["notice", "exam", "datesheet", "holiday", "circular", "announcement"],
    reply: "📢 **College Notices & Circulars:**\n- All official notices from the Examination Cell, Dean's Office, and Departments are posted in the **Updates** tab.\n- You can filter notices by categories like *Exam, Holiday, Academic, General, and Event*, or search by keywords. Urgent notices are highlighted in red.",
  },
  {
    keywords: ["notes", "noteshub", "pdf", "study material", "books", "handwritten"],
    reply: "📚 **NotesHub Module:**\n- Browse syllabus-aligned handwritten notes, lecture slides, and question banks in the **NotesHub** tab.\n- Filter by Subject (DSA, DBMS, OS, Networks, Cloud) or Semester.\n- You can also upload your own notes to help junior students and earn recognition!",
  },
  {
    keywords: ["lost", "found", "keys", "id card", "wallet", "bottle"],
    reply: "🔍 **Lost & Found:**\n- Found someone's belongings? Report it under **Lost & Found** so the rightful owner can claim it.\n- Lost an item? Post details including location and contact info, and mark it resolved once returned.",
  },
  {
    keywords: ["marketplace", "sell", "buy", "cycle", "calculator", "second hand"],
    reply: "🛒 **Campus Marketplace:**\n- Buy and sell second-hand course books, calculators, bicycles, mini-drafters, and dorm gear directly with other students.\n- No commissions or hidden fees. Simply contact the seller via WhatsApp or hostel room info provided on the card.",
  },
  {
    keywords: ["club", "societies", "gdsc", "robox", "join", "event"],
    reply: "🚀 **Clubs & Societies:**\n- Explore technical and cultural clubs in the **Club System** tab (GDSC, RoboX, Dhwani, E-Cell, Rotaract).\n- Click 'Join Club' to become an active member, attend regular meetings, and participate in campus hackathons.",
  },
  {
    keywords: ["library", "books issue", "timing", "reading room"],
    reply: "📖 **Central Library Timings:**\n- Weekdays: 8:00 AM – 10:00 PM\n- Weekends & Holidays: 9:00 AM – 6:00 PM\n- High-speed campus Wi-Fi and digital IEEE / Springer journals are available in the Digital Reference Section.",
  },
  {
    keywords: ["canteen", "cafeteria", "mess", "food"],
    reply: "🥪 **Food & Dining:**\n- Central Canteen is open daily from 8:00 AM to 9:30 PM near the Main Lawn.\n- Student Mess timings: Breakfast (7:30–9:00 AM), Lunch (12:30–2:30 PM), Snacks (5:00–6:00 PM), Dinner (7:30–9:30 PM).",
  },
  {
    keywords: ["wifi", "internet", "network", "login"],
    reply: "📶 **Campus Wi-Fi Setup:**\n- Connect to SSID: `CampusX-Student-5G`\n- Login with your registered College Roll Number and password provided during orientation.\n- For access resets, visit the IT Infrastructure Cell on Ground Floor, Block A.",
  },
  {
    keywords: ["hello", "hi", "hey", "who are you", "help"],
    reply: "👋 Hello! I am **CampusX AI Assistant** — your personalized digital guide for academic and campus life.\n\nI can help you with:\n1. 📊 Checking your attendance requirements\n2. 📅 Looking up class routines & schedules\n3. 📚 Finding notes in NotesHub\n4. 📢 Latest notices and exam alerts\n5. 🛒 Marketplace & Lost/Found queries\n\nWhat would you like to know today?",
  },
];

// POST /api/ai/chat
router.post("/chat", auth, async (req, res) => {
  try {
    const message = (req.body.message || "").trim();
    if (!message) return res.status(400).json({ message: "Prompt message is required" });

    const lower = message.toLowerCase();

    // Check for user-specific dynamic data questions
    if (lower.includes("my attendance") || lower.includes("how is my attendance")) {
      const records = await Attendance.find({ user: req.user.id });
      if (records.length === 0) {
        return res.json({
          reply: "You haven't logged any attendance records yet. Visit the **Attendance Tracker** tab to view your subjects or add new ones!",
          engine: "CampusX Offline Knowledge Engine",
        });
      }
      const totalAttended = records.reduce((sum, r) => sum + r.attended, 0);
      const totalClasses = records.reduce((sum, r) => sum + r.total, 0);
      const avg = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
      const atRisk = records.filter((r) => r.total > 0 && Math.round((r.attended / r.total) * 100) < 75);

      return res.json({
        reply: `📊 **Your Attendance Summary:**\n- **Overall Average:** ${avg}%\n- **Subjects tracked:** ${records.length}\n- **Subjects below 75% threshold:** ${atRisk.length} ${atRisk.length > 0 ? "⚠️ (" + atRisk.map((r) => r.code).join(", ") + ")" : "✅ (All safe!)"}\n\nGo to the **Attendance Tracker** tab for detailed subject-wise insights.`,
        engine: "CampusX Offline Knowledge Engine",
      });
    }

    if (lower.includes("my class") || lower.includes("today schedule") || lower.includes("today's class")) {
      const todayIdx = (new Date().getDay() + 6) % 7; // Monday=0
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const slots = await Routine.find({ user: req.user.id, day: todayIdx }).sort({ startTime: 1 });

      if (slots.length === 0) {
        return res.json({
          reply: `📅 **Today's Schedule (${days[todayIdx]}):**\nYou have no classes scheduled for today! You can review or add classes in the **Class Routine** tab.`,
          engine: "CampusX Offline Knowledge Engine",
        });
      }

      const list = slots.map((s) => `• **${s.startTime} – ${s.endTime}:** ${s.subject} (Room: ${s.room || "TBA"}, Faculty: ${s.faculty || "TBA"})`).join("\n");
      return res.json({
        reply: `📅 **Today's Schedule (${days[todayIdx]}):**\nYou have ${slots.length} class${slots.length > 1 ? "es" : ""} scheduled today:\n\n${list}\n\nCheck the **Class Routine** tab for the full weekly timetable.`,
        engine: "CampusX Offline Knowledge Engine",
      });
    }

    // Match keywords against Knowledge Base
    for (const item of CAMPUS_FAQ) {
      if (item.keywords.some((k) => lower.includes(k))) {
        return res.json({
          reply: item.reply,
          engine: "CampusX Offline Knowledge Engine",
        });
      }
    }

    // Intelligent default fallback
    res.json({
      reply: `🤖 **CampusX Assistant:**\nI received: "*${message}*".\n\nI can help you navigate **Attendance Tracker**, **Class Routine**, **College Notices**, **NotesHub**, **Campus Events**, **Clubs**, **Marketplace**, and **Lost & Found**.\n\nTry asking:\n- *"How is my attendance?"*\n- *"What classes do I have today?"*\n- *"What is the 75% attendance rule?"*\n- *"Where do I find study notes?"*\n- *"Tell me about campus clubs and events"*\n- *"Library timings"*\n- *"Lost and found assistance"*`,
      engine: "CampusX Offline Knowledge Engine",
    });
  } catch (err) {
    res.status(500).json({ message: "AI Assistant temporarily unavailable", error: err.message });
  }
});

module.exports = router;

