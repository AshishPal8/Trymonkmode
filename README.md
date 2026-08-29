# 🌟 Try Monk Mode

> **The Ultimate All-in-One Productivity, Focus, Wellness & Personal Management Suite**  
> *Next.js 16 • React 19 • TypeScript • Tailwind CSS v4 • Shadcn UI • Express 5 • Bun • Drizzle ORM • PostgreSQL*

---

## 🚀 Overview

**Try Monk Mode** is a unified personal operating system designed to eliminate digital fragmentation. It brings together task execution, time management, habit compounding, emotional wellness, stoic journaling, goal tracking, and personal finance into a single high-velocity flow state.

---

## 🏗️ Repository Architecture (Monorepo)

This repository contains both the **Frontend** and **Backend** in a clean, unified structure:

```
Trymonkmode/
├── backend/                  # Bun + Express 5 + Drizzle ORM + PostgreSQL
│   ├── src/
│   │   ├── modules/          # 3-tier modules (Auth, Tasks, Habits, Journal, Goals, etc.)
│   │   ├── middlewares/      # Auth (JWT/Cookies), RBAC, Validation
│   │   ├── db/               # PostgreSQL schemas & migrations
│   │   └── server.ts         # Backend entrypoint (Port 4000)
│   └── package.json
│
├── frontend/                 # Next.js 16 (App Router) + React 19 + Tailwind v4 + Zustand
│   ├── src/
│   │   ├── app/              # Layout, globals.css, router
│   │   ├── components/       # AuthModal, Navigation, Shadcn UI primitives
│   │   ├── modules/          # 12 Core feature views
│   │   └── stores/           # Zustand state management stores
│   └── package.json
│
├── PROJECT.md                # Full Architecture & Technical Specification
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
bun install # or npm install
cp .env.example .env
bun run dev
# -> Backend running on http://localhost:4000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# -> Application running on http://localhost:3000
```

---

## 🛡️ License

MIT License. Engineered with ❤️ for peak performance and clarity.
