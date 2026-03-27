# 🎓 AlumniConnect — Digital Alumni Platform

A full-stack web application connecting students and alumni for mentorship, networking, job referrals, events, and community building.

---

## 📁 Project Structure

```
Digital_platform_alumini/
├── backend/                  # Node.js + Express API server
│   ├── config/               # Database config
│   ├── controllers/          # Route handler logic
│   ├── middleware/           # Auth middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   ├── utils/                # Email service
│   ├── .env                  # Environment variables (edit before running)
│   ├── server.js             # Entry point
│   └── package.json
└── frontend/                 # React + Vite app
    ├── src/
    │   ├── components/       # UI components (by feature)
    │   ├── context/          # AuthContext, SocketContext
    │   ├── pages/            # Page-level components
    │   ├── services/         # Axios API service (api.jsx)
    │   └── utils/            # Helpers (PrivateRoute, api.js)
    ├── .env                  # VITE_API_URL (edit before running)
    ├── index.html
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB Atlas** account (or local MongoDB)
- A modern browser

---

## 🚀 Setup & Installation

### 1. Clone / Extract the Project

```bash
unzip Digital_platform_alumini.zip
cd Digital_platform_alumini
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment Variables** — edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_key_min_32_chars
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Email notifications (leave blank to skip)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
```

> **MongoDB URI**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), then copy your connection string.
>
> **Email Setup** (optional): In your Google account → Security → 2-Step Verification → App Passwords → Generate a 16-character password.

**Start the backend:**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Configure Environment Variables** — verify `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

**Start the frontend:**

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 4. Create an Admin Account

With the backend running:

```bash
cd backend
npm run create-admin
```

This creates a default admin user. Check `createAdmin.js` for the default credentials (and change them after first login).

---

## 🔑 User Roles & Features

| Feature | Student | Alumni | Admin |
|---------|:-------:|:------:|:-----:|
| Register & Login | ✅ | ✅ | ✅ |
| Browse Alumni Directory | ✅ | ✅ | ✅ |
| AI Mentor Matching | ✅ | — | — |
| Request Mentorship Sessions | ✅ | — | — |
| Accept/Reject Meetings | — | ✅ | — |
| Post Jobs | — | ✅ | ✅ |
| Apply to Jobs | ✅ | — | — |
| Create Feed Posts | — | ✅ | ✅ |
| Community Forums | ✅ | ✅ | ✅ |
| Events (View & Join) | ✅ | ✅ | ✅ |
| Events (Create) | — | — | ✅ |
| Alumni Verification | Submit | Submit | Review |
| User Management | — | — | ✅ |
| Messaging | ✅ | ✅ | ✅ |
| Insights & Analytics | ✅ | ✅ | ✅ |
| Rewards | — | ✅ | — |

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get current profile |
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Create job (alumni/admin) |
| GET | `/api/applications/my` | My applications |
| POST | `/api/applications` | Apply to job |
| GET | `/api/profiles/alumni` | Browse alumni |
| GET | `/api/ai-matching/suggestions` | AI mentor suggestions |
| POST | `/api/meetings/request` | Request mentorship session |
| GET | `/api/meetings/my` | My meetings |
| GET | `/api/communities` | List communities |
| GET | `/api/events` | List events |
| GET | `/api/messages/conversations` | My conversations |
| GET | `/api/insights/department/:dept` | Department career insights |
| GET | `/api/verification/my-status` | My verification status |
| GET | `/api/health` | Server health check |

---

## 🛠 Troubleshooting

**Backend won't start:**
- Check MongoDB URI is correct in `.env`
- Run `npm install` in `/backend`

**Frontend shows blank page:**
- Check `frontend/.env` has `VITE_API_URL=http://localhost:5000`
- Run `npm install` in `/frontend`
- Check browser console for errors

**401 Unauthorized errors:**
- Make sure you're logged in
- Try logging out and back in (clears stale token)

**Email notifications not sending:**
- Leave `EMAIL_USER` and `EMAIL_PASS` blank to skip (meetings still work, emails are silently skipped)
- For Gmail: you must use an **App Password**, not your account password

**CORS errors:**
- Ensure `FRONTEND_URL=http://localhost:5173` is set in `backend/.env`
- Both servers must be running simultaneously

---

## 🔧 Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, Nodemailer  
**Frontend:** React 18, Vite, Tailwind CSS, Axios, React Router v6, Socket.IO Client, Recharts, React Toastify

---

## 📝 Development Notes

- All frontend API calls go through `src/services/api.jsx` — a centralized Axios instance with auth interceptors
- Socket.IO is used for real-time messaging and notifications
- JWT tokens expire after 7 days — users are auto-logged out
- Profile strength is auto-calculated when profile fields are updated
