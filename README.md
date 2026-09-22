# ContextOS — AI-Powered Context Recovery & Work Continuity Platform

> **The AI Context Layer for Human Work.**  
> Never lose your work context again. ContextOS reconstructs where you left off, what changed, why decisions were made, and what to do next—so you can get back into the flow instantly.

---

## 🌟 Architecture & Features

1. **Live Gemini AI Integration**:
   - Integrated with **Google Gemini 1.5/2.0 Flash** (and OpenAI `gpt-4o-mini`).
   - Automatically analyzes real project records, tasks, decisions, and temporal session deltas to generate structured briefings.
   - Zero-latency fallback to `DemoAIProvider` if no API key is provided or during rate limits.

2. **Full Dynamic Workspace CRUD**:
   - **Create & Manage Real Projects**: Initialize custom workspaces with live tracking.
   - **Task Progression**: Create, update status (`TODO` → `IN_PROGRESS` → `COMPLETED` / `BLOCKED`), assign team members, and track priorities.
   - **Architecture Decision Records (ADR)**: Record decisions with rationale, consensus status, and timestamps.
   - **Technical Specifications & RFCs**: Attach API contracts, architecture RFCs, and playbooks.
   - **Meeting Syncs**: Log planning summaries, participant tags, and action items.
   - **Live Audit Trail**: Every action automatically builds project memory and feeds the Context Engine.

3. **Interactive Context Graph**:
   - Relational dependency network visually linking tasks, decisions, documents, meetings, and team members with an interactive inspection drawer.

4. **Project Handover Briefs**:
   - 1-click comprehensive markdown summary generator with instant clipboard copy and print view.

---

## 🚀 Hero Experience: Resume My Work

When you click **"Resume My Work"**, ContextOS runs an autonomous multi-step Context Reconstruction pipeline:

1. **Temporal Session Boundary Identification**: Detects the exact boundary of your last active session.
2. **Entity Delta Aggregation**: Computes what changed (schema updates, newly assigned tasks, blocked deployments, updated documents).
3. **Open Loops & Decision Context**: Synthesizes unresolved tasks, blockers, and ADRs (Architecture Decision Records).
4. **Structured AI Briefing**:
   - **1. Where You Left Off** (executive narrative summary)
   - **2. What You Completed** (checklist of verified milestones)
   - **3. Important Decisions** (the *why* behind architectural choices)
   - **4. What Changed** (chronological event timeline with category tags)
   - **5. Open Loops** (prioritized blockers)
   - **6. Relevant Information** (deep links to RFCs and specs)
   - **7. Recommended Continuation** (next best action with step-by-step guidance)

---

## ⚡ Quick Start & Local Setup

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
cd ../backend

# Generate Prisma Client and push database schema to local SQLite
npm run prisma:generate
npm run prisma:push

# Seed realistic interconnected project data (CampusConnect, AI Research Assistant, Team Portal)
npm run seed
```

### 3. Run Development Servers
In two separate terminals:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Frontend App (runs on http://localhost:5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying with Vercel (Frontend) + Render (Backend)

This is the recommended combination for scalable, free cloud deployment:

### Step 1: Deploy Backend to Render (Web Service)

1. Push your code to your GitHub repository.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Name**: `contextos-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm run prisma:push && npm run seed && npm start`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: `file:./dev.db` (or your PostgreSQL database URL if using hosted Postgres)
   - `JWT_SECRET`: `your_random_secure_jwt_secret_key_here`
   - `NODE_ENV`: `production`
   - `DEMO_MODE`: `false`
   - `AI_PROVIDER`: `gemini`
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
6. Click **Create Web Service**. Copy your backend URL once live (e.g. `https://contextos-backend.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel

1. In [Vercel Dashboard](https://vercel.com), click **Add New...** → **Project**.
2. Select your repository.
3. Set the following settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-name.onrender.com/api` (use the URL from Step 1)
5. Click **Deploy**. Vercel will build and host your frontend globally with SSL.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET="contextos_jwt_secure_secret_key_hackathon_2026"
CLIENT_URL="http://localhost:5173"

# AI Reasoning (Google Gemini)
DEMO_MODE=false
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_actual_gemini_api_key_here"
GEMINI_MODEL="gemini-1.5-flash"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api" # (or your Render URL in production)
```

---

## 🧪 Testing & Validation

```bash
# Run backend integration tests
cd backend
npm test

# Run frontend build check
cd ../frontend
npm run build
```

---

## 🛡️ Demo Credentials

- **Email**: `demo@contextos.ai`
- **Password**: `contextos123`
- *Or click **"⚡ Instant Hackathon Demo Login"** on the login screen.*
