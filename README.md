# Scout — College Placement & Job Applications Platform

A full-stack campus recruitment portal and external job discovery platform built following the Scout Blueprint v2.

---

## ⚡ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, DM Sans font, Lucide React, TanStack Query, React Hook Form, Zod, React Dropzone, Axios
- **Backend**: Express.js (Node 22), Prisma ORM, JWT (httpOnly cookies), Bcrypt (12 rounds), Multer (PDF validation)
- **Database**: PostgreSQL 16 (Neon Cloud Serverless)
- **External Discovery**: JSearch RapidAPI proxy with resilient fallback

---

## 🚀 Quickstart

### 1. Database & Environment Configuration
Verify your `server/.env` contains your Neon PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@your-database-host:5432/scout_db?sslmode=require"
PORT=5001
CLIENT_URL="http://localhost:5173"
JWT_SECRET="your-secure-jwt-secret-key"
ADMIN_EMAIL="admin@scout.app"
ADMIN_PASSWORD="adminpassword123"
RAPIDAPI_KEY=""
```

### 2. Start the Backend API
```bash
cd server
npm run dev
# Operational on http://localhost:5001
```

### 3. Start the Frontend Client
```bash
cd client
npm run dev
# Operational on http://localhost:5173
```

---

## 🏛️ Platform Architecture & Features

### 1. Public Placement Dashboard (`/`)
- Public browsing with zero login barrier.
- Real-time search across role title, company, and location.
- Employment type filters: `All Roles`, `Full Time`, `6M + FTE`, `Intern`, `PPO`.
- **2-card per row grid** with compensation cards (stipend & CTC) and academic cutoff checklist (Batch, CGPA, 10th/12th %).
- Detailed modal with job overview and eligibility requirements.
- **Inline AuthGate Prompt**: Clicking "Apply" while logged out prompts the student inline without page redirects.
- **"My Applications" Ledger**: Automatically displays below available jobs when a student logs in, with live status pills (`Applied ✓`, `Shortlisted ✓`, `Application Closed`).

### 2. Student Authentication (`/signup`, `/login`, `/forgot-password`, `/reset-password`)
- Student registration with Roll Number and email validation.
- Encrypted password hashing with Bcrypt (12 rounds).
- Session security using signed JWT stored in **httpOnly cookies** (`scout_token`), preventing XSS token theft.
- **Stateless Password Recovery Flow**: Dual-purpose signed reset tokens keyed dynamically to the user's password hash, auto-invalidating immediately upon reset with zero database bloat.

### 3. Dedicated Jobs Directory (`/jobs`)
- Dedicated campus recruitment catalog with search, filters, and direct `ApplyModal` integration.

### 4. External Job Discovery (`/find-jobs`)
- Search live tech jobs across the web powered by JSearch API.
- Filter by employment type (`Full-time`, `Internship`, `Contract`), remote status, and date posted.
- Proxied through the Express backend to keep API keys secure.
- Response caching powered by TanStack Query (5-minute stale time).
- Direct external employer application links opening in new tabs.

### 5. Student Profile & Resume Engine (`/info-resume`)
- **Personal Details**: First Name, Last Name, College Roll No, Gender, ABC ID, Mobile, Date of Birth, and Graduation Year.
- **Undergraduate Academic Records**: University Name, Graduation Year, Course, Branch, Aggregate CGPA, 10th %, and 12th %.
- **Two-Slot PDF Resume Engine**: Drag-and-drop file uploader using `react-dropzone` with server-side PDF MIME verification and a 20 MB size limit.
- **Secure File Streaming**: Resumes are served through authenticated streaming endpoints (`/api/resumes/:id/download`) with IDOR checks.
- **Security & Password Management**: Self-service password updates with current password verification.

### 6. Employer & Placement Administration (`/admin/*`)
- **Instant Admin Access**: Fixed single-account employer model via the Navbar's "For employers ▾" dropdown (`admin@scout.app` / `adminpassword123`).
- **Post a Job Form** (`/admin/post-job`): Clean job creation form capturing all campus recruitment criteria. Published jobs appear on the live dashboard immediately.
- **Postings Management** (`/admin/postings`): Monitor applicant counts, toggle openings between `Open` and `Closed`, or remove postings.
- **Applicant Review Modal**: Inspect applicant profiles (CGPA, 10th/12th marks, contact information, attached PDF resume) and update application status directly to `Shortlisted ✓` or `Rejected`.

---

## 🔒 Security Measures

- **No Public Upload Storage**: Resume PDFs are kept off public directories and streamed only to authorized students and admins.
- **UUID Primary Keys**: Non-sequential identifiers prevent enumeration attacks.
- **IDOR Protection**: Database verification enforces resource ownership before any read, update, or delete action.
- **Rate Limiting**: `express-rate-limit` protects authentication routes against brute-force attempts.
- **Strict Input Validation**: Zod schemas validate and sanitize all incoming request bodies.
- **Error Boundary**: React ErrorBoundary guards against unexpected UI exceptions.
