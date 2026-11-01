import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const NAV = [
  "Home",
  "Attendance Tracker",
  "Class Routine",
  "Updates",
  "NotesHub",
  "Event & Fest",
  "Club System",
  "Campus Marketplace",
  "Lost & Found",
  "AI Assistant",
  "Profile",
];

const EVENTS = [
  { title: "TechFest 2026 Hackathon", when: "15 May, 9:00 AM", where: "Main Auditorium" },
  { title: "Annual Cultural Fest", when: "22 May, 4:00 PM", where: "Open Air Theatre" },
  { title: "Placement Prep Workshop", when: "18 May, 11:00 AM", where: "Seminar Hall B" },
];

const pct = (s) => (s && s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0);
const barColor = (p) => (p >= 85 ? "var(--green)" : p >= 75 ? "var(--blue)" : "var(--amber)");

// Classes needed to reach 75%: x >= 3t - 4a. Classes that can be skipped: floor(4a/3 - t).
function advice(s) {
  const need = Math.ceil(3 * s.total - 4 * s.attended);
  if (need > 0) return { risk: true, text: `Attend the next ${need} classes to reach 75%` };
  const skip = Math.floor((4 * s.attended) / 3 - s.total);
  return { risk: false, text: skip > 0 ? `You can skip ${skip} and stay above 75%` : "Right on the 75% line" };
}

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", collegeId: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: form });
      setToken(data.token);
      onAuth();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Start the backend on port 5000."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>CampusX</h1>
        <p className="muted">
          {mode === "login" ? "Sign in to your campus dashboard." : "Create your student account."}
        </p>
        {mode === "register" && (
          <>
            <label>
              Full name
              <input value={form.name} onChange={set("name")} required />
            </label>
            <label>
              College ID
              <input value={form.collegeId} onChange={set("collegeId")} placeholder="CSE22B047" />
            </label>
          </>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} required />
        </label>
        <label>
          Password
          <input type="password" minLength={6} value={form.password} onChange={set("password")} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

function AttendanceTracker({
  subjects,
  loadingAtt,
  attError,
  showAddForm,
  setShowAddForm,
  newSub,
  setNewSub,
  handleAddSubject,
  savingSub,
  mark,
  handleDeleteSubject,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Attendance Tracker</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Subject"}
        </button>
      </div>

      {attError && <p className="error" style={{ marginBottom: "0.8rem" }}>{attError}</p>}

      {showAddForm && (
        <form className="form-card" onSubmit={handleAddSubject}>
          <strong>Add New Subject</strong>
          <div className="form-grid">
            <label>
              Subject Code
              <input
                placeholder="e.g. CS506"
                value={newSub.code}
                onChange={(e) => setNewSub({ ...newSub, code: e.target.value })}
                required
              />
            </label>
            <label>
              Subject Name
              <input
                placeholder="e.g. Cloud Computing"
                value={newSub.name}
                onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                required
              />
            </label>
            <label>
              Classes Attended
              <input
                type="number"
                min="0"
                value={newSub.attended}
                onChange={(e) => setNewSub({ ...newSub, attended: e.target.value })}
              />
            </label>
            <label>
              Total Classes
              <input
                type="number"
                min="0"
                value={newSub.total}
                onChange={(e) => setNewSub({ ...newSub, total: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-sm" disabled={savingSub}>
              {savingSub ? "Saving…" : "Save Subject"}
            </button>
          </div>
        </form>
      )}

      {loadingAtt && (
        <p className="muted small">Loading attendance from database…</p>
      )}

      {!loadingAtt && subjects.length === 0 && (
        <p className="muted small">No subjects added yet. Click &quot;+ Add Subject&quot; to begin tracking.</p>
      )}

      {!loadingAtt &&
        subjects.map((s) => {
          const p = pct(s);
          const a = advice(s);
          return (
            <div className="subject" key={s._id || s.code}>
              <div className="row">
                <strong>{s.code}: {s.name}</strong>
                <span style={{ color: barColor(p) }}>
                  {p}% ({s.attended}/{s.total})
                </span>
              </div>
              <div className="bar">
                <div style={{ width: `${p}%`, background: barColor(p) }} />
              </div>
              <div className="row small">
                <span className={a.risk ? "risk" : "muted"}>{a.text}</span>
                <span className="actions">
                  <button type="button" onClick={() => mark(s._id, true)}>Present</button>
                  <button type="button" onClick={() => mark(s._id, false)}>Absent</button>
                  <button
                    type="button"
                    className="btn-del"
                    title="Delete Subject"
                    onClick={() => handleDeleteSubject(s._id)}
                  >
                    &times;
                  </button>
                </span>
              </div>
            </div>
          );
        })}
    </section>
  );
}

// ─── Constants shared by Routine ───────────────────────────────────────────
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Constants shared by Notices ───────────────────────────────────────────
const NOTICE_CATEGORIES = ["All", "Exam", "Holiday", "Academic", "General", "Event"];
const CATEGORY_COLORS = {
  Exam: "#dc2626",
  Holiday: "#10b981",
  Academic: "#2563eb",
  General: "#64748b",
  Event: "#f59e0b",
};
const TIME_OPTIONS = [];
for (let h = 7; h <= 20; h++) {
  ["00", "30"].forEach((m) => {
    const label = `${String(h).padStart(2, "0")}:${m}`;
    TIME_OPTIONS.push(label);
  });
}

// ─── Class Routine Component ────────────────────────────────────────────────
function ClassRoutine() {
  const todayIdx = (new Date().getDay() + 6) % 7; // Convert JS Sunday=0 to Monday=0 index
  const [activeDay, setActiveDay] = useState(todayIdx <= 6 ? todayIdx : 0);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    faculty: "",
    room: "",
    day: String(todayIdx <= 6 ? todayIdx : 0),
    startTime: "09:00",
    endTime: "10:00",
  });

  // Load all routine entries from MongoDB
  const loadRoutine = () => {
    setLoading(true);
    setError("");
    api("/routine")
      .then((data) => setSlots(data))
      .catch((err) => setError(err.message || "Failed to load routine"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoutine();
  }, []);

  // Filter slots for the active day, sorted by startTime
  const daySlots = slots
    .filter((s) => s.day === activeDay)
    .sort((a, b) => (a.startTime > b.startTime ? 1 : -1));

  // Reset form to blank state
  const resetForm = () => {
    setForm({
      subject: "",
      faculty: "",
      room: "",
      day: String(activeDay),
      startTime: "09:00",
      endTime: "10:00",
    });
    setEditId(null);
    setShowForm(false);
    setError("");
  };

  // Populate form for editing an existing slot
  const startEdit = (slot) => {
    setForm({
      subject: slot.subject,
      faculty: slot.faculty || "",
      room: slot.room || "",
      day: String(slot.day),
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setEditId(slot._id);
    setShowForm(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) { setError("Subject name is required"); return; }
    if (form.startTime >= form.endTime) { setError("Start time must be before end time"); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        subject: form.subject.trim(),
        faculty: form.faculty.trim(),
        room: form.room.trim(),
        day: Number(form.day),
        startTime: form.startTime,
        endTime: form.endTime,
      };
      if (editId) {
        const updated = await api("/routine/" + editId, { method: "PATCH", body: payload });
        setSlots((prev) => prev.map((s) => (s._id === editId ? updated : s)));
      } else {
        const created = await api("/routine", { method: "POST", body: payload });
        setSlots((prev) => [...prev, created]);
        setActiveDay(Number(form.day));
      }
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  // Delete a slot
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class slot?")) return;
    try {
      await api("/routine/" + id, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError("Failed to delete: " + err.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Class Routine</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm && !editId ? "Cancel" : "+ Add Class"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.75rem" }}>{error}</p>}

      {/* Add / Edit Form */}
      {showForm && (
        <form className="form-card routine-form" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>{editId ? "Edit Class Slot" : "Add New Class Slot"}</strong>

          <div className="form-row">
            <label>
              Subject *
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Data Structures"
                required
              />
            </label>
            <label>
              Faculty
              <input
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                placeholder="e.g. Dr. Sharma"
              />
            </label>
          </div>

          <div className="form-row-3">
            <label>
              Room
              <input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. CS-101"
              />
            </label>
            <label>
              Day
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                {DAY_NAMES.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              &nbsp;
            </label>
          </div>

          <div className="form-row">
            <label>
              Start Time
              <select value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              End Time
              <select value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Saving…" : editId ? "Update Slot" : "Add Slot"}
            </button>
          </div>
        </form>
      )}

      {/* Day Tabs */}
      <div className="days-tabs">
        {DAY_NAMES.map((d, i) => {
          const count = slots.filter((s) => s.day === i).length;
          return (
            <button
              key={d}
              type="button"
              className={"day-tab" + (activeDay === i ? " active" : "") + (i === todayIdx ? " today" : "")}
              onClick={() => setActiveDay(i)}
            >
              {d.slice(0, 3)}
              {count > 0 && (
                <span style={{ marginLeft: "0.25rem", opacity: 0.75 }}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slot List for Active Day */}
      {loading ? (
        <p className="muted small">Loading timetable…</p>
      ) : daySlots.length === 0 ? (
        <div className="empty-day">
          <p className="muted small">No classes scheduled for {DAY_NAMES[activeDay]}.</p>
          <button
            type="button"
            className="btn-sm"
            style={{ marginTop: "0.5rem" }}
            onClick={() => {
              setForm({ ...form, day: String(activeDay) });
              setEditId(null);
              setShowForm(true);
            }}
          >
            + Add Class for {DAY_NAMES[activeDay]}
          </button>
        </div>
      ) : (
        <div className="slot-list">
          {daySlots.map((slot) => (
            <div className="slot" key={slot._id}>
              <div className="slot-time">{slot.startTime} &ndash; {slot.endTime}</div>
              <div className="slot-subject">{slot.subject}</div>
              <div className="slot-meta">
                {slot.faculty && <span>&#128100; {slot.faculty}</span>}
                {slot.room && <span>&#128205; {slot.room}</span>}
              </div>
              <div className="slot-actions">
                <button type="button" onClick={() => startEdit(slot)}>Edit</button>
                <button
                  type="button"
                  className="btn-del-slot"
                  onClick={() => handleDelete(slot._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── College Notices Component ──────────────────────────────────────────────
function CollegeNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "General",
    priority: "normal",
    postedBy: "",
  });

  // Load notices from MongoDB
  const loadNotices = async () => {
    setLoading(true);
    setError("");
    try {
      let data = await api("/notices");
      // If no notices exist, seed sample data automatically
      if (data.length === 0) {
        const seedRes = await api("/notices/seed");
        if (seedRes.seeded && seedRes.notices) {
          data = seedRes.notices;
        }
      }
      setNotices(data);
    } catch (err) {
      setError(err.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // Filter notices by category and search text
  const filtered = notices.filter((n) => {
    const matchCat = activeCategory === "All" || n.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      (n.postedBy && n.postedBy.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // Reset form
  const resetForm = () => {
    setForm({ title: "", body: "", category: "General", priority: "normal", postedBy: "" });
    setShowForm(false);
    setError("");
  };

  // Create a new notice
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and description are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await api("/notices", { method: "POST", body: form });
      setNotices((prev) => [created, ...prev]);
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to create notice");
    } finally {
      setSaving(false);
    }
  };

  // Delete a notice
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api("/notices/" + id, { method: "DELETE" });
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError("Failed to delete: " + err.message);
    }
  };

  // Format date to readable string
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>College Notices & Updates</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm ? "Cancel" : "+ Add Notice"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.75rem" }}>{error}</p>}

      {/* Add Notice Form */}
      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>Create New Notice</strong>
          <label>
            Title *
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Mid-Semester Exam Schedule"
              maxLength={200}
              required
            />
          </label>
          <label>
            Description *
            <textarea
              className="notice-textarea"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Enter the full notice details..."
              maxLength={2000}
              rows={4}
              required
            />
          </label>
          <div className="form-grid">
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {NOTICE_CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="high">High / Urgent</option>
              </select>
            </label>
          </div>
          <label>
            Posted By
            <input
              value={form.postedBy}
              onChange={(e) => setForm({ ...form, postedBy: e.target.value })}
              placeholder='e.g. CSE Department (default: "Admin")'
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Publishing…" : "Publish Notice"}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="notice-search">
        <input
          type="text"
          placeholder="Search notices by title, content or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="days-tabs" style={{ marginBottom: "1rem" }}>
        {NOTICE_CATEGORIES.map((cat) => {
          const count = cat === "All"
            ? notices.length
            : notices.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className={"day-tab" + (activeCategory === cat ? " active" : "")}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {count > 0 && (
                <span style={{ marginLeft: "0.25rem", opacity: 0.75 }}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notice Cards */}
      {loading ? (
        <p className="muted small">Loading notices…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-day">
          <p className="muted small">
            {search ? "No notices match your search." : "No notices in this category."}
          </p>
        </div>
      ) : (
        <div className="notice-list">
          {filtered.map((n) => (
            <div className={"notice-card" + (n.priority === "high" ? " notice-high" : "")} key={n._id}>
              <div className="notice-card-header">
                <span
                  className="notice-badge"
                  style={{ background: CATEGORY_COLORS[n.category] || "#64748b" }}
                >
                  {n.category}
                </span>
                {n.priority === "high" && (
                  <span className="notice-urgent">&#9888; Urgent</span>
                )}
              </div>
              <h3 className="notice-title">{n.title}</h3>
              <p className="notice-body">{n.body}</p>
              <div className="notice-footer">
                <span className="muted small">
                  {n.postedBy && <strong>{n.postedBy}</strong>}
                  {n.postedBy && " · "}
                  {fmtDate(n.createdAt)}
                </span>
                <button
                  type="button"
                  className="btn-del-slot"
                  title="Delete notice"
                  onClick={() => handleDelete(n._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── NotesHub Component ─────────────────────────────────────────────────────
function NotesHub({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    unit: "Unit 1",
    semester: 1,
    branch: "CSE",
    description: "",
    fileType: "PDF",
  });

  const loadNotes = () => {
    setLoading(true);
    setError("");
    api("/notes")
      .then(setNotes)
      .catch((err) => setError(err.message || "Failed to load notes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const allSubjects = ["All", ...Array.from(new Set(notes.map((n) => n.subject)))];

  const filtered = notes.filter((n) => {
    const matchSub = subjectFilter === "All" || n.subject === subjectFilter;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      (n.description && n.description.toLowerCase().includes(q)) ||
      (n.uploadedBy && n.uploadedBy.toLowerCase().includes(q));
    return matchSub && matchQ;
  });

  const handleDownload = async (id, title) => {
    try {
      const updated = await api(`/notes/${id}/download`, { method: "PATCH" });
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      alert(`📥 Downloading: "${title}"\n\nVerified campus study note saved to your downloads.`);
    } catch {
      alert(`📥 Downloading: "${title}"`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) {
      setError("Title and Subject are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await api("/notes", { method: "POST", body: form });
      setNotes((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({
        title: "",
        subject: "",
        unit: "Unit 1",
        semester: 1,
        branch: "CSE",
        description: "",
        fileType: "PDF",
      });
    } catch (err) {
      setError(err.message || "Failed to upload note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this study note?")) return;
    try {
      await api(`/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError("Failed to delete: " + err.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>NotesHub – Academic Notes Repository</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Upload Note"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.8rem" }}>{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>Upload Study Notes & Material</strong>
          <div className="form-grid">
            <label>
              Title *
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. DSA Complete Handwritten Notes"
                required
              />
            </label>
            <label>
              Subject *
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Data Structures"
                required
              />
            </label>
            <label>
              Unit / Modules
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. Unit 1 & 2"
              />
            </label>
            <label>
              File Format
              <select
                value={form.fileType}
                onChange={(e) => setForm({ ...form, fileType: e.target.value })}
              >
                <option value="PDF">PDF Document</option>
                <option value="DOCX">Word Document</option>
                <option value="PPT">Presentation (PPT)</option>
                <option value="NOTES">Handwritten Scan</option>
              </select>
            </label>
          </div>
          <label>
            Description & Key Topics Covered
            <textarea
              className="notice-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Includes syllabus-wise solved problems and important exam formulas."
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Uploading…" : "Publish Note"}
            </button>
          </div>
        </form>
      )}

      <div className="notice-search">
        <input
          type="text"
          placeholder="Search notes by subject, title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="days-tabs" style={{ marginBottom: "1rem" }}>
        {allSubjects.map((sub) => (
          <button
            key={sub}
            type="button"
            className={"day-tab" + (subjectFilter === sub ? " active" : "")}
            onClick={() => setSubjectFilter(sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted small">Loading notes repository…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-day">
          <p className="muted small">No notes found matching your criteria.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((note) => (
            <div className="item-card" key={note._id}>
              <div className="item-card-header">
                <span className="badge badge-blue">{note.subject}</span>
                <span className="badge badge-purple">{note.fileType || "PDF"}</span>
              </div>
              <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{note.title}</strong>
              <div className="note-meta">
                <span>📁 {note.unit || "All Units"}</span>
                <span>👤 {note.uploadedBy || "Student"}</span>
              </div>
              <p className="small muted" style={{ margin: 0, lineHeight: 1.4 }}>
                {note.description || "No additional description provided."}
              </p>
              <div className="row small" style={{ marginTop: "0.4rem", paddingTop: "0.4rem", borderTop: "1px solid var(--line)" }}>
                <span className="muted">📥 {note.downloads || 0} downloads</span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    type="button"
                    className="btn-sm"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => handleDownload(note._id, note.title)}
                  >
                    Download
                  </button>
                  {(note.user === user.id || user.role === "admin") && (
                    <button
                      type="button"
                      className="btn-del"
                      title="Delete Note"
                      onClick={() => handleDelete(note._id)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Events & Fest Component ────────────────────────────────────────────────
function EventsManager({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "Technical",
    organizer: "",
    capacity: 200,
  });

  const loadEvents = () => {
    setLoading(true);
    setError("");
    api("/events")
      .then(setEvents)
      .catch((err) => setError(err.message || "Failed to load events"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = ["All", "Technical", "Cultural", "Sports", "Workshop", "Seminar"];

  const filtered = events.filter(
    (e) => category === "All" || e.category === category
  );

  const toggleRSVP = async (ev) => {
    const endpoint = ev.isRegistered
      ? `/events/${ev._id}/unregister`
      : `/events/${ev._id}/register`;
    try {
      const res = await api(endpoint, { method: "POST" });
      setEvents((prev) =>
        prev.map((e) =>
          e._id === ev._id
            ? { ...e, isRegistered: res.isRegistered, registeredCount: res.registeredCount }
            : e
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update RSVP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date.trim() || !form.venue.trim()) {
      setError("Title, Date, Time and Venue are required");
      return;
    }
    setSaving(true);
    try {
      const created = await api("/events", { method: "POST", body: form });
      setEvents([created, ...events]);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        category: "Technical",
        organizer: "",
        capacity: 200,
      });
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campus event?")) return;
    try {
      await api(`/events/${id}`, { method: "DELETE" });
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      setError("Failed to delete event: " + err.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Campus Events & Fests</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Event"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.8rem" }}>{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>Organize New Campus Event</strong>
          <div className="form-grid">
            <label>
              Event Title *
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Annual Tech Symposium"
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Date *
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. 25 Nov 2026"
                required
              />
            </label>
            <label>
              Time *
              <input
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="e.g. 10:00 AM"
                required
              />
            </label>
            <label>
              Venue / Location *
              <input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Main Auditorium"
                required
              />
            </label>
            <label>
              Organizing Club / Cell
              <input
                value={form.organizer}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                placeholder="e.g. IEEE Student Branch"
              />
            </label>
          </div>
          <label>
            Description & Registration Perks
            <textarea
              className="notice-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Highlight keynote speakers, competition prizes, and rules."
              rows={3}
              required
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Publishing…" : "Publish Event"}
            </button>
          </div>
        </form>
      )}

      <div className="days-tabs" style={{ marginBottom: "1rem" }}>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={"day-tab" + (category === c ? " active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted small">Loading campus events…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-day">
          <p className="muted small">No events scheduled in this category.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((ev) => (
            <div className="item-card" key={ev._id}>
              <div className="item-card-header">
                <span className="badge badge-amber">{ev.category}</span>
                <span className="event-date-badge">
                  {ev.date}
                  <br />
                  <small style={{ fontWeight: "normal", opacity: 0.85 }}>{ev.time}</small>
                </span>
              </div>
              <strong style={{ fontSize: "1rem", color: "var(--ink)" }}>{ev.title}</strong>
              <div className="event-details">
                <span>📍 <strong>Venue:</strong> {ev.venue}</span>
                <span>🏛️ <strong>Host:</strong> {ev.organizer || "Student Council"}</span>
                <span>👥 <strong>Registered:</strong> {ev.registeredCount || 0} students</span>
              </div>
              <p className="small muted" style={{ margin: 0, lineHeight: 1.4 }}>
                {ev.description}
              </p>
              <div className="row" style={{ marginTop: "0.4rem", paddingTop: "0.5rem", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  className={ev.isRegistered ? "btn-ghost" : "btn-sm"}
                  style={{ width: "100%", textAlign: "center" }}
                  onClick={() => toggleRSVP(ev)}
                >
                  {ev.isRegistered ? "✓ Registered (Click to Cancel)" : "RSVP / Register"}
                </button>
                {(ev.createdBy === user.id || user.role === "admin") && (
                  <button
                    type="button"
                    className="btn-del"
                    title="Delete event"
                    onClick={() => handleDelete(ev._id)}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Clubs & Communities Component ──────────────────────────────────────────
function ClubsManager({ user }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Technical",
    description: "",
    coordinator: "",
    contactEmail: "",
    meetingSchedule: "Every Wednesday 4:00 PM",
    icon: "🚀",
  });

  const loadClubs = () => {
    setLoading(true);
    setError("");
    api("/clubs")
      .then(setClubs)
      .catch((err) => setError(err.message || "Failed to load clubs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const categories = ["All", "Technical", "Cultural", "Sports", "Innovation", "Social"];

  const filtered = clubs.filter(
    (c) => category === "All" || c.category === category
  );

  const toggleMembership = async (club) => {
    const endpoint = club.isMember ? `/clubs/${club._id}/leave` : `/clubs/${club._id}/join`;
    try {
      const res = await api(endpoint, { method: "POST" });
      setClubs((prev) =>
        prev.map((c) =>
          c._id === club._id
            ? { ...c, isMember: res.isMember, memberCount: res.memberCount }
            : c
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update membership");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.coordinator.trim()) {
      setError("Club name and Coordinator are required");
      return;
    }
    setSaving(true);
    try {
      const created = await api("/clubs", { method: "POST", body: form });
      setClubs([...clubs, created]);
      setShowForm(false);
      setForm({
        name: "",
        category: "Technical",
        description: "",
        coordinator: "",
        contactEmail: "",
        meetingSchedule: "Every Wednesday 4:00 PM",
        icon: "🚀",
      });
    } catch (err) {
      setError(err.message || "Failed to create club");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Clubs & Student Societies</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Register Club"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.8rem" }}>{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>Register New Student Club</strong>
          <div className="form-grid">
            <label>
              Club Name *
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. AI & Robotics Chapter"
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Lead Coordinator *
              <input
                value={form.coordinator}
                onChange={(e) => setForm({ ...form, coordinator: e.target.value })}
                placeholder="e.g. Varun K. (Final Year)"
                required
              />
            </label>
            <label>
              Official Club Email
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="e.g. club@campusx.edu"
              />
            </label>
            <label>
              Meeting Schedule
              <input
                value={form.meetingSchedule}
                onChange={(e) => setForm({ ...form, meetingSchedule: e.target.value })}
                placeholder="e.g. Alternate Thursdays 5:00 PM"
              />
            </label>
            <label>
              Club Icon Emoji
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g. 💻, 🤖, 🎸, 🎨"
              />
            </label>
          </div>
          <label>
            Mission & Activities Description
            <textarea
              className="notice-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe goals, hackathons, and upcoming workshops."
              rows={3}
              required
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Registering…" : "Register Club"}
            </button>
          </div>
        </form>
      )}

      <div className="days-tabs" style={{ marginBottom: "1rem" }}>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={"day-tab" + (category === c ? " active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted small">Loading clubs & societies…</p>
      ) : (
        <div className="cards-grid">
          {filtered.map((club) => (
            <div className="item-card" key={club._id}>
              <div className="club-header">
                <span className="club-icon">{club.icon || "🎯"}</span>
                <div>
                  <strong style={{ fontSize: "1.05rem", color: "var(--ink)", display: "block" }}>
                    {club.name}
                  </strong>
                  <span className="badge badge-purple" style={{ marginTop: "0.2rem", display: "inline-block" }}>
                    {club.category}
                  </span>
                </div>
              </div>
              <p className="small muted" style={{ margin: 0, lineHeight: 1.45 }}>
                {club.description}
              </p>
              <div className="small muted" style={{ display: "grid", gap: "0.25rem", background: "#f1f5f9", padding: "0.5rem 0.7rem", borderRadius: "8px" }}>
                <span>👤 <strong>Lead:</strong> {club.coordinator}</span>
                <span>⏰ <strong>Schedule:</strong> {club.meetingSchedule || "Weekly"}</span>
                <span>👥 <strong>Active Members:</strong> {club.memberCount || 1}</span>
              </div>
              <button
                type="button"
                className={club.isMember ? "btn-ghost" : "btn-sm"}
                style={{ width: "100%", marginTop: "0.3rem" }}
                onClick={() => toggleMembership(club)}
              >
                {club.isMember ? "✓ Joined (Leave Club)" : "+ Join Club"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Campus Marketplace Component ───────────────────────────────────────────
function Marketplace({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactModal, setContactModal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Books",
    price: "",
    condition: "Good",
    sellerName: user.name || "",
    contactInfo: "",
  });

  const loadItems = () => {
    setLoading(true);
    setError("");
    api("/marketplace")
      .then(setItems)
      .catch((err) => setError(err.message || "Failed to load listings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const categories = [
    "All",
    "Books",
    "Electronics",
    "Stationery",
    "Cycles/Vehicles",
    "Dorm/Hostel",
    "Other",
  ];

  const filtered = items.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.sellerName && item.sellerName.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const toggleStatus = async (item) => {
    const nextStatus = item.status === "Available" ? "Sold" : "Available";
    try {
      const updated = await api(`/marketplace/${item._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setItems((prev) => prev.map((it) => (it._id === item._id ? updated : it)));
    } catch (err) {
      setError(err.message || "Failed to update item status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || !form.contactInfo.trim()) {
      setError("Title, Price and Contact details are required");
      return;
    }
    setSaving(true);
    try {
      const created = await api("/marketplace", { method: "POST", body: form });
      setItems([created, ...items]);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        category: "Books",
        price: "",
        condition: "Good",
        sellerName: user.name || "",
        contactInfo: "",
      });
    } catch (err) {
      setError(err.message || "Failed to post listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api(`/marketplace/${id}`, { method: "DELETE" });
      setItems(items.filter((it) => it._id !== id));
    } catch (err) {
      setError("Failed to delete listing: " + err.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Campus Marketplace (Peer-to-Peer)</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Sell an Item"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.8rem" }}>{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>Create Item Listing</strong>
          <div className="form-grid">
            <label>
              Item Title *
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Engineering Graphics Drawing Kit"
                required
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Price (₹) *
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 450"
                required
              />
            </label>
            <label>
              Condition
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              >
                <option value="Brand New">Brand New (Unused)</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good Condition</option>
                <option value="Fair">Fair / Usable</option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              Seller Name
              <input
                value={form.sellerName}
                onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                placeholder="Your Name"
              />
            </label>
            <label>
              Contact Info (WhatsApp / Hostel Room) *
              <input
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="e.g. WhatsApp: +91 9876543210 (Block B Room 102)"
                required
              />
            </label>
          </div>
          <label>
            Item Details & Reason for Selling
            <textarea
              className="notice-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="State any wear and tear, included accessories, etc."
              rows={3}
              required
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Listing…" : "Post Listing"}
            </button>
          </div>
        </form>
      )}

      {contactModal && (
        <div className="form-card" style={{ border: "2px solid var(--blue)", background: "#eff6ff" }}>
          <strong>📞 Seller Contact Details</strong>
          <p style={{ margin: "0.2rem 0" }}>
            <strong>Item:</strong> {contactModal.title} (₹{contactModal.price})
          </p>
          <p style={{ margin: "0.2rem 0" }}>
            <strong>Seller:</strong> {contactModal.sellerName}
          </p>
          <div className="seller-box" style={{ marginTop: "0.4rem" }}>
            {contactModal.contactInfo}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-sm" onClick={() => setContactModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="notice-search">
        <input
          type="text"
          placeholder="Search items by name, category or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="days-tabs" style={{ marginBottom: "1rem" }}>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={"day-tab" + (category === c ? " active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted small">Loading marketplace listings…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-day">
          <p className="muted small">No items listed in this category right now.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((item) => (
            <div className="item-card" key={item._id}>
              <div className="item-card-header">
                <span className="price-tag">₹{item.price}</span>
                <span className={"badge " + (item.status === "Sold" ? "badge-red" : "badge-green")}>
                  {item.status}
                </span>
              </div>
              <strong style={{ fontSize: "1rem", color: "var(--ink)" }}>{item.title}</strong>
              <div className="note-meta">
                <span className="badge badge-blue">{item.category}</span>
                <span>✨ {item.condition}</span>
              </div>
              <p className="small muted" style={{ margin: 0, lineHeight: 1.4 }}>
                {item.description}
              </p>
              <div className="small muted" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>👤 {item.sellerName}</span>
              </div>
              <div className="row" style={{ marginTop: "0.4rem", paddingTop: "0.5rem", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  className="btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setContactModal(item)}
                >
                  Contact Seller
                </button>
                {item.isOwner && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                    onClick={() => toggleStatus(item)}
                  >
                    {item.status === "Available" ? "Mark Sold" : "Mark Available"}
                  </button>
                )}
                {item.isOwner && (
                  <button
                    type="button"
                    className="btn-del"
                    title="Delete listing"
                    onClick={() => handleDelete(item._id)}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Lost & Found Component ─────────────────────────────────────────────────
function LostAndFound({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactView, setContactView] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    category: "ID Card",
    location: "",
    date: new Date().toLocaleDateString("en-IN"),
    contactInfo: "",
    reporterName: user.name || "",
  });

  const loadItems = () => {
    setLoading(true);
    setError("");
    api("/lostfound")
      .then(setItems)
      .catch((err) => setError(err.message || "Failed to load reports"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const categories = [
    "ID Card",
    "Electronics",
    "Keys",
    "Bags/Books",
    "Bottles/Accessories",
    "Other",
  ];

  const filtered = items.filter((item) => {
    const matchType = typeFilter === "all" || item.type === typeFilter;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const toggleStatus = async (item) => {
    const next = item.status === "open" ? "resolved" : "open";
    try {
      const updated = await api(`/lostfound/${item._id}/status`, {
        method: "PATCH",
        body: { status: next },
      });
      setItems((prev) => prev.map((it) => (it._id === item._id ? updated : it)));
    } catch (err) {
      setError(err.message || "Failed to update report status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.contactInfo.trim()) {
      setError("Title, Location and Contact details are required");
      return;
    }
    setSaving(true);
    try {
      const created = await api("/lostfound", { method: "POST", body: form });
      setItems([created, ...items]);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        type: "lost",
        category: "ID Card",
        location: "",
        date: new Date().toLocaleDateString("en-IN"),
        contactInfo: "",
        reporterName: user.name || "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit report");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lost & found report?")) return;
    try {
      await api(`/lostfound/${id}`, { method: "DELETE" });
      setItems(items.filter((it) => it._id !== id));
    } catch (err) {
      setError("Failed to delete report: " + err.message);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Lost & Found Desk</h2>
        <button
          type="button"
          className="btn-sm"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Report Item"}
        </button>
      </div>

      {error && <p className="error" style={{ marginBottom: "0.8rem" }}>{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <strong>Report a Lost or Found Belonging</strong>
          <div className="form-grid">
            <label>
              Report Type *
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="lost">I LOST an item</option>
                <option value="found">I FOUND an item</option>
              </select>
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Item Title *
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Lost HP Wireless Mouse"
                required
              />
            </label>
            <label>
              Location *
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. CS Lab 2 desk 14"
                required
              />
            </label>
            <label>
              Date Noticed / Found
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. 31 Oct 2026"
              />
            </label>
            <label>
              Contact / Claim Info *
              <input
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="e.g. Security Desk Gate 1 or Call 98765 43210"
                required
              />
            </label>
          </div>
          <label>
            Item Description & Distinguishing Marks
            <textarea
              className="notice-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Color, brand, stickers, serial number, lanyard, etc."
              rows={3}
              required
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-sm" disabled={saving}>
              {saving ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      )}

      {contactView && (
        <div className="form-card" style={{ border: "2px solid var(--blue)", background: "#eff6ff" }}>
          <strong>Claim / Contact Information</strong>
          <p style={{ margin: "0.2rem 0" }}>
            <strong>Item:</strong> {contactView.title}
          </p>
          <p style={{ margin: "0.2rem 0" }}>
            <strong>Location:</strong> {contactView.location}
          </p>
          <div className="seller-box" style={{ marginTop: "0.4rem" }}>
            {contactView.contactInfo}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-sm" onClick={() => setContactView(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="notice-search">
        <input
          type="text"
          placeholder="Search lost & found by item, location or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="days-tabs" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={"day-tab" + (typeFilter === "all" ? " active" : "")}
          onClick={() => setTypeFilter("all")}
        >
          All Items ({items.length})
        </button>
        <button
          type="button"
          className={"day-tab" + (typeFilter === "lost" ? " active" : "")}
          onClick={() => setTypeFilter("lost")}
        >
          Lost Items ({items.filter((i) => i.type === "lost").length})
        </button>
        <button
          type="button"
          className={"day-tab" + (typeFilter === "found" ? " active" : "")}
          onClick={() => setTypeFilter("found")}
        >
          Found Items ({items.filter((i) => i.type === "found").length})
        </button>
      </div>

      {loading ? (
        <p className="muted small">Loading lost & found notices…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-day">
          <p className="muted small">No records found matching your selection.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((item) => (
            <div
              className={"item-card " + (item.type === "lost" ? "lf-type-lost" : "lf-type-found")}
              key={item._id}
            >
              <div className="item-card-header">
                <span className={"badge " + (item.type === "lost" ? "badge-amber" : "badge-green")}>
                  {item.type === "lost" ? "⚠️ LOST" : "🎉 FOUND"}
                </span>
                <span className={"badge " + (item.status === "resolved" ? "badge-blue" : "badge-red")}>
                  {item.status === "resolved" ? "✓ Returned" : "Active"}
                </span>
              </div>
              <strong style={{ fontSize: "1rem", color: "var(--ink)" }}>{item.title}</strong>
              <div className="event-details">
                <span>📍 <strong>Location:</strong> {item.location}</span>
                <span>📅 <strong>Date:</strong> {item.date}</span>
                <span>🏷️ <strong>Category:</strong> {item.category}</span>
              </div>
              <p className="small muted" style={{ margin: 0, lineHeight: 1.4 }}>
                {item.description}
              </p>
              <div className="row" style={{ marginTop: "0.4rem", paddingTop: "0.5rem", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  className="btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setContactView(item)}
                >
                  Contact / Claim
                </button>
                {item.isOwner && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                    onClick={() => toggleStatus(item)}
                  >
                    {item.status === "open" ? "Mark Returned" : "Reopen"}
                  </button>
                )}
                {item.isOwner && (
                  <button
                    type="button"
                    className="btn-del"
                    title="Delete report"
                    onClick={() => handleDelete(item._id)}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── AI Assistant Component ─────────────────────────────────────────────────
function AiAssistant({ user }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `👋 Hello ${user.name.split(" ")[0]}! I am your **CampusX AI Assistant**.\n\nI can answer questions regarding your **attendance status**, **today's routine**, **NotesHub materials**, **campus library/canteen rules**, and general university guidelines!`,
      engine: "CampusX Knowledge Engine",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const QUICK_PROMPTS = [
    "How is my attendance?",
    "What classes do I have today?",
    "What is the 75% attendance rule?",
    "Where can I find study notes?",
    "Tell me about campus clubs & fests",
    "Central library timings",
    "Campus Wi-Fi login guide",
  ];

  const ask = async (customText) => {
    const text = customText || input;
    if (!text.trim() || busy) return;
    setInput("");
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    try {
      const res = await api("/ai/chat", {
        method: "POST",
        body: { message: text },
      });
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.reply,
          engine: res.engine || "CampusX Knowledge Engine",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ " + (err.message || "Failed to reach AI server. Please verify backend is running."),
          engine: "System Alert",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" style={{ padding: 0 }}>
      <div className="ai-container">
        <div className="ai-header">
          <div>
            <strong style={{ fontSize: "1.1rem" }}>CampusX AI Assistant</strong>
            <p style={{ margin: 0, fontSize: "0.78rem", opacity: 0.9 }}>
              Intelligent Campus Guidance & Academic Engine
            </p>
          </div>
          <span className="badge badge-green" style={{ color: "#065f46" }}>
            Online & Ready
          </span>
        </div>

        <div className="ai-quick-pills">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              className="quick-pill"
              onClick={() => ask(p)}
              disabled={busy}
            >
              💬 {p}
            </button>
          ))}
        </div>

        <div className="ai-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={"msg " + m.sender}>
              <div className="msg-bubble">
                <div style={{ fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.25rem", opacity: 0.8 }}>
                  {m.sender === "user" ? user.name : "🤖 CampusX Assistant"}
                  {m.engine && <span style={{ marginLeft: "0.5rem", fontWeight: "normal" }}>({m.engine})</span>}
                </div>
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="msg bot">
              <div className="msg-bubble muted small">
                Thinking and preparing response…
              </div>
            </div>
          )}
        </div>

        <form
          className="ai-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <input
            type="text"
            placeholder="Ask anything about timetable, attendance, notes, or campus facilities..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button type="submit" className="btn-sm" disabled={busy || !input.trim()}>
            Send ➜
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Profile Manager Component ──────────────────────────────────────────────
function ProfileManager({ user, onProfileUpdated }) {
  const [form, setForm] = useState({
    name: user.name || "",
    collegeId: user.collegeId || "",
    branch: user.branch || "B.Tech CSE",
    semester: user.semester || 1,
    role: user.role || "student",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const res = await api("/auth/profile", { method: "PUT", body: form });
      setMsg("✓ Profile updated successfully!");
      if (res.token) setToken(res.token);
      if (onProfileUpdated && res.user) onProfileUpdated(res.user);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel profile-card">
      <div className="panel-head">
        <h2>Student Profile & Settings</h2>
        <span className={"badge " + (user.role === "admin" ? "badge-red" : "badge-blue")}>
          {user.role === "admin" ? "🛡️ Administrator" : "🎓 Verified Student"}
        </span>
      </div>

      {msg && <p className="small" style={{ color: "var(--green)", fontWeight: 600 }}>{msg}</p>}
      {error && <p className="error">{error}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <div className="profile-avatar">
          {user.name ? user.name[0].toUpperCase() : "S"}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--ink)" }}>{user.name}</h3>
          <p className="muted small" style={{ margin: "0.2rem 0" }}>{user.email}</p>
          <span className="badge badge-purple">{user.branch} · Sem {user.semester}</span>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSave} style={{ marginTop: "0.5rem" }}>
        <strong>Edit Academic Information</strong>
        <div className="form-grid">
          <label>
            Full Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            College Roll / ID
            <input
              value={form.collegeId}
              onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
              placeholder="e.g. CSE22B047"
            />
          </label>
          <label>
            Department / Branch
            <input
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              placeholder="e.g. B.Tech Computer Science"
              required
            />
          </label>
          <label>
            Current Semester
            <input
              type="number"
              min="1"
              max="8"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              required
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-sm" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      {user.role === "admin" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "1rem", marginTop: "0.5rem" }}>
          <strong style={{ color: "var(--red)", fontSize: "0.95rem" }}>🛡️ Verified Administrator Account</strong>
          <p className="small muted" style={{ margin: "0.25rem 0 0.6rem" }}>
            You have full system access to manage student accounts, circulars, routines, and campus moderation via the Admin Panel.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Administrator Control Panel ───────────────────────────────────────────
function AdminDashboard({ user, onSwitchToStudent }) {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Data collections
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [notices, setNotices] = useState([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    body: "",
    category: "General",
    priority: "normal",
    postedBy: "Campus Administration",
  });

  const [routines, setRoutines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "Technical",
    organizer: "Campus Administration",
    capacity: 200,
  });

  const [clubs, setClubs] = useState([]);
  const [showClubForm, setShowClubForm] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    category: "Technical",
    description: "",
    coordinator: "",
    contactEmail: "",
    meetingSchedule: "Weekly",
    icon: "🎯",
  });

  const [marketItems, setMarketItems] = useState([]);
  const [lostFound, setLostFound] = useState([]);

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const data = await api("/admin/stats");
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to fetch stats");
    }
  };

  // Fetch active tab data
  const loadTabData = async (currentTab) => {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      if (currentTab === "Overview") await fetchStats();
      if (currentTab === "Students") {
        const u = await api("/admin/users");
        setUsers(u);
      }
      if (currentTab === "Notices") {
        const n = await api("/admin/notices");
        setNotices(n);
      }
      if (currentTab === "Routines") {
        const r = await api("/admin/routines");
        setRoutines(r);
      }
      if (currentTab === "Notes") {
        const nt = await api("/admin/notes");
        setNotes(nt);
      }
      if (currentTab === "Events") {
        const ev = await api("/admin/events");
        setEvents(ev);
      }
      if (currentTab === "Clubs") {
        const cl = await api("/admin/clubs");
        setClubs(cl);
      }
      if (currentTab === "Marketplace") {
        const m = await api("/admin/marketplace");
        setMarketItems(m);
      }
      if (currentTab === "Lost & Found") {
        const lf = await api("/admin/lostfound");
        setLostFound(lf);
      }
    } catch (err) {
      setError(err.message || `Failed to load ${currentTab} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    loadTabData(tab);
  }, [tab]);

  // Security guard
  if (!user || user.role !== "admin") {
    return (
      <section className="panel empty">
        <h2 style={{ color: "var(--red)" }}>403 – Access Forbidden</h2>
        <p className="muted">Administrator privileges are required to view this panel.</p>
        <button type="button" className="btn-sm" onClick={onSwitchToStudent}>
          Return to Student Dashboard
        </button>
      </section>
    );
  }

  // User role toggle
  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "student" : "admin";
    if (
      !window.confirm(
        `Are you sure you want to change ${targetUser.name}'s role to ${nextRole.toUpperCase()}?`
      )
    )
      return;
    try {
      await api(`/admin/users/${targetUser._id}/role`, {
        method: "PATCH",
        body: { role: nextRole },
      });
      setMsg(`Updated ${targetUser.name}'s role to ${nextRole}`);
      setUsers(
        users.map((u) => (u._id === targetUser._id ? { ...u, role: nextRole } : u))
      );
    } catch (err) {
      setError(err.message || "Failed to update user role");
    }
  };

  // Delete user account
  const handleDeleteUser = async (targetUser) => {
    if (
      !window.confirm(
        `⚠️ PERMANENT DELETION WARNING:\n\nDelete user ${targetUser.email} (${targetUser.name})? All their attendance and routine records will be deleted.`
      )
    )
      return;
    try {
      await api(`/admin/users/${targetUser._id}`, { method: "DELETE" });
      setMsg(`User ${targetUser.email} was removed.`);
      setUsers(users.filter((u) => u._id !== targetUser._id));
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  // Notice operations
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const created = await api("/admin/notices", { method: "POST", body: noticeForm });
      setNotices([created, ...notices]);
      setShowNoticeForm(false);
      setNoticeForm({
        title: "",
        body: "",
        category: "General",
        priority: "normal",
        postedBy: "Campus Administration",
      });
      setMsg("Official circular published successfully!");
    } catch (err) {
      setError(err.message || "Failed to create notice");
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this college notice?")) return;
    try {
      await api(`/admin/notices/${id}`, { method: "DELETE" });
      setNotices(notices.filter((n) => n._id !== id));
      setMsg("Notice deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete notice");
    }
  };

  // Routine operations
  const handleDeleteRoutine = async (id) => {
    if (!window.confirm("Delete this routine slot?")) return;
    try {
      await api(`/admin/routines/${id}`, { method: "DELETE" });
      setRoutines(routines.filter((r) => r._id !== id));
      setMsg("Routine slot removed.");
    } catch (err) {
      setError(err.message || "Failed to delete routine slot");
    }
  };

  // Note operations
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this study note from repository?")) return;
    try {
      await api(`/admin/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter((n) => n._id !== id));
      setMsg("Note resource deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete note");
    }
  };

  // Event operations
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const created = await api("/admin/events", { method: "POST", body: eventForm });
      setEvents([created, ...events]);
      setShowEventForm(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        category: "Technical",
        organizer: "Campus Administration",
        capacity: 200,
      });
      setMsg("Campus event published!");
    } catch (err) {
      setError(err.message || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Cancel and delete this campus event?")) return;
    try {
      await api(`/admin/events/${id}`, { method: "DELETE" });
      setEvents(events.filter((e) => e._id !== id));
      setMsg("Event cancelled and removed.");
    } catch (err) {
      setError(err.message || "Failed to delete event");
    }
  };

  // Club operations
  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const created = await api("/admin/clubs", { method: "POST", body: clubForm });
      setClubs([...clubs, created]);
      setShowClubForm(false);
      setClubForm({
        name: "",
        category: "Technical",
        description: "",
        coordinator: "",
        contactEmail: "",
        meetingSchedule: "Weekly",
        icon: "🎯",
      });
      setMsg("Student club registered!");
    } catch (err) {
      setError(err.message || "Failed to register club");
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Delete this student club and membership records?")) return;
    try {
      await api(`/admin/clubs/${id}`, { method: "DELETE" });
      setClubs(clubs.filter((c) => c._id !== id));
      setMsg("Club removed.");
    } catch (err) {
      setError(err.message || "Failed to delete club");
    }
  };

  // Marketplace moderation
  const handleToggleMarketStatus = async (item) => {
    const nextStatus = item.status === "Available" ? "Sold" : "Available";
    try {
      const updated = await api(`/admin/marketplace/${item._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setMarketItems(marketItems.map((it) => (it._id === item._id ? updated : it)));
    } catch (err) {
      setError(err.message || "Failed to update item status");
    }
  };

  const handleDeleteMarketItem = async (id) => {
    if (!window.confirm("Remove this marketplace listing?")) return;
    try {
      await api(`/admin/marketplace/${id}`, { method: "DELETE" });
      setMarketItems(marketItems.filter((it) => it._id !== id));
      setMsg("Listing removed.");
    } catch (err) {
      setError(err.message || "Failed to delete listing");
    }
  };

  // Lost & Found moderation
  const handleToggleLostStatus = async (item) => {
    const nextStatus = item.status === "open" ? "resolved" : "open";
    try {
      const updated = await api(`/admin/lostfound/${item._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setLostFound(lostFound.map((it) => (it._id === item._id ? updated : it)));
    } catch (err) {
      setError(err.message || "Failed to update report status");
    }
  };

  const handleDeleteLostFound = async (id) => {
    if (!window.confirm("Delete this lost & found report?")) return;
    try {
      await api(`/admin/lostfound/${id}`, { method: "DELETE" });
      setLostFound(lostFound.filter((it) => it._id !== id));
      setMsg("Report removed.");
    } catch (err) {
      setError(err.message || "Failed to delete report");
    }
  };

  // Filtered users for user management tab
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const q = userQuery.toLowerCase();
    const matchQ =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.collegeId && u.collegeId.toLowerCase().includes(q)) ||
      (u.branch && u.branch.toLowerCase().includes(q));
    return matchRole && matchQ;
  });

  const ADMIN_TABS = [
    "Overview",
    "Students",
    "Notices",
    "Routines",
    "Notes",
    "Events",
    "Clubs",
    "Marketplace",
    "Lost & Found",
  ];

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      {/* Admin Top Header */}
      <div className="admin-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>CampusX Administrator Portal</h1>
            <span className="admin-badge">VERIFIED ADMIN</span>
          </div>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem", opacity: 0.85 }}>
            Centralized Management for Academic Records, Students, Moderation & Circulars
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          style={{ background: "#fff", color: "var(--ink)", borderColor: "#fff", fontWeight: 700 }}
          onClick={onSwitchToStudent}
        >
          ↩️ Return to Student View
        </button>
      </div>

      {msg && <p className="small" style={{ color: "var(--green)", fontWeight: 700, margin: 0 }}>✓ {msg}</p>}
      {error && <p className="error">{error}</p>}

      {/* Admin Subtabs Navigation */}
      <div className="admin-nav">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t === "Overview" && "📊 "}
            {t === "Students" && "👥 "}
            {t === "Notices" && "📢 "}
            {t === "Routines" && "📅 "}
            {t === "Notes" && "📚 "}
            {t === "Events" && "🎉 "}
            {t === "Clubs" && "🚀 "}
            {t === "Marketplace" && "🛒 "}
            {t === "Lost & Found" && "🔍 "}
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="muted small">Loading {tab} records from database…</p>}

      {/* ── TAB 1: OVERVIEW & STATS ── */}
      {tab === "Overview" && stats && (
        <section className="panel">
          <h2>Campus-Wide Statistics & System Metrics</h2>
          <div className="stat-grid-4">
            <div className="stat-box">
              <span>REGISTERED STUDENTS</span>
              <strong>{stats.users?.students || 0}</strong>
              <small className="muted">Total enrolled accounts</small>
            </div>
            <div className="stat-box">
              <span>ADMINISTRATORS</span>
              <strong style={{ color: "var(--red)" }}>{stats.users?.admins || 0}</strong>
              <small className="muted">System admin access</small>
            </div>
            <div className="stat-box">
              <span>ATTENDANCE RECORDS</span>
              <strong style={{ color: "var(--blue)" }}>{stats.academic?.attendance || 0}</strong>
              <small className="muted">Subject records tracked</small>
            </div>
            <div className="stat-box">
              <span>CLASS TIMETABLES</span>
              <strong style={{ color: "var(--green)" }}>{stats.academic?.routines || 0}</strong>
              <small className="muted">Weekly schedule slots</small>
            </div>
            <div className="stat-box">
              <span>NOTICES & CIRCULARS</span>
              <strong>{stats.campus?.notices || 0}</strong>
              <small className="muted">Active publications</small>
            </div>
            <div className="stat-box">
              <span>NOTES REPOSITORY</span>
              <strong>{stats.academic?.notes || 0}</strong>
              <small className="muted">Syllabus PDF files</small>
            </div>
            <div className="stat-box">
              <span>CAMPUS EVENTS</span>
              <strong>{stats.campus?.events || 0}</strong>
              <small className="muted">Fests & workshops</small>
            </div>
            <div className="stat-box">
              <span>STUDENT CLUBS</span>
              <strong>{stats.campus?.clubs || 0}</strong>
              <small className="muted">Recognized societies</small>
            </div>
            <div className="stat-box">
              <span>MARKETPLACE ITEMS</span>
              <strong>{stats.services?.marketplace || 0}</strong>
              <small className="muted">Peer-to-peer listings</small>
            </div>
            <div className="stat-box">
              <span>LOST & FOUND REPORTS</span>
              <strong>{stats.services?.lostfound || 0}</strong>
              <small className="muted">Reported campus items</small>
            </div>
          </div>

          <h3 style={{ fontSize: "1rem", marginTop: "1.2rem" }}>Quick Admin Navigation</h3>
          <div className="quick-grid">
            <button type="button" className="quick-btn" onClick={() => setTab("Students")}>
              <strong>👥 Manage Students</strong>
              <span>Review roles & user profiles</span>
            </button>
            <button type="button" className="quick-btn" onClick={() => setTab("Notices")}>
              <strong>📢 Post College Notice</strong>
              <span>Exam datesheets & holiday alerts</span>
            </button>
            <button type="button" className="quick-btn" onClick={() => setTab("Events")}>
              <strong>🎉 Organize Event</strong>
              <span>Create hackathons & fests</span>
            </button>
            <button type="button" className="quick-btn" onClick={() => setTab("Marketplace")}>
              <strong>🛒 Moderate Marketplace</strong>
              <span>Manage student sales listings</span>
            </button>
          </div>
        </section>
      )}

      {/* ── TAB 2: STUDENT ACCOUNTS ── */}
      {tab === "Students" && (
        <section className="panel">
          <div className="panel-head">
            <h2>User Account Management ({filteredUsers.length})</h2>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search by student name, roll number, email, or department..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              style={{ flex: 1, minWidth: "220px", padding: "0.55rem 0.8rem", border: "1px solid var(--line)", borderRadius: "8px", font: "inherit" }}
            />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{ padding: "0.55rem 0.8rem", border: "1px solid var(--line)", borderRadius: "8px", font: "inherit" }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Roll / ID</th>
                  <th>Branch & Sem</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td className="muted">{u.email}</td>
                    <td>{u.collegeId || "—"}</td>
                    <td>{u.branch} · Sem {u.semester}</td>
                    <td>
                      <span className={"badge " + (u.role === "admin" ? "badge-red" : "badge-blue")}>
                        {u.role === "admin" ? "ADMIN" : "STUDENT"}
                      </span>
                    </td>
                    <td>
                      {u._id !== user.id ? (
                        <>
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => handleToggleRole(u)}
                          >
                            {u.role === "admin" ? "Demote" : "Promote to Admin"}
                          </button>
                          <button
                            type="button"
                            className="btn-action-del"
                            onClick={() => handleDeleteUser(u)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="muted small">(Current User)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 3: NOTICES MANAGEMENT ── */}
      {tab === "Notices" && (
        <section className="panel">
          <div className="panel-head">
            <h2>College Notices Management ({notices.length})</h2>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setShowNoticeForm(!showNoticeForm)}
            >
              {showNoticeForm ? "Cancel" : "+ Post Notice"}
            </button>
          </div>

          {showNoticeForm && (
            <form className="form-card" onSubmit={handleCreateNotice} style={{ marginBottom: "1.2rem" }}>
              <strong>Publish Official Campus Circular</strong>
              <div className="form-grid">
                <label>
                  Notice Title *
                  <input
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="e.g. End-Semester Examination Schedule"
                    required
                  />
                </label>
                <label>
                  Category
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  >
                    <option value="Exam">Exam</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                    <option value="Event">Event</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">Urgent Priority (Red Banner)</option>
                  </select>
                </label>
                <label>
                  Issuing Authority
                  <input
                    value={noticeForm.postedBy}
                    onChange={(e) => setNoticeForm({ ...noticeForm, postedBy: e.target.value })}
                    placeholder="e.g. Dean Academic Affairs"
                  />
                </label>
              </div>
              <label>
                Full Notice Description *
                <textarea
                  className="notice-textarea"
                  value={noticeForm.body}
                  onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                  placeholder="Enter dates, guidelines, eligibility criteria..."
                  rows={4}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowNoticeForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-sm">
                  Publish Circular
                </button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Issued By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n._id}>
                    <td><strong>{n.title}</strong></td>
                    <td><span className="badge badge-blue">{n.category}</span></td>
                    <td>
                      <span className={"badge " + (n.priority === "high" ? "badge-red" : "badge-green")}>
                        {n.priority}
                      </span>
                    </td>
                    <td>{n.postedBy || "Administration"}</td>
                    <td className="muted">{new Date(n.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteNotice(n._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 4: ROUTINES MANAGEMENT ── */}
      {tab === "Routines" && (
        <section className="panel">
          <div className="panel-head">
            <h2>Class Timetable Slots Across Campus ({routines.length})</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Time Slot</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Assigned User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routines.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{DAY_NAMES[r.day] || "Mon"}</strong></td>
                    <td>{r.subject}</td>
                    <td className="muted">{r.startTime} – {r.endTime}</td>
                    <td>{r.faculty || "TBA"}</td>
                    <td>{r.room || "TBA"}</td>
                    <td className="small muted">{r.user?.name || "Student"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteRoutine(r._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 5: NOTES REPOSITORY ── */}
      {tab === "Notes" && (
        <section className="panel">
          <div className="panel-head">
            <h2>NotesHub Resources Repository ({notes.length})</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Title</th>
                  <th>Unit</th>
                  <th>Format</th>
                  <th>Uploaded By</th>
                  <th>Downloads</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((nt) => (
                  <tr key={nt._id}>
                    <td><span className="badge badge-blue">{nt.subject}</span></td>
                    <td><strong>{nt.title}</strong></td>
                    <td>{nt.unit || "All"}</td>
                    <td>{nt.fileType || "PDF"}</td>
                    <td className="muted">{nt.uploadedBy || "Student"}</td>
                    <td>📥 {nt.downloads || 0}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteNote(nt._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 6: EVENTS MANAGEMENT ── */}
      {tab === "Events" && (
        <section className="panel">
          <div className="panel-head">
            <h2>Campus Fests & Events Management ({events.length})</h2>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setShowEventForm(!showEventForm)}
            >
              {showEventForm ? "Cancel" : "+ Add Event"}
            </button>
          </div>

          {showEventForm && (
            <form className="form-card" onSubmit={handleCreateEvent} style={{ marginBottom: "1rem" }}>
              <strong>Publish New Campus Event</strong>
              <div className="form-grid">
                <label>
                  Event Title *
                  <input
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Category
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </label>
                <label>
                  Date *
                  <input
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    placeholder="e.g. 20 Nov 2026"
                    required
                  />
                </label>
                <label>
                  Time *
                  <input
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    required
                  />
                </label>
                <label>
                  Venue *
                  <input
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Organizer
                  <input
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Description *
                <textarea
                  className="notice-textarea"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowEventForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-sm">
                  Publish Event
                </button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>RSVPs</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id}>
                    <td><strong>{ev.title}</strong></td>
                    <td><span className="badge badge-amber">{ev.category}</span></td>
                    <td className="muted">{ev.date} · {ev.time}</td>
                    <td>{ev.venue}</td>
                    <td>👥 {ev.registeredCount || ev.registeredUsers?.length || 0} registered</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteEvent(ev._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 7: CLUBS MANAGEMENT ── */}
      {tab === "Clubs" && (
        <section className="panel">
          <div className="panel-head">
            <h2>Clubs & Student Societies ({clubs.length})</h2>
            <button
              type="button"
              className="btn-sm"
              onClick={() => setShowClubForm(!showClubForm)}
            >
              {showClubForm ? "Cancel" : "+ Add Club"}
            </button>
          </div>

          {showClubForm && (
            <form className="form-card" onSubmit={handleCreateClub} style={{ marginBottom: "1rem" }}>
              <strong>Register Official Student Society</strong>
              <div className="form-grid">
                <label>
                  Club Name *
                  <input
                    value={clubForm.name}
                    onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Category
                  <select
                    value={clubForm.category}
                    onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Innovation">Innovation</option>
                    <option value="Social">Social</option>
                  </select>
                </label>
                <label>
                  Coordinator *
                  <input
                    value={clubForm.coordinator}
                    onChange={(e) => setClubForm({ ...clubForm, coordinator: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Schedule
                  <input
                    value={clubForm.meetingSchedule}
                    onChange={(e) => setClubForm({ ...clubForm, meetingSchedule: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Description *
                <textarea
                  className="notice-textarea"
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  rows={2}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowClubForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-sm">
                  Register Club
                </button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>Category</th>
                  <th>Coordinator</th>
                  <th>Meeting Schedule</th>
                  <th>Members</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span style={{ marginRight: "0.4rem" }}>{c.icon || "🎯"}</span>
                      <strong>{c.name}</strong>
                    </td>
                    <td><span className="badge badge-purple">{c.category}</span></td>
                    <td>{c.coordinator}</td>
                    <td className="muted">{c.meetingSchedule || "Weekly"}</td>
                    <td>👥 {c.members?.length || 1}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteClub(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 8: MARKETPLACE MODERATION ── */}
      {tab === "Marketplace" && (
        <section className="panel">
          <div className="panel-head">
            <h2>Campus Marketplace Listings Moderation ({marketItems.length})</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Condition</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {marketItems.map((it) => (
                  <tr key={it._id}>
                    <td><strong>{it.title}</strong></td>
                    <td><span className="badge badge-blue">{it.category}</span></td>
                    <td><strong>₹{it.price}</strong></td>
                    <td>{it.condition}</td>
                    <td className="muted">{it.sellerName}</td>
                    <td>
                      <button
                        type="button"
                        className={"badge " + (it.status === "Sold" ? "badge-red" : "badge-green")}
                        style={{ cursor: "pointer", border: 0 }}
                        onClick={() => handleToggleMarketStatus(it)}
                      >
                        {it.status}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteMarketItem(it._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB 9: LOST & FOUND MODERATION ── */}
      {tab === "Lost & Found" && (
        <section className="panel">
          <div className="panel-head">
            <h2>Lost & Found Reports Moderation ({lostFound.length})</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lostFound.map((lf) => (
                  <tr key={lf._id}>
                    <td>
                      <span className={"badge " + (lf.type === "lost" ? "badge-amber" : "badge-green")}>
                        {lf.type.toUpperCase()}
                      </span>
                    </td>
                    <td><strong>{lf.title}</strong></td>
                    <td>{lf.category}</td>
                    <td className="muted">{lf.location}</td>
                    <td className="small">{lf.contactInfo}</td>
                    <td>
                      <button
                        type="button"
                        className={"badge " + (lf.status === "resolved" ? "badge-blue" : "badge-red")}
                        style={{ cursor: "pointer", border: 0 }}
                        onClick={() => handleToggleLostStatus(lf)}
                      >
                        {lf.status}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-del"
                        onClick={() => handleDeleteLostFound(lf._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, onProfileUpdated }) {
  const [page, setPage] = useState("Home");
  const [subjects, setSubjects] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(true);
  const [attError, setAttError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSub, setNewSub] = useState({ code: "", name: "", attended: 0, total: 0 });
  const [savingSub, setSavingSub] = useState(false);

  // Load attendance records from MongoDB
  const loadAttendance = () => {
    setLoadingAtt(true);
    setAttError("");
    api("/attendance")
      .then((data) => setSubjects(data))
      .catch((err) => setAttError(err.message || "Failed to load attendance"))
      .finally(() => setLoadingAtt(false));
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Mark attendance present or absent in MongoDB
  const mark = async (id, present) => {
    // Optimistic UI update
    setSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? { ...s, total: s.total + 1, attended: s.attended + (present ? 1 : 0) }
          : s
      )
    );

    try {
      const updated = await api(`/attendance/${id}/mark`, {
        method: "PATCH",
        body: { present },
      });
      setSubjects((prev) => prev.map((s) => (s._id === id ? updated : s)));
    } catch (err) {
      setAttError("Could not update attendance: " + err.message);
      loadAttendance();
    }
  };

  // Add a new subject to MongoDB
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSub.code.trim() || !newSub.name.trim()) return;
    setSavingSub(true);
    try {
      const created = await api("/attendance", {
        method: "POST",
        body: {
          code: newSub.code,
          name: newSub.name,
          attended: Number(newSub.attended) || 0,
          total: Number(newSub.total) || 0,
        },
      });
      setSubjects((prev) => [...prev, created]);
      setNewSub({ code: "", name: "", attended: 0, total: 0 });
      setShowAddForm(false);
      setAttError("");
    } catch (err) {
      setAttError(err.message || "Failed to add subject");
    } finally {
      setSavingSub(false);
    }
  };

  // Delete a subject from MongoDB
  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await api(`/attendance/${id}`, { method: "DELETE" });
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setAttError("Failed to delete subject: " + err.message);
    }
  };

  const avg = subjects.length
    ? Math.round(subjects.reduce((a, s) => a + pct(s), 0) / subjects.length)
    : 0;
  const atRisk = subjects.filter((s) => pct(s) < 75).length;

  const attendancePanel = (
    <AttendanceTracker
      subjects={subjects}
      loadingAtt={loadingAtt}
      attError={attError}
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      newSub={newSub}
      setNewSub={setNewSub}
      handleAddSubject={handleAddSubject}
      savingSub={savingSub}
      mark={mark}
      handleDeleteSubject={handleDeleteSubject}
    />
  );

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">CampusX</div>
        <nav>
          {NAV.map((n) => (
            <button
              key={n}
              type="button"
              className={n === page ? "active" : ""}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          {user.role === "admin" && (
            <button
              type="button"
              style={{
                background: page === "Admin Panel" ? "#991b1b" : "rgba(220, 38, 38, 0.25)",
                color: "#fff",
                fontWeight: 700,
                border: "1px solid rgba(254, 202, 202, 0.4)",
                marginTop: "0.5rem",
              }}
              className={page === "Admin Panel" ? "active" : ""}
              onClick={() => setPage("Admin Panel")}
            >
              🛡️ Admin Control Panel
            </button>
          )}
        </nav>
        <div className="me">
          <div>
            <strong>{user.name}</strong>
            <span>{user.branch} · Sem {user.semester || 1}</span>
            <span style={{ fontSize: "0.75rem", color: user.role === "admin" ? "#fca5a5" : "#93c5fd", fontWeight: 700 }}>
              {user.role === "admin" ? "🛡️ Administrator" : "🎓 Student"}
            </span>
          </div>
          <button type="button" onClick={onLogout}>Log out</button>
        </div>
      </aside>

      <main>
        {page === "Home" && (
          <>
            {user.role === "admin" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "0.8rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <strong style={{ color: "var(--red)", fontSize: "0.95rem" }}>🛡️ System Administrator Session Active</strong>
                  <span className="small muted" style={{ display: "block", marginTop: "0.15rem" }}>
                    Manage user accounts, publish university notices, and moderate campus submissions.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-sm"
                  style={{ background: "var(--red)" }}
                  onClick={() => setPage("Admin Panel")}
                >
                  Open Admin Control Panel ➜
                </button>
              </div>
            )}

            <header className="hero">
              <div>
                <h1>Welcome back, {user.name.split(" ")[0]}!</h1>
                <p>
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {user.branch} · Semester {user.semester || 1}
                </p>
              </div>
              <div className="chips">
                <span>
                  <b>{avg}%</b> avg attendance
                </span>
                <span>
                  <b>{atRisk}</b> subjects at risk
                </span>
                <span>
                  <b>5</b> active campus modules
                </span>
                <span>
                  <b>AI</b> assistant online
                </span>
              </div>
            </header>

            <section className="panel" style={{ padding: "1.2rem" }}>
              <h2 style={{ margin: "0 0 0.4rem" }}>🚀 Quick Campus Actions</h2>
              <div className="quick-grid">
                <button type="button" className="quick-btn" onClick={() => setPage("Attendance Tracker")}>
                  <strong>📊 Attendance Tracker</strong>
                  <span>Check criteria & log presence</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("Class Routine")}>
                  <strong>📅 Class Routine</strong>
                  <span>View timetable & room slots</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("Updates")}>
                  <strong>📢 College Notices</strong>
                  <span>Exam circulars & deadlines</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("NotesHub")}>
                  <strong>📚 NotesHub</strong>
                  <span>Download syllabus notes</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("Event & Fest")}>
                  <strong>🎉 Events & Fests</strong>
                  <span>RSVP for hackathons & fests</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("Club System")}>
                  <strong>🚀 Clubs & Societies</strong>
                  <span>Join GDSC, RoboX & Music</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("Campus Marketplace")}>
                  <strong>🛒 Marketplace</strong>
                  <span>Buy/sell books & drafters</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("Lost & Found")}>
                  <strong>🔍 Lost & Found</strong>
                  <span>Report items or claim keys/cards</span>
                </button>
                <button type="button" className="quick-btn" onClick={() => setPage("AI Assistant")}>
                  <strong>🤖 Ask AI Assistant</strong>
                  <span>Campus queries & advice</span>
                </button>
              </div>
            </section>

            <div className="grid">
              {attendancePanel}
              <section className="panel">
                <h2>Upcoming Featured Events</h2>
                {EVENTS.map((e) => (
                  <div className="event" key={e.title}>
                    <strong>{e.title}</strong>
                    <span className="muted small">
                      {e.when} · {e.where}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: "1rem", textAlign: "right" }}>
                  <button type="button" className="btn-sm" onClick={() => setPage("Event & Fest")}>
                    View All Events ➜
                  </button>
                </div>
              </section>
            </div>
          </>
        )}

        {page === "Attendance Tracker" && attendancePanel}

        {page === "Class Routine" && <ClassRoutine />}

        {page === "Updates" && <CollegeNotices />}

        {page === "NotesHub" && <NotesHub user={user} />}

        {page === "Event & Fest" && <EventsManager user={user} />}

        {page === "Club System" && <ClubsManager user={user} />}

        {page === "Campus Marketplace" && <Marketplace user={user} />}

        {page === "Lost & Found" && <LostAndFound user={user} />}

        {page === "AI Assistant" && <AiAssistant user={user} />}

        {page === "Profile" && <ProfileManager user={user} onProfileUpdated={onProfileUpdated} />}

        {page === "Admin Panel" && (
          <AdminDashboard user={user} onSwitchToStudent={() => setPage("Home")} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const load = () =>
    api("/auth/me")
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    if (getToken()) load();
  }, []);

  if (loading) {
    return (
      <div className="auth-wrap">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!user) return <AuthForm onAuth={load} />;

  return (
    <Dashboard
      user={user}
      onLogout={() => {
        setToken(null);
        setUser(null);
      }}
      onProfileUpdated={(updatedUser) => setUser(updatedUser)}
    />
  );
}
