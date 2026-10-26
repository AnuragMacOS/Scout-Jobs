# Scout

> A job applications platform built with the PERN stack (PostgreSQL, Express, React, Node.js), featuring live web-wide job search, applicant tracking, and recruitment management.

[![Frontend](https://img.shields.io/badge/Frontend-React%2018-00599C?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2022-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-44CC11?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-PERN-orange?style=flat-square)](#)

---

## 🎥 Live Demo

> **Local Preview**: Run `npm run dev` to start both the Express API and Vite React client simultaneously.  
> **Deployment**: Ready for deployment to platforms like Vercel (Client) and Render / Railway (Backend).

<!-- Tip: Drag & drop your demo MP4 or GIF directly into the GitHub README editor to embed video playback here -->

---

## 📌 Overview

Scout is a full-stack job application platform designed to unite direct hiring workflows, applicant tracking, and live job aggregation across the web into a single responsive web application.

The platform provides two integrated environments and an external discovery engine:
- **Applicant & Candidate Portal**: A clean dashboard with real-time job filtering, application tracking, profile management, and an authenticated PDF resume vault.
- **Employer Management Console**: A dedicated recruitment workspace to publish job openings, define applicant criteria, inspect candidate profiles, and evaluate applicants.
- **Live Web-Wide Job Discovery Engine**: Real-time job search across the web powered by a backend proxy to the JSearch RapidAPI service with built-in offline fallback.

---

## ⚡ How It Works (System Architecture & Pipeline)

A high-level view of how job applications, employer postings, and live external discovery move through the system:

```
[ Candidate / Recruiter ]
           │
           ▼
[ React 18 Client (Vite + Tailwind) ]
           │
           ▼  (REST API / httpOnly Cookies)
[ Express API Gateway (Node 22) ]
           │
     ┌─────┴───────────────────────────┬───────────────────────────┐
     ▼                                 ▼                           ▼
[ Auth & Security ]           [ Secure File Vault ]      [ Live External Search ]
 • JWT Token Verification      • Multer PDF Validation    • JSearch RapidAPI
 • Role-Based Guard (Admin)    • Disk Storage (outside    • In-memory Fallback
 • Bcrypt Password Hashing       public web root)         • Keyword & Geo Filters
 • IDOR Ownership Checks       • Authenticated Stream
     │
     ▼
[ Prisma ORM Client ]
     │
     ▼
[ PostgreSQL Database (Neon Serverless) ]
 • Users, Profiles & Resumes
 • Job Postings & Applications
 • Application Status Records
```

### 1. Candidate Application Pipeline
- **Profile & Qualifications Setup**: Collects educational background, contact details, graduation records, and academic metrics.
- **Resume Vault**: Drag-and-drop PDF upload with MIME validation, a 20 MB size ceiling, and private disk storage outside public web directories.
- **Direct Job Applications**: One-click application submission with linked profile snapshots and attached resume.
- **Real-Time Status Tracking**: Applications link directly to the candidate profile, updating status states (`Applied`, `Shortlisted`, `Closed`) in a live dashboard ledger.

### 2. Recruiter & Hiring Workflow
- **Job Creation**: Recruiters publish openings with role metadata, compensation ranges (stipend / full-time salary), deadlines, and eligibility criteria.
- **Applicant Screening**: Recruiter inspects candidate qualification records, contact info, and streams their attached PDF resume directly through an IDOR-protected endpoint.
- **Decision Management**: Recruiters toggle candidate statuses between `Shortlisted` and `Closed`, immediately updating the candidate view.

### 3. Live Web Job Aggregation
- **Global Tech Job Search**: Real-time querying across external job boards powered by the JSearch API.
- **Search Filters**: Filter live web listings by title, location, remote work preference, and employment type (Full-time, Internship, Contract).
- **Secure Backend Proxy**: API keys stay protected on the server side, with client-side query caching via TanStack Query.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database instance (local or Neon Cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/AnuragMacOS/Scout.git
cd Scout
```

### 2. Environment Configuration
Configure environment variables for both backend and frontend.

Backend (`server/.env`):
```env
PORT=5001
CLIENT_URL="http://localhost:5173"
DATABASE_URL="postgresql://username:password@your-database-host:5432/scout_db?sslmode=require"
JWT_SECRET="your-secure-jwt-secret-key"
ADMIN_EMAIL="admin@scout.app"
ADMIN_PASSWORD="adminpassword123"
RAPIDAPI_KEY=""
```

Frontend (`client/.env`):
```env
VITE_API_URL="http://localhost:5001/api"
```

### 3. Database Migration & Prisma Setup
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 4. Install Client Dependencies
```bash
cd client
npm install
cd ..
```

### 5. Launch Development Environment
Run both backend (port 5001) and frontend (port 5173) simultaneously from the project root:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📊 Platform Capabilities & Technical Specifications

| Module | Component | Implementation | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Authentication** | User & Employer Auth | JWT in httpOnly Cookies + Bcrypt | Secure cookie sessions, 12 salt rounds, stateless password reset |
| **Resume Engine** | Secure Resume Vault | Multer + Private Disk Storage | PDF MIME verification, 20 MB ceiling, IDOR-protected streaming |
| **Job Directory** | Platform Job Postings | Express + Prisma ORM + Postgres | Role requirements, compensation packages, live search & role filters |
| **Application Tracker** | Candidate Ledger | TanStack Query + React 18 | Live status badges (`Applied`, `Shortlisted`, `Closed`), duplicate prevention |
| **Employer Console** | Recruiter Workspace | Role-Based Access Control | Candidate qualification reviews, one-click PDF review, status updates |
| **Live External Search** | JSearch Discovery Engine | Axios + RapidAPI Proxy | Live web-wide tech jobs, query caching, resilient offline fallback |
| **UI & Theming** | Design System | Tailwind CSS + Lucide React | Light and dark mode persistence, accessible modal dialogues |

---

## 🔒 Security & Data Integrity

- **Session Isolation**: Signed JWT tokens stored in strict httpOnly cookies (`scout_token`), neutralizing XSS token theft.
- **IDOR Protection**: Database queries verify ownership before any resume download or application mutation executes.
- **Protected File Storage**: Resumes reside outside public web directories and can only be accessed via authenticated streaming routes (`/api/resumes/:id/download`).
- **Password Security**: Password hashes use 12 Bcrypt salt rounds. Reset tokens are dynamically salted against the user password hash, invalidating immediately upon update without storing temporary tokens in the database.
- **Input Validation**: Strict Zod schemas sanitize incoming request payloads across every API route.
- **Rate Limiting**: Authentication endpoints use `express-rate-limit` to protect against brute-force attacks.

---

## 🌐 Web Interface

The web client runs on React 18, Vite, and Tailwind CSS:
- **Zero-Barrier Browsing**: Public dashboard lets candidates explore all active job openings without requiring an immediate login.
- **Inline Application Modal**: Clicking "Apply" while logged out prompts the candidate inline, preserving search context without route redirects.
- **Resume Management**: Upload, preview, and update candidate resumes with instant drag-and-drop feedback.
- **Dark & Light Theme**: Supports responsive dark and light modes with localStorage persistence.
- **Live Job Discovery**: Filter live external tech jobs across the web by role, location, remote work, and employment type.

---

## 📂 Project Structure

```
Scout/
├── client/                     # Frontend client application
│   ├── src/
│   │   ├── api/                # Axios API service clients (auth, jobs, resumes)
│   │   ├── assets/             # Images, static logos, and illustrations
│   │   ├── components/         # Reusable UI components
│   │   │   ├── forms/          # Authentication & application modals
│   │   │   ├── job/            # Job cards, eligibility badges, detail modals
│   │   │   ├── layout/         # Navigation bar, footer, theme switcher
│   │   │   └── ui/             # Core UI primitives (buttons, inputs, cards)
│   │   ├── context/            # React Context providers (Auth, Theme)
│   │   ├── hooks/              # Custom React hooks (useAuth, useTheme, useToast)
│   │   ├── pages/              # Routed views (Dashboard, Jobs, Profile, Admin)
│   │   ├── App.jsx             # Router layout & route definitions
│   │   └── main.jsx            # React root mount point
│   ├── index.html              # HTML entry point with DM Sans font
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite build and development configuration
├── server/                     # Backend API server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (PostgreSQL)
│   │   └── migrations/         # Prisma migration history
│   ├── src/
│   │   ├── config/             # Database connection & environment configuration
│   │   ├── controllers/        # Route controllers (auth, jobs, applications)
│   │   ├── middleware/         # Auth verification, role guards, file upload
│   │   ├── routes/             # Express API route declarations
│   │   ├── utils/              # Token generators and validation schemas
│   │   └── index.js            # Express server initialization
│   ├── uploads/                # Private file storage for candidate resumes
│   └── package.json            # Server dependencies and scripts
├── dev.js                      # Multi-service development process runner
├── LICENSE                     # MIT License
├── package.json                # Root workspace configuration
└── README.md                   # Project documentation
```
