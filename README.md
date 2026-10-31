# 🎓 CampusX – AI-Powered Digital Campus Ecosystem for Students

CampusX is an all-in-one digital campus ecosystem engineered with the MERN stack (MongoDB, Express, React, Node.js) and enhanced with an intelligent campus knowledge engine. It centralizes everyday academic life, timetable scheduling, attendance criteria tracking, peer-to-peer resource sharing, lost-and-found recovery, and student society engagement into a single, high-performance student portal.

---

## 🌟 Key Modules & Features

### 1. 🔐 Authentication & Role Management
- Secure user registration and login with JWT (JSON Web Tokens) and bcrypt password hashing.
- Role-based authorization (`student` and `admin`).
- Safe demo role switcher directly in user profile for instant testing of admin moderation controls.
- User-specific private data isolation.

### 2. 📊 Attendance Tracker (75% Minimum Criteria Engine)
- Subject-wise attendance calculation with visual status bars and color-coded risk alerts.
- Dynamic mathematical advice:
  - Attendance shortfall formula: $3 \times \text{total} - 4 \times \text{attended}$ (classes needed to reach 75%).
  - Safe skip calculation: $\lfloor \frac{4 \times \text{attended}}{3} - \text{total} \rfloor$ classes allowed to miss while staying above 75%.
- Mark present/absent with optimistic UI updates and instant database persistence.
- Add, edit, and delete subject trackers.

### 3. 📅 Class Routine & Timetable
- Day-wise weekly timetable viewer (Monday through Sunday) with automatic detection of current day.
- Detailed slot information: subject, start/end time, faculty name, and lecture hall/room number.
- Add, edit, and delete class slots with strict time-validation ($T_{\text{start}} < T_{\text{end}}$).

### 4. 📢 College Notices & Updates
- Official department and university circulars categorized into: Exam, Holiday, Academic, General, and Event.
- Priority badges with highlighted Urgent alerts.
- Real-time search across notice headlines, descriptions, and authors.
- Category filtering and notice creation/deletion.

### 5. 📚 NotesHub (Academic Resource Sharing)
- Subject-wise syllabus notes, question banks, and handwritten lecture scans.
- Categorized by Subject (DSA, OS, DBMS, Networks, Cloud) and Semester.
- Download tracking and student upload contribution workflow.

### 6. 🎉 Campus Events & Fests
- Interactive campus calendar featuring hackathons, cultural fests, sports tournaments, and workshops.
- RSVP / Event registration with live headcount tracking.
- Event creation and organizer details.

### 7. 🚀 Clubs & Communities
- Directory of active student societies (GDSC, RoboX, Dhwani, E-Cell, Rotaract).
- One-click "Join Club" / "Leave Club" membership toggles.
- Meeting schedules, lead coordinator details, and member lists.

### 8. 🛒 Campus Marketplace (Peer-to-Peer)
- Student-to-student marketplace for textbooks, scientific calculators, bicycles, mini-drafters, and hostel gear.
- In-app safe contact viewer (Hostel room / WhatsApp) without third-party fees.
- Seller listing management with "Available" / "Sold" status toggles.

### 9. 🔍 Lost & Found Desk
- Report lost or found campus items (ID cards, wireless mice, keys, water bottles).
- Filter by Lost vs. Found and item category.
- Direct contact details and "Mark Returned / Resolved" workflow.

