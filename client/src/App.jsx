import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const NAV = ["Home","NotesHub","Event & Fest","Attendance Tracker","StoJ","Class Routine",
  "Updates","Club System","Campus Marketplace","Lost & Found","Personal Groups","Profile"];

const DEFAULT_SUBJECTS = [
  { code: "CS501", name: "Operating Systems", attended: 28, total: 34 },
  { code: "CS502", name: "Computer Networks", attended: 22, total: 34 },
  { code: "CS503", name: "DBMS", attended: 31, total: 34 },
  { code: "CS504", name: "Algorithms", attended: 24, total: 34 },
  { code: "CS505", name: "Software Engineering", attended: 29, total: 34 },
];

const EVENTS = [
  { title: "TechFest 2026 Hackathon", when: "15 May, 9:00 AM", where: "Main Auditorium" },
  { title: "Annual Cultural Fest", when: "22 May, 4:00 PM", where: "Open Air Theatre" },
  { title: "Placement Prep Workshop", when: "18 May, 11:00 AM", where: "Seminar Hall B" },
];

const pct = (s) => Math.round((s.attended / s.total) * 100);
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
    setError(""); setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: form });
      setToken(data.token);
      onAuth();
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Cannot reach the server. Start the backend on port 5000." : err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>CampusX</h1>
        <p className="muted">{mode === "login" ? "Sign in to your campus dashboard." : "Create your student account."}</p>
        {mode === "register" && (
          <>
            <label>Full name<input value={form.name} onChange={set("name")} required /></label>
            <label>College ID<input value={form.collegeId} onChange={set("collegeId")} placeholder="CSE22B047" /></label>
          </>
        )}
        <label>Email<input type="email" value={form.email} onChange={set("email")} required /></label>
        <label>Password<input type="password" minLength={6} value={form.password} onChange={set("password")} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const key = `campusx_att_${user._id}`;
  const [page, setPage] = useState("Home");
  const [subjects, setSubjects] = useState(() => JSON.parse(localStorage.getItem(key) || "null") || DEFAULT_SUBJECTS);
  useEffect(() => localStorage.setItem(key, JSON.stringify(subjects)), [subjects, key]);

  const mark = (i, present) =>
    setSubjects(subjects.map((s, j) => j === i ? { ...s, total: s.total + 1, attended: s.attended + (present ? 1 : 0) } : s));
  const avg = Math.round(subjects.reduce((a, s) => a + pct(s), 0) / subjects.length);
  const atRisk = subjects.filter((s) => pct(s) < 75).length;

  const Attendance = (
    <section className="panel">
      <h2>Attendance Tracker</h2>
      {subjects.map((s, i) => {
        const p = pct(s), a = advice(s);
        return (
          <div className="subject" key={s.code}>
            <div className="row"><strong>{s.name}</strong><span style={{ color: barColor(p) }}>{p}%</span></div>
            <div className="bar"><div style={{ width: `${p}%`, background: barColor(p) }} /></div>
            <div className="row small">
              <span className={a.risk ? "risk" : "muted"}>{a.text}</span>
              <span className="actions">
                <button onClick={() => mark(i, true)}>Present</button>
                <button onClick={() => mark(i, false)}>Absent</button>
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">CampusX</div>
        <nav>
          {NAV.map((n) => (
            <button key={n} className={n === page ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
          ))}
        </nav>
        <div className="me">
          <div><strong>{user.name}</strong><span>{user.branch}</span></div>
          <button onClick={onLogout}>Log out</button>
        </div>
      </aside>

      <main>
        {page === "Home" && (
          <>
            <header className="hero">
              <div>
                <h1>Welcome back, {user.name.split(" ")[0]}!</h1>
                <p>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {user.branch}</p>
              </div>
              <div className="chips">
                <span><b>{avg}%</b> average attendance</span>
                <span><b>{atRisk}</b> subjects at risk</span>
                <span><b>{EVENTS.length}</b> upcoming events</span>
              </div>
            </header>
            <div className="grid">
              {Attendance}
              <section className="panel">
                <h2>Upcoming Events</h2>
                {EVENTS.map((e) => (
                  <div className="event" key={e.title}>
                    <strong>{e.title}</strong>
                    <span className="muted small">{e.when} · {e.where}</span>
                  </div>
                ))}
              </section>
            </div>
          </>
        )}
        {page === "Attendance Tracker" && Attendance}
        {page !== "Home" && page !== "Attendance Tracker" && (
          <section className="panel empty">
            <h2>{page}</h2>
            <p className="muted">This module is coming in an upcoming milestone.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const load = () =>
    api("/auth/me").then(setUser).catch(() => { setToken(null); setUser(null); }).finally(() => setLoading(false));
  useEffect(() => { if (getToken()) load(); }, []);

  if (loading) return <div className="auth-wrap"><p className="muted">Loading…</p></div>;
  if (!user) return <AuthForm onAuth={load} />;
  return <Dashboard user={user} onLogout={() => { setToken(null); setUser(null); }} />;
}
