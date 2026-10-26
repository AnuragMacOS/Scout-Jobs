# Scout

> A college placement and job applications platform built with React, Node.js, and PostgreSQL, featuring verified applicant tracking, dual-slot resume management, and live job aggregation.

[![Frontend](https://img.shields.io/badge/Frontend-React%2018-00599C?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2022-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-44CC11?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Campus%20Recruitment-orange?style=flat-square)](#)

---

## 🎥 Live Demo

> **Local Preview**: Run `npm run dev` to start both the Express API and Vite React client.  
> **Deployment**: Ready for deployment to platforms like Vercel (Client) and Render / Railway (Backend).

<!-- Tip: Drag & drop your demo MP4 or GIF directly into the GitHub README editor to embed video playback here, exactly like Huffman.File.Compressor.mp4 -->

---

## 📌 Overview

Scout is a full-stack campus recruitment portal designed to manage university placement drives, student eligibility filtering, and external tech job discovery.

The platform provides two integrated environments and an external discovery engine:
- **Student Placement Portal**: A dashboard with real-time academic eligibility checking, application tracking, and an authenticated dual-slot PDF resume vault.
- **Employer Management Console**: A dedicated recruitment workspace to publish campus drives, set academic cutoffs, inspect candidate profiles, and evaluate applicants.
- **External Job Discovery Engine**: A web-wide tech job aggregator powered by a backend proxy to the JSearch RapidAPI service with built-in offline fallback.

---

## ⚡ How It Works (System Architecture & Pipeline)

A high-level view of how student applications, employer postings, and secure resume streaming move through the system:

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
[ Auth & Security ]           [ Secure File Vault ]      [ External Discovery ]
 • JWT Token Verification      • Multer PDF Validation    • JSearch RapidAPI
 • Role-Based Guard (Admin)    • Disk Storage (outside    • In-memory Fallback
 • Bcrypt Password Hashing       public web root)
 • IDOR Ownership Checks       • Authenticated Stream
     │
     ▼
[ Prisma ORM Client ]
     │
     ▼
[ PostgreSQL Database (Neon Serverless) ]
 • Users, Profiles & Resumes
 • Campus Jobs & Applications
 • Application Status Records
```

### 1. Student Application Pipeline
- **Academic Profile Setup**: Collects college roll number, degree, branch, graduation year, aggregate CGPA, and 10th/12th percentages.
- **Dual-Slot Resume Vault**: Drag-and-drop PDF upload with MIME validation, a 20 MB size ceiling, and private disk storage outside public web directories.
- **Campus Drive Eligibility**: Compares student academic marks against job criteria (batch cutoff, minimum CGPA) before allowing submission.
- **Real-Time Status Tracking**: Applications link directly to the student profile, updating status states (`Applied`, `Shortlisted`, `Closed`) in a live dashboard ledger.

### 2. Employer Drive & Recruitment Workflow
- **Drive Creation**: Recruiters publish campus drives with role metadata, compensation figures (stipend and full-time CTC), deadlines, and eligibility criteria.
- **Applicant Screening**: Recruiter inspects candidate academic records, contact info, and streams their attached PDF resume directly through an IDOR-protected endpoint.
- **Decision Management**: Recruiters toggle candidate statuses between `Shortlisted` and `Closed`, immediately updating the candidate view.

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
| **Authentication** | Student & Employer Auth | JWT in httpOnly Cookies + Bcrypt | Secure cookie sessions, 12 salt rounds, stateless password reset |
| **Resume Engine** | Dual-Slot Resume Vault | Multer + Private Disk Storage | PDF MIME verification, 20 MB ceiling, IDOR-protected streaming |
| **Campus Jobs** | Placement Drive Directory | Express + Prisma ORM + Postgres | Academic cutoffs, stipend/CTC packages, live search & role filters |
| **Application Tracker** | Student Ledger | TanStack Query + React 18 | Live status badges (`Applied`, `Shortlisted`, `Closed`), duplicate prevention |
| **Employer Console** | Recruiter Workspace | Role-Based Access Control | Candidate academic reviews, one-click PDF review, status updates |
| **External Search** | JSearch Discovery Engine | Axios + RapidAPI Proxy | Live web-wide tech jobs, query caching, resilient offline fallback |
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
- **Zero-Barrier Browsing**: Public dashboard lets students explore all active campus drives without requiring an immediate login.
- **Inline Application Modal**: Clicking "Apply" while logged out prompts the candidate inline, preserving search context without route redirects.
- **Dual-Slot Resume Management**: Upload, switch between, and preview primary and secondary resumes with instant drag-and-drop feedback.
- **Dark & Light Theme**: Supports responsive dark and light modes with localStorage persistence.
- **Live Job Discovery**: Filter global tech jobs by role, location, remote work, and employment type.

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