### 10. 🤖 AI Campus Assistant
- Interactive campus AI chatbot built into the dashboard.
- Dynamic contextual queries:
  - *"How is my attendance?"* (queries student database and calculates live percentages).
  - *"What classes do I have today?"* (looks up today's timetable slots).
  - *"What is the 75% attendance rule?"*, *"Where can I find study notes?"*, and library/hostel rules.
- Fully transparent engine indicator showing the offline campus rule & knowledge engine.

### 11. 👤 Student Profile & Settings
- Overview of academic roll number, branch, semester, and registered email.
- Real-time profile updates.
- Interactive student/administrator privilege toggle.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, JavaScript (ESNext), CSS3 Variables |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Styling** | Modern responsive blue-and-white theme (`--blue: #2563eb`, `--navy: #1e3a8a`) |

---

## 📂 Project Structure

```
campusX/
├── client/                      # React + Vite Frontend
│   ├── dist/                    # Production build output
│   ├── src/
│   │   ├── api.js               # Centralized fetch wrapper & token storage
│   │   ├── App.jsx              # Main React application & all feature components
│   │   ├── main.jsx             # React entry point
│   │   └── styles.css           # Complete responsive stylesheet
│   ├── index.html
│   ├── jsconfig.json            # JSX & Language Server config
│   ├── package.json
│   └── vite.config.js           # Dev server config (port 4028)
│
├── server/                      # Express Backend
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/
│   │   ├── Attendance.js        # Attendance record schema
│   │   ├── Club.js              # Campus clubs schema
│   │   ├── Event.js             # Fests and events schema
│   │   ├── LostFound.js         # Lost & found notices schema
│   │   ├── MarketplaceItem.js   # Marketplace listings schema
│   │   ├── Note.js              # NotesHub study material schema
│   │   ├── Notice.js            # College notices schema
│   │   ├── Routine.js           # Weekly timetable schema
│   │   └── User.js              # Student & admin profile schema
│   ├── routes/
│   │   ├── ai.js                # AI campus assistant endpoint
│   │   ├── attendance.js        # Attendance CRUD endpoints
│   │   ├── auth.js              # Register, login, /me, and profile update
│   │   ├── clubs.js             # Clubs list, join, leave endpoints
│   │   ├── events.js            # Events list, RSVP, create endpoints
│   │   ├── lostfound.js         # Lost & found reporting endpoints
│   │   ├── marketplace.js       # Marketplace listings endpoints
│   │   ├── notes.js             # NotesHub download & upload endpoints
│   │   ├── notices.js           # College notices & seed endpoints
│   │   └── routine.js           # Weekly timetable endpoints
│   ├── .env.example             # Template for environment variables
│   ├── package.json
│   └── server.js                # Express app & MongoDB connection
│
├── .gitignore                   # Ignore node_modules, .env, and dist
└── README.md                    # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (Node Package Manager)
- MongoDB Atlas cluster account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campusX
```

### 2. Backend Configuration
Create a `server/.env` file based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusx?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:4028
```

> **Security Note:** Never commit your actual `MONGO_URI` or `JWT_SECRET` to version control. In MongoDB Atlas Network Access, ensure your IP address is whitelisted (or set to `0.0.0.0/0` during development).

### 3. Install Dependencies

```bash
# Install backend packages
cd server
npm.cmd install

# Install frontend packages
cd ../client
npm.cmd install
```

---

## 🚀 Running the Project

### Start Backend Server
```bash
cd server
npm.cmd start
```
*Backend runs at `http://localhost:5000` (outputs `MongoDB connected` upon startup).*

### Start Frontend Dev Server
```bash
cd client
npm.cmd run dev
```
*Frontend runs at `http://localhost:4028`.*

### One-Command Startup (Windows PowerShell)
```powershell
Start-Process powershell -ArgumentList "-NoExit -Command cd 'c:\Users\Surya Bhadoriya\OneDrive\Documents\campusX\server'; npm.cmd start" ; Start-Process powershell -ArgumentList "-NoExit -Command cd 'c:\Users\Surya Bhadoriya\OneDrive\Documents\campusX\client'; npm.cmd run dev"
```

---

## 🧪 Production Build Verification
To ensure all JSX, styles, and assets build cleanly without runtime errors:
```bash
cd client
npm.cmd run build
```
*Builds in < 1 second with 0 syntax or compiler errors.*

---

## 🔮 Future Scope
- Real-time instant messaging using Socket.io for personal student study groups.
- Direct cloud storage integration (AWS S3 / Google Cloud Storage) for larger PDF note uploads.
- Automated push notifications for emergency class cancellations and rescheduled exams.
- Mobile application client using React Native sharing the existing Express REST APIs.

