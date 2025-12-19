# 🚀 Rovo Sprint Strategist - Deployment Guide

## 📋 Prerequisites

1. **Supabase Account** - [supabase.com](https://supabase.com)
2. **Vercel Account** (Optional) - [vercel.com](https://vercel.com)
3. **Node.js 18+** or **Bun** installed locally
4. **Anthropic API Key** (Optional) - For AI features

---

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Enter:
   - **Project Name**: `rovo-sprint-strategist`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users

### 1.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `supabase/schema.sql`
4. Click **"Run"**
5. You should see: `Database schema created and seeded successfully!`

### 1.3 Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## ⚙️ Step 2: Backend Setup

### 2.1 Configure Environment

```bash
cd api
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For AI features
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 2.2 Install Dependencies

```bash
cd api
npm install
# or
bun install
```

### 2.3 Start Backend Server

```bash
npm run dev
# or
node server.js
```

Server runs at: `http://localhost:3001`

Test: `curl http://localhost:3001/api/health`

---

## 🎨 Step 3: Frontend Setup

### 3.1 Configure Environment

```bash
cd static/dashboard
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 3.2 Install Dependencies

```bash
cd static/dashboard
bun install
# or
npm install
```

### 3.3 Start Development Server

```bash
bun dev
# or
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## ✅ Step 4: Verify Everything Works

### Test Endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Get sprint data
curl http://localhost:3001/api/sprint

# Get team members
curl http://localhost:3001/api/team

# Get metrics
curl http://localhost:3001/api/metrics
```

### Test Frontend:
1. Open `http://localhost:5173`
2. Check Dashboard loads with data
3. Navigate to all 7 pages
4. Verify charts and animations work

---

## 🚢 Step 5: Deploy to Vercel

### 5.1 Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 5.2 Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (optional)
4. Click **Deploy**

### 5.3 Update Frontend Environment

After deployment, update the frontend `.env`:
```env
VITE_API_URL=https://your-app.vercel.app
```

---

## 🔧 Troubleshooting

### API not connecting to Supabase
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Verify database tables exist (run schema.sql again)
- Check Supabase RLS policies are set

### Frontend shows loading forever
- Check API is running (`curl http://localhost:3001/api/health`)
- Check `VITE_API_URL` is correct
- Check browser console for CORS errors

### AI features not working
- Set `ANTHROPIC_API_KEY` in API `.env`
- Or set `DEMO_MODE=true` for mock AI

---

## 📊 Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Supabase     │
│  (React/Vite)   │     │   (Express)     │     │   (Postgres)    │
│  localhost:5173 │     │  localhost:3001 │     │   Cloud DB      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Anthropic     │
                        │   (Claude AI)   │
                        └─────────────────┘
```

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Setup Supabase (run schema.sql in SQL Editor)

# 2. Start Backend
cd api
cp .env.example .env
# Edit .env with Supabase keys
npm install && npm run dev

# 3. Start Frontend (new terminal)
cd static/dashboard
bun install && bun dev

# 4. Open http://localhost:5173
```

---

Made with 🏎️ for **Codegeist 2025**
