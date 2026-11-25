# 🎓 CampusX — Academic Capstone Project Poster Specification (A3 Format)

This document contains the complete content, layout specification, and printing instructions for the **CampusX A3 Exhibition Poster**.

---

## 🖨️ How to Print / Export to A3 PDF

1. **Locate the HTML Poster:**
   The poster is located at: [`docs/POSTER_A3.html`](file:///c:/Users/Surya%20Bhadoriya/OneDrive/Documents/campusX/docs/POSTER_A3.html)
2. **Open in any modern browser:**
   Double-click `docs/POSTER_A3.html` or open it with Google Chrome / Microsoft Edge.
3. **Print or Save as PDF:**
   - Press **`Ctrl + P`** (or click the blue **"🖨️ Print / Save as A3 PDF"** button at the top).
   - In the print dialog:
     - **Destination:** *Save as PDF* (or select your A3 Plotter / Color Printer).
     - **Paper Size:** Select **`A3`** (Dimensions: $297\text{ mm} \times 420\text{ mm}$).
     - **Layout:** *Portrait*.
     - **Margins:** *None* or *Default*.
     - **Options:** Enable **"Background graphics"** (ensures gradients, color badges, and formula boxes render with full visual fidelity).
4. **Done!** You get a crystal-clear, high-resolution vector PDF ready for professional printing on photo paper, matte paper, or foam board mounting.

---

## 📋 Poster Structural Breakdown

### 1. Header Banner
- **Project Title:** CampusX: AI-Powered Digital Campus Ecosystem
- **Subtitle:** An Integrated MERN Architecture for Real-Time Academic Scheduling, 75% Attendance Forecasting & Student Resource Sharing
- **Author:** Surya Bhadoriya (B.Tech Computer Science & Engineering, 2026–2027)
- **Technology Stack Badges:** React 18, Vite 5, Node.js, Express.js, MongoDB Atlas, JWT Auth, REST API

---

### 2. Section Details (3-Column Layout)

#### Column 1: Foundations & Architecture
1. **Problem Statement & Objectives:**
   - Eradicates campus fragmentation across isolated notice boards and informal chats.
   - Real-time visibility into the mandatory 75% attendance rule.
   - Trusted campus marketplace and notes repository.
2. **75% Attendance Mathematical Model:**
   - Deficit condition ($P < 75\%$): $\text{Classes Needed} = \max(0, \lceil 3t - 4a \rceil)$
   - Surplus condition ($P \ge 75\%$): $\text{Safe Skips Allowed} = \max(0, \lfloor 4a/3 - t \rfloor)$
   - Real-time color alerts: Green ($\ge 85\%$), Blue ($75\text{--}84\%$), Amber ($< 75\%$).
3. **Three-Tier Architecture:**
   - Presentation Layer: React 18 + Vite 5 SPA.
   - Security & Route Gate: JWT Authentication & Role Authorization Middleware.
   - Business Logic Tier: 10 RESTful Express Controllers.
   - Data Persistence Tier: MongoDB Atlas Cloud Cluster.

#### Column 2: Core Academic & Community Ecosystem
4. **Academic Timetable & Circulars:**
   - Weekly Class Routine with current-day auto-detection ($(\text{day} + 6) \bmod 7$) and time bounds ($T_{\text{start}} < T_{\text{end}}$).
   - College Notices Board with category filtering (Exam, Holiday, Academic, General, Fest) and urgent alert flags.
5. **Peer-to-Peer Academic Utilities:**
   - NotesHub: Subject-wise syllabus notes (DSA, OS, DBMS, Networks, Cloud) with download counters.
   - Campus Marketplace: Zero-commission textbook, drafter, calculator, and bicycle exchange.
   - Lost & Found Desk: Searchable reporting board with location tags and resolution tracking.
6. **Student Life & Societies:**
   - Student Clubs Hub (GDSC, RoboX, Dhwani, E-Cell, Rotaract) with 1-click Join/Leave toggles.
   - Campus Events & Fests with live RSVP attendee headcount tracking.

#### Column 3: Intelligence, Governance & Quality Benchmarks
7. **AI Campus Assistant Engine:**
   - Context-aware chatbot with dynamic MongoDB database query hooks.
   - Answers student attendance standing, today's lecture schedule, and campus FAQs offline.
8. **Governance & Security (RBAC):**
   - Separate Admin Control Panel for faculty/administrators.
   - Public registration strictly locked to `student` role.
   - Direct database authorization with self-demotion and self-deletion safeguards.
9. **Verification & Quality Benchmarks:**
   - **61 / 61** Automated test assertions passed with 100% success.
   - **738 ms** Vite production build time with zero lint or syntax errors.
   - **100%** Student-tenant data isolation verified.

---

### 3. Footer Banner
- **Open Source Repository:** [https://github.com/codesurya/CampusX](https://github.com/codesurya/CampusX)
- **Local Exhibition Ports:** Client `http://localhost:4028` | Backend `http://localhost:5000`
- **Format:** A3 Exhibition Standard (Portrait, 300 DPI compatible)

