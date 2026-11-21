import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  Bell,
  BookOpen,
  ShoppingBag,
  Search,
  Bot,
  Shield,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Menu,
  X,
  Code,
  Users,
  Layers,
  Star,
  Activity,
  Check,
  Zap,
} from "lucide-react";

export default function LandingPage({
  user,
  onLaunchDashboard,
  onOpenAuth,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState(0);

  const aiPrompts = [
    {
      q: "Calculate how many classes I need to attend for Engineering Mathematics to hit 75%.",
      a: "According to your CampusX attendance formula (3t - 4a), with 18 attended out of 28 classes (64%), you need to attend the next 12 consecutive lectures without absence to reach exactly 75%.",
    },
    {
      q: "Where is the GDSC Hackathon taking place and what is the reporting time?",
      a: "TechFest 2026 Hackathon is hosted at the Main Auditorium on 15 May at 9:00 AM IST. Registration is confirmed through your CampusX student profile.",
    },
    {
      q: "Are there any second-hand engineering drafters available in the marketplace?",
      a: "Yes! There is 1 Mini Drafter (Omega brand, excellent condition) listed in Campus Marketplace for ₹250 by Aman Sharma (Civil Dept). Seller contact is accessible in the portal.",
    },
  ];

  const modules = [
    {
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      title: "Smart Attendance Tracker",
      tag: "Criteria Optimizer",
      desc: "Intelligent percentage calculations with the mathematical formula (3t - 4a). Provides real-time advice on safe skips or mandatory consecutive classes.",
      badge: "Active Engine",
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      title: "Dynamic Class Routine",
      tag: "Weekly Timetable",
      desc: "Day-by-day lecture slot matrix with room numbers, subject codes, faculty assignments, and automatic today-slot highlighting.",
      badge: "Real-Time",
    },
    {
      icon: <Bell className="w-6 h-6 text-rose-400" />,
      title: "College Circulars & Notices",
      tag: "Official Broadcasts",
      desc: "Instant administrative announcements, exam schedules, and circulars with category filtering and urgent priority banners.",
      badge: "Verified",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
      title: "NotesHub Repository",
      tag: "Academic Library",
      desc: "Decentralized study repository where students filter notes by engineering branch, semester, and subject code.",
      badge: "Peer Verified",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Events & Fest Manager",
      tag: "Campus Pulse",
      desc: "Centralized festival schedules, technical hackathons, guest seminars, and cultural competitions with one-click RSVP.",
      badge: "Live Calendar",
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: "Clubs & Societies Hub",
      tag: "Student Community",
      desc: "Explore student chapters including GDSC, RoboX, Coding and Cultural clubs with coordinator details and member registries.",
      badge: "Community",
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-indigo-400" />,
      title: "Campus P2P Marketplace",
      tag: "Student Commerce",
      desc: "Peer-to-peer buy and sell platform for textbooks, drafters, scientific calculators, and lab coats within the campus boundary.",
      badge: "Direct Contact",
    },
    {
      icon: <Search className="w-6 h-6 text-yellow-400" />,
      title: "Digital Lost & Found",
      tag: "Community Recovery",
      desc: "Quickly report misplaced campus items or recover lost student IDs, keys, and notebooks with location tags and claim tracking.",
      badge: "Resolved 90%+",
    },
  ];

  return (
    <div className="landing-root">
      {/* Background glow orbs */}
      <div className="landing-glow landing-glow-top" />
      <div className="landing-glow landing-glow-middle" />

      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <span className="brand-logo-glow">
              <Sparkles size={20} className="brand-icon" />
            </span>
            <span className="brand-name">Campus<span className="brand-highlight">X</span></span>
            <span className="brand-badge">2.0</span>
          </div>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#modules">Modules</a>
            <a href="#ai">AI Campus Mind</a>
            <a href="#about">About</a>
            <a href="#creator">Meet the Creator</a>
          </div>

          <div className="landing-nav-actions">
            {user ? (
              <div className="user-nav-box">
                <span className="user-greeting">Hi, {user.name.split(" ")[0]}</span>
                <button
                  type="button"
                  className="btn-landing-primary"
                  onClick={onLaunchDashboard}
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="guest-nav-box">
                <button
                  type="button"
                  className="btn-landing-ghost"
                  onClick={() => onOpenAuth("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn-landing-primary"
                  onClick={() => onOpenAuth("register")}
                >
                  Get Started Free
                </button>
              </div>
            )}

            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#modules" onClick={() => setMobileMenuOpen(false)}>Modules</a>
            <a href="#ai" onClick={() => setMobileMenuOpen(false)}>AI Assistant</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About CampusX</a>
            <a href="#creator" onClick={() => setMobileMenuOpen(false)}>Meet the Creator</a>
            <div className="mobile-menu-actions">
              {user ? (
                <button
                  type="button"
                  className="btn-landing-primary w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDashboard();
                  }}
                >
                  Launch Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-landing-ghost w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("login");
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn-landing-primary w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("register");
                    }}
                  >
                    Register Student Account
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="landing-hero" id="home">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="pill-dot" />
            <span>AI-POWERED DIGITAL CAMPUS ECOSYSTEM</span>
            <span className="pill-tag">MERN + AI</span>
          </div>

          <h1 className="hero-title">
            The Unified Digital Campus for <span className="gradient-text">Next-Gen Students</span>
          </h1>

          <p className="hero-subtitle">
            One comprehensive portal engineered to eliminate campus chaos. Master your 75% attendance criteria, track lecture routines, access verified subject notes, trade essentials, and leverage 24/7 AI academic intelligence.
          </p>

          <div className="hero-actions">
            {user ? (
              <button
                type="button"
                className="btn-hero-cta"
                onClick={onLaunchDashboard}
              >
                <span>Launch Student Workspace</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-hero-cta"
                  onClick={() => onOpenAuth("register")}
                >
                  <span>Launch Student Portal</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => onOpenAuth("login")}
                >
                  <span>Student & Admin Login</span>
                </button>
              </>
            )}
            <a href="#creator" className="btn-hero-creator">
              Meet the Creator 👨‍💻
            </a>
          </div>

          {/* Key Metric Highlights */}
          <div className="hero-metrics">
            <div className="metric-item">
              <span className="metric-val">75%</span>
              <span className="metric-lbl">Attendance Criterion Engine (3t - 4a)</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-val">8+</span>
              <span className="metric-lbl">Integrated Campus Workspaces</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-val">24/7</span>
              <span className="metric-lbl">Context-Aware AI Academic Copilot</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-val">100%</span>
              <span className="metric-lbl">MERN + JWT Role-Based Security</span>
            </div>
          </div>

          {/* Live Interactive Hero Preview Card */}
          <div className="hero-preview-window">
            <div className="preview-topbar">
              <div className="preview-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="preview-title">campusx-student-dashboard.live</span>
              <span className="preview-status">● Live WebSocket / REST</span>
            </div>
            <div className="preview-body">
              <div className="preview-grid">
                <div className="preview-widget">
                  <div className="widget-header">
                    <span className="widget-icon">📊</span>
                    <div>
                      <div className="widget-title">Smart Attendance Health</div>
                      <div className="widget-sub">Current aggregate: 83% (Good Standing)</div>
                    </div>
                  </div>
                  <div className="preview-att-bar">
                    <div className="bar-fill" style={{ width: "83%" }} />
                  </div>
                  <div className="widget-footer-text">
                    <CheckCircle2 size={14} className="text-emerald" /> Safe! You can miss up to 2 classes in Data Structures while remaining above 75%.
                  </div>
                </div>

                <div className="preview-widget">
                  <div className="widget-header">
                    <span className="widget-icon">📅</span>
                    <div>
                      <div className="widget-title">Next Scheduled Lecture</div>
                      <div className="widget-sub">Computer Networks · Room 304</div>
                    </div>
                  </div>
                  <div className="preview-schedule-time">
                    <span className="time-badge">10:15 AM – 11:15 AM</span>
                    <span className="time-sub">Prof. Sharma · Dept of CSE</span>
                  </div>
                  <div className="widget-footer-text">
                    <Calendar size={14} className="text-blue" /> Dynamic Timetable Matrix synced with semester routine.
                  </div>
                </div>

                <div className="preview-widget preview-widget-ai">
                  <div className="widget-header">
                    <span className="widget-icon">🤖</span>
                    <div>
                      <div className="widget-title">AI Academic Copilot</div>
                      <div className="widget-sub">Instant Campus Query Resolution</div>
                    </div>
                  </div>
                  <div className="preview-ai-bubble">
                    "Mid-term examination circular published! High-priority notice active in the updates board."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="landing-section" id="modules">
        <div className="section-head text-center">
          <div className="section-pill">ALL-IN-ONE SUITE</div>
          <h2 className="section-title">Engineered for Every Aspect of Student Life</h2>
          <p className="section-desc">
            CampusX brings together all fragmented campus utilities into one modern, responsive, and synchronized platform.
          </p>
        </div>

        <div className="modules-grid">
          {modules.map((m, idx) => (
            <div className="module-card" key={idx}>
              <div className="module-card-top">
                <div className="module-icon-wrap">{m.icon}</div>
                <span className="module-badge">{m.badge}</span>
              </div>
              <h3 className="module-title">{m.title}</h3>
              <div className="module-tag">{m.tag}</div>
              <p className="module-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Campus Assistant Interactive Spotlight */}
      <section className="landing-section ai-spotlight-section" id="ai">
        <div className="ai-spotlight-wrap">
          <div className="ai-spotlight-left">
            <div className="section-pill">INTELLIGENT CAMPUS MIND</div>
            <h2 className="section-title">
              Your 24/7 AI-Powered <span className="gradient-text">Academic Assistant</span>
            </h2>
            <p className="section-desc">
              Trained on student academic criteria, syllabus structures, timetable coordination, and campus FAQs. Get instant answers to complex queries without waiting in administrative queues.
            </p>

            <div className="ai-features-list">
              <div className="ai-feat-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Automated attendance forecasting & class-skip calculation</span>
              </div>
              <div className="ai-feat-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Instant campus navigation, classroom, and faculty discovery</span>
              </div>
              <div className="ai-feat-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Notice analysis and exam preparation guidelines</span>
              </div>
              <div className="ai-feat-item">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Integrated directly within your student dashboard</span>
              </div>
            </div>

            <div className="prompt-selector-label">Try an interactive query:</div>
            <div className="prompt-selector-buttons">
              {aiPrompts.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className={`prompt-pill-btn ${activeAiPrompt === i ? "active" : ""}`}
                  onClick={() => setActiveAiPrompt(i)}
                >
                  Prompt #{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-spotlight-right">
            <div className="ai-mockup-card">
              <div className="ai-mockup-header">
                <div className="ai-avatar-badge">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="ai-bot-name">CampusX AI Assistant</div>
                  <div className="ai-bot-status">● Ready to assist</div>
                </div>
              </div>

              <div className="ai-mockup-chat">
                <div className="mockup-msg user">
                  <div className="msg-content">{aiPrompts[activeAiPrompt].q}</div>
                </div>
                <div className="mockup-msg bot">
                  <div className="bot-avatar">🤖</div>
                  <div className="msg-content">{aiPrompts[activeAiPrompt].a}</div>
                </div>
              </div>

              <div className="ai-mockup-input">
                <input
                  type="text"
                  placeholder="Ask CampusX Assistant anything..."
                  readOnly
                  value="Click a prompt on the left to test live answers"
                />
                <button type="button" className="ai-mockup-send" aria-label="Send query">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About CampusX Architecture Section */}
      <section className="landing-section" id="about">
        <div className="about-grid">
          <div className="about-card-primary">
            <div className="section-pill">WHY CAMPUSX</div>
            <h2 className="section-title">Built to Modernize Higher Education</h2>
            <p className="about-text">
              Traditional college processes are burdened with friction: circulars buried in WhatsApp group chats, attendance uncertainties leading to exam detentions, misplaced items with no recovery channel, and fragmented student collaboration.
            </p>
            <p className="about-text">
              <strong>CampusX</strong> bridges this divide by providing a unified digital ecosystem. Designed with enterprise-grade security, MongoDB Atlas persistence, role-based authorization, and modern reactive UX, it serves as the ultimate digital companion for both students and university administrators.
            </p>

            <div className="about-specs-grid">
              <div className="spec-box">
                <Layers className="spec-icon text-blue" />
                <div className="spec-title">Modern MERN Stack</div>
                <div className="spec-desc">React 18 + Vite frontend with Node.js + Express REST API backend.</div>
              </div>
              <div className="spec-box">
                <Shield className="spec-icon text-purple" />
                <div className="spec-title">Role-Based Security</div>
                <div className="spec-desc">Protected JWT authentication with strict server-side admin validation.</div>
              </div>
            </div>
          </div>

          <div className="about-card-metrics">
            <h3 className="metrics-card-title">CampusX Technical Architecture</h3>
            <div className="arch-flow">
              <div className="arch-step">
                <div className="arch-num">01</div>
                <div>
                  <strong>Client UI Layer</strong>
                  <p>Vite-powered React SPA with glassmorphic blue-and-white theme and responsive layout.</p>
                </div>
              </div>
              <div className="arch-step">
                <div className="arch-num">02</div>
                <div>
                  <strong>Secure API Gateway</strong>
                  <p>Express REST endpoints with JWT verification, CORS control, and input sanitization.</p>
                </div>
              </div>
              <div className="arch-step">
                <div className="arch-num">03</div>
                <div>
                  <strong>Persistent Cloud Database</strong>
                  <p>MongoDB Atlas with optimized schemas for Attendance, Routine, Notices, Notes, and Events.</p>
                </div>
              </div>
              <div className="arch-step">
                <div className="arch-num">04</div>
                <div>
                  <strong>Role Isolation & Moderation</strong>
                  <p>Students access self-service modules; verified admins manage notices, moderation, and users.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Creator Section */}
      <section className="landing-section creator-section" id="creator">
        <div className="creator-wrap">
          <div className="creator-card">
            <div className="creator-photo-col">
              <div className="creator-frame">
                <img
                  src="/images/creator-photo.jpg"
                  alt="Surya Pratap Singh Bhadoriya"
                  className="creator-img"
                  onError={(e) => {
                    // Fallback to avatar if photo fails to render
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('fallback-avatar');
                  }}
                />
                <div className="creator-badge-overlay">
                  <Code size={16} />
                  <span>Full-Stack Engineer</span>
                </div>
              </div>
              <div className="creator-status-chip">
                <span className="status-ping" />
                <span>Creator & Developer</span>
              </div>
            </div>

            <div className="creator-details-col">
              <div className="section-pill creator-pill">MEET THE CREATOR</div>
              <h2 className="creator-name">Surya Pratap Singh Bhadoriya</h2>
              <div className="creator-role-title">Creator & Lead Developer of CampusX</div>
              
              <div className="creator-education">
                <GraduationCap className="edu-icon" size={20} />
                <div>
                  <strong>B.Tech in Mathematics & Computing</strong>
                  <span>Madhav Institute of Technology & Science (MITS), Gwalior</span>
                </div>
              </div>

              <p className="creator-bio">
                "As an engineering student at MITS Gwalior, I experienced firsthand the frustration of fragmented college tools—missed notices, attendance uncertainties, and disconnected student communities. I architected and developed CampusX to solve this exact problem: engineering a unified, high-performance digital campus ecosystem that empowers students with predictive analytics, real-time collaboration, and intelligent AI assistance."
              </p>

              <div className="creator-skills">
                <span className="skill-chip">MERN Stack</span>
                <span className="skill-chip">Mathematics & Computing</span>
                <span className="skill-chip">React.js</span>
                <span className="skill-chip">Node.js & Express</span>
                <span className="skill-chip">MongoDB Atlas</span>
                <span className="skill-chip">JWT Security & RBAC</span>
                <span className="skill-chip">AI System Design</span>
                <span className="skill-chip">REST APIs</span>
              </div>

              <div className="creator-social-links">
                <a
                  href="https://github.com/codesurya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn github-btn"
                >
                  <svg
                    className="social-svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub (@codesurya)</span>
                  <ExternalLink size={14} className="ext-icon" />
                </a>

                <a
                  href="https://www.linkedin.com/in/surya-pratap-singh-bhadoriya-075679343/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn linkedin-btn"
                >
                  <svg
                    className="social-svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn Profile</span>
                  <ExternalLink size={14} className="ext-icon" />
                </a>

                <a
                  href="https://github.com/codesurya/CampusX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn repo-btn"
                >
                  <Code size={18} />
                  <span>CampusX Repo</span>
                  <ExternalLink size={14} className="ext-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">Ready to Experience the Future of Campus Life?</h2>
          <p className="cta-banner-desc">
            Join students at MITS Gwalior using CampusX to optimize attendance, coordinate routines, and ace academic projects.
          </p>
          <div className="cta-banner-actions">
            {user ? (
              <button
                type="button"
                className="btn-hero-cta"
                onClick={onLaunchDashboard}
              >
                <span>Open Student Dashboard</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-hero-cta"
                onClick={() => onOpenAuth("register")}
              >
                <span>Create Student Account</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="landing-brand">
              <span className="brand-logo-glow">
                <Sparkles size={18} className="brand-icon" />
              </span>
              <span className="brand-name">Campus<span className="brand-highlight">X</span></span>
            </div>
            <p className="footer-text">
              An AI-powered unified digital campus ecosystem for college students and faculty.
            </p>
            <div className="footer-origin">
              Designed & Engineered with ❤️ by <strong>Surya Pratap Singh Bhadoriya</strong> at <strong>MITS Gwalior</strong>.
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <div className="footer-col-title">Modules</div>
              <a href="#modules">Attendance Tracker</a>
              <a href="#modules">Class Routine</a>
              <a href="#modules">College Notices</a>
              <a href="#modules">NotesHub</a>
              <a href="#modules">Campus Marketplace</a>
            </div>

            <div className="footer-col">
              <div className="footer-col-title">System</div>
              <a href="#ai">AI Assistant</a>
              <a href="#about">MERN Architecture</a>
              <a href="#creator">Creator Profile</a>
              <a href="https://github.com/codesurya/CampusX" target="_blank" rel="noopener noreferrer">
                Source Code
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} CampusX Ecosystem. All rights reserved.</div>
          <div className="footer-badge">
            <span className="status-ping" />
            <span>All Systems Operational · MITS Gwalior</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
