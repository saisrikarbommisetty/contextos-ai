<div align="center">

# ⚡ ContextOS
### The AI Context Layer for Human Work & Team Continuity

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests Passing](https://img.shields.io/badge/Tests-35%2F35%20Passing-brightgreen?style=for-the-badge)](https://jestjs.io/)

<p align="center">
  <strong>Never lose your engineering flow again.</strong><br>
  ContextOS reconstructs where you left off, what changed, why decisions were made, and what to do next in under 2 seconds.
</p>

[Explore Demo](#-hackathon-evaluator--judge-quick-access) • [Key Features](#-core-features) • [Architecture](#-system-architecture) • [Local Setup](#-local-development-setup) • [Deployment](#-cloud-deployment-vercel--render)

---

</div>

## 🧠 The Problem: The High Cost of Context Loss

Every developer and knowledge worker experiences the **"Context Gap"**:
* **23+ Minutes**: Average time required to recover deep focus after a weekend, meeting, or context switch.
* **Fragmented Knowledge**: Architectural rationale is lost in ephemeral Slack threads, meeting chats, and closed PRs.
* **Onboarding Friction**: New team members take days or weeks to grasp project status, key decisions, and active blockers.

---

## 💡 The Solution: ContextOS

**ContextOS** operates as an intelligent continuity layer on top of your project workspaces. It records decisions, tracks open loops, identifies session boundaries, and uses **Google Gemini AI** to reconstruct high-signal, actionable briefings when you return.

```text
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │  Leave Project  │  ──►  │ Context Engine  │  ──►  │ Resume My Work  │
 │  (End Session)  │       │ Synthesizes DB  │       │  Instant Flow   │
 └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 🌟 Core Features

### 1. 🚀 Real "Resume My Work" Context Reconstruction
When returning to a project, ContextOS dynamically analyzes database state and generates a structured 7-point continuity briefing:
* **Where You Left Off**: Precise narrative of your previous session's stopping point.
* **What You Completed**: Verified milestone checklist since last review.
* **Important Decisions (ADR)**: Key architectural choices with rationale and consensus.
* **What Changed**: Chronological audit feed across schemas, tasks, and deployments.
* **Open Loops**: Prioritized active blockers and critical pending tasks.
* **Relevant Information**: Deep links to attached API specs and RFC documents.
* **Recommended Continuation**: The single highest-leverage next step with guided sub-tasks.

### 2. 🕸️ Interactive Context Graph
A visual dependency network mapping the relationships between:
* **Projects** ➔ **Tasks** ➔ **Decisions (ADR)** ➔ **Technical Documents** ➔ **Team Members**
* Includes zoom/pan controls, full-screen canvas, and an interactive slide-out node inspector.

### 3. 🛡️ Dual AI Engine with Zero-Data-Loss Fallback
ContextOS treats the database as the true source of truth:
* **Primary**: **Google Gemini Live AI** (`gemini-3.1-flash-lite`, `gemini-1.5-flash`) for nuanced reasoning.
* **Resilient Fallback**: If Gemini quota is exceeded (HTTP 429) or offline, ContextOS automatically activates the **Deterministic Continuity Engine** to reconstruct briefings from real database records without logging out or losing data.

### 4. 🏢 Multi-User Tenant Isolation
* Genuine registration and login with `bcryptjs` password hashing and JWT sessions.
* Strict server-side authorization: User A can **never** access, modify, or delete User B's projects (`403 Forbidden`).
* Clean empty states for new users (*"Your workspace is ready. Create your first project."*).

### 5. ⚡ Architecture Decision Records (ADR)
* Record architectural decisions, tradeoffs, and consensus status directly within the workspace.

### 6. 📄 Project Handover Briefs
* 1-click executive handover summary generator for onboarding teammates or stakeholder reporting with instant markdown clipboard copy.

---

## 🏛️ System Architecture

```text
                             ┌───────────────────────────────┐
                             │       React 18 + Vite         │
                             │  Tailwind CSS + Lucide Icons  │
                             └───────────────┬───────────────┘
                                             │  HTTP / JWT
                                             ▼
                             ┌───────────────────────────────┐
                             │     Express.js API Layer      │
                             │  Strict Tenant Authorization  │
                             └───────────────┬───────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
      ┌──────────────────────────────┐              ┌──────────────────────────────┐
      │   Database (Prisma ORM)      │              │    ContextOS Context Engine  │
      │   PostgreSQL / SQLite        │              │    - Session Boundary Delta  │
      │   - Users & Projects         │              │    - Open Loop Extraction    │
      │   - Tasks & ADR Decisions    │              │    - Relational Graph Builder│
      │   - Documents & Meetings     │              └──────────────┬───────────────┘
      │   - Audit Activity & Sessions│                             │
      └──────────────────────────────┘                             ▼
                                                    ┌──────────────────────────────┐
                                                    │     AI Continuity Layer      │
                                                    │  ├── Google Gemini Live AI   │
                                                    │  └── Deterministic Fallback  │
                                                    └──────────────────────────────┘
```

---

## 🎯 Hackathon Evaluator & Judge Quick Access

We provide an instant demo workspace seeded with rich scenarios:

| Access Method | Details |
| :--- | :--- |
| **⚡ Instant Demo Login** | Click **"⚡ Instant Hackathon Demo Login"** on the login screen. |
| **Demo Credentials** | Email: `demo@contextos.ai`<br>Password: `contextos123` |
| **Featured Demo Project** | **CampusConnect** (Auth module completed, Profile API schema blocked, ADRs logged). |
| **Real User Registration** | Switch to the **Create Account** tab to register your own isolated private workspace. |

---

## 🛠️ Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/saisrikarbommisetty/contextos-ai.git
cd contextos-ai
```

### 2. Configure Backend Environment
Create `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
JWT_SECRET="contextos_jwt_secure_secret_key_2026"
CLIENT_URL="http://localhost:5173"

# Google Gemini API Key (Optional — Deterministic Fallback activates automatically if omitted)
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_gemini_api_key_here"
DEMO_MODE=false
```

### 3. Initialize Database & Seed
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
```

### 4. Configure Frontend Environment
Create `frontend/.env`:
```env
VITE_API_URL="/api"
```

### 5. Start Development Servers
In two separate terminals:

```bash
# Terminal 1: Backend Server (http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Frontend Client (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Automated Test Suite (35/35 Passing)

ContextOS includes a comprehensive Jest integration test suite verifying multi-user isolation, real project CRUD, and AI fallback resilience.

```bash
cd backend
npm test
```

### Test Coverage Summary

```text
PASS tests/production.test.ts
  ContextOS Production Multi-User & Real Data Architecture Suite
    1. Real User Authentication & Registration
      ✓ Rejects registration with invalid email format
      ✓ Rejects registration with short password (< 6 chars)
      ✓ Rejects registration when confirmPassword does not match
      ✓ Registers User A successfully and returns JWT + clean profile
      ✓ Rejects duplicate email registration with 409 Conflict
      ✓ Registers User B successfully
      ✓ User A login with wrong password fails with 401
      ✓ User A login with correct password succeeds
      ✓ GET /api/auth/me returns authenticated user identity
    2. Multi-User Workspace Isolation & Strict Server Authorization
      ✓ New User A initially has an empty workspace dashboard
      ✓ User A creates Project A ("Alpha Cloud Engine")
      ✓ User B creates Project B ("Beta Security Scanner")
      ✓ User A dashboard only lists Project A and NOT Project B
      ✓ User B dashboard only lists Project B and NOT Project A
      ✓ User B cannot read Project A workspace (403 Forbidden)
      ✓ User B cannot update Project A details (403 Forbidden)
      ✓ User B cannot delete Project A (403 Forbidden)
    3. Real Project Entity Management (Tasks, ADRs, Docs, Meetings)
      ✓ User A adds in-progress task to Project A
      ✓ User A adds blocked task to Project A
      ✓ User A records an Architectural Decision (ADR)
      ✓ User A attaches technical documentation
      ✓ User A logs a team sync meeting
      ✓ User B cannot delete User A task (403 Forbidden)
      ✓ User A updates Project A details
    4. Real Context Reconstruction & AI Fallback Resilience
      ✓ Resume My Work reconstructs context strictly from User A real project data
      ✓ Project Handover Brief reconstructs User A real milestones & blockers
      ✓ Gemini 429 / Quota Failure triggers Deterministic Fallback on real user data (Zero data loss, no demo mode switch)
    5. Demo Workspace & Judge Account Separation
      ✓ Demo login provides demo user session and leaves real user accounts isolated

PASS tests/backend.test.ts
  ContextOS Backend API & Context Engine Test Suite
    ✓ GET /api/health returns online status and platform version
    ✓ GET /api/dashboard returns user active projects and continuity stats
    ✓ GET /api/projects returns seeded projects including CampusConnect
    ✓ GET /api/projects/:id returns full project workspace data
    ✓ GET /api/projects/:id/context-graph returns interconnected relational graph nodes & edges
    ✓ POST /api/projects/:id/resume executes Hero Context Reconstruction
    ✓ POST /api/projects/:id/context-brief generates comprehensive handover brief

Test Suites: 2 passed, 2 total
Tests:       35 passed, 35 total
Snapshots:   0 total
```

---

## 🌐 Cloud Deployment (Vercel + Render)

ContextOS is architected for zero-configuration cloud deployment:

### Step 1: Deploy Backend to Render (Free Web Service)
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npm run prisma:generate && npm run build`
   * **Start Command**: `npm run prisma:push && npm run seed && npm start`
4. Add Environment Variables:
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: `file:./dev.db` (or hosted PostgreSQL URL)
   * `JWT_SECRET`: *(Generate a secure random string)*
   * `DEMO_MODE`: `false`
   * `AI_PROVIDER`: `gemini`
   * `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   * `CLIENT_URL`: `https://your-frontend.vercel.app`
5. Click **Create Web Service** and copy your live backend URL (e.g. `https://contextos-api.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel (Global Edge CDN)
1. In the [Vercel Dashboard](https://vercel.com), click **Add New...** ➔ **Project**.
2. Select your repository.
3. Configure:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
4. Add Environment Variable:
   * `VITE_API_URL`: `https://your-backend-name.onrender.com/api`
5. Click **Deploy**. Vercel will build and host the SPA with global caching and SSL.

---

## 📂 Project Structure

```text
ContextOS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Project, Task, Decision, Doc, Meeting, Session)
│   │   └── seed.ts                # Realistic demo workspace seed script
│   ├── src/
│   │   ├── controllers/           # Auth, Dashboard, Project, and Resume controllers
│   │   ├── middleware/            # JWT authentication & error handling
│   │   ├── routes/                # Express API route declarations
│   │   ├── services/
│   │   │   ├── ai/                # CloudLLMProvider (Gemini) & DeterministicFallbackProvider
│   │   │   ├── context/           # ContextEngine & GraphBuilder
│   │   │   └── projectService.ts  # Project CRUD & strict authorization enforcement
│   │   ├── server.ts              # Express application entry & CORS configuration
│   │   └── types/                 # Shared TypeScript interfaces
│   └── tests/
│       ├── production.test.ts     # Multi-user isolation, CRUD & AI fallback test suite
│       └── backend.test.ts        # Hero feature integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── brief/             # Project Handover Brief modal
│   │   │   ├── common/            # Sidebar, ContextHealthBadge, LoadingState
│   │   │   ├── dashboard/         # ProjectCard, ResumeHeroCard, QuickStats, RecentActivity
│   │   │   ├── project/           # Tasks, Decisions, Documents, Meetings, ContextGraph tabs
│   │   │   └── resume/            # Multi-step Resume My Work modal & confetti
│   │   ├── context/               # AuthContext & state management
│   │   ├── pages/                 # LandingPage, LoginPage, DashboardPage, ProjectWorkspacePage
│   │   ├── services/api.ts        # Axios API client with automatic JWT token interceptor
│   │   └── types/                 # Frontend TypeScript interfaces
│   └── vercel.json                # Vercel SPA routing rewrites
└── render.yaml                    # Render Blueprint deployment definition
```

---

## 🔒 Security & Privacy

* **Zero Plaintext Passwords**: All credentials hashed with `bcryptjs`.
* **Server-Side Authorization**: Project ownership checked on every request; no client-side security assumptions.
* **Secret Protection**: `GEMINI_API_KEY`, database URLs, and `JWT_SECRET` remain strictly server-side.

---

## 👥 Team & Acknowledgements

Built for the AI Hackathon.  
**Lead Engineer**: Sai Srikar Bommisetty  
**Platform**: ContextOS — AI-Powered Context Recovery & Work Continuity

---

<div align="center">
  <sub>ContextOS © 2026. Distributed under the MIT License.</sub>
</div>
