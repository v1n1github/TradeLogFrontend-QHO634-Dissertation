# TradeLog — Frontend

Next.js web application for the TradeLog trading journal system.

**Project:** QHO634 Dissertation Project — Southampton Solent University
**Stack:** Next.js 14 · React 18 · Tailwind CSS · Chart.js · react-hot-toast

---

## Prerequisites

| Tool    | Version |
| ------- | ------- |
| Node.js | >= 18.x |
| npm     | >= 9.x  |

> Requires the backend API to be running on port 8000.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
```

---

## Run

```bash
# Development
npm run dev

# Production build
npm run build && npm start
```

Frontend runs on **http://localhost:3000**

---

## Demo Login Credentials

| Role       | Username      | Password    |
| ---------- | ------------- | ----------- |
| **Admin**  | `admin`       | `admin123`  |
| **Trader** | `trader_alex` | `user123`   |
| **Trader** | `trader_sam`  | `trader456` |

---

## Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Features

- **JWT Authentication** — Login, signup, session persistence, auto-logout on expiry
- **Two roles: Admin & User** — Admin monitors all participants; Users manage their own trades
- **Trade Entry Form** — Full risk parameters with auto-calculated R:R ratio
- **Post-Trade Reflections** — Emotional state tracking, lessons learned
- **Live Dashboard** — Win rate, net P&L, profit factor, risk consistency, rule adherence + charts
- **Admin Panel** — User management, all-trades monitor, evaluation responses
- **Usability Evaluation** — Built-in Likert-scale survey for research participants

---

## Project Structure

```
frontend/
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── context/
    │   └── AuthContext.js        ← Global auth state, login/logout, authFetch helper
    ├── lib/
    │   └── api.js                ← All API calls (pass authFetch from useAuth())
    ├── styles/
    │   └── globals.css           ← Tailwind layers — card, input, btn, badge utilities
    ├── components/
    │   ├── Layout.js             ← Nav with user menu, role-aware links, logout
    │   ├── TradeForm.js          ← Add/Edit trade form (auto RR calc)
    │   ├── ReflectionForm.js     ← Emotional state picker + text fields
    │   ├── Modal.js              ← Reusable modal
    │   ├── StatCard.js           ← Dashboard metric card
    │   ├── LoadingSpinner.js     ← Spinner + skeleton loaders
    │   └── charts/Charts.js     ← WinLoss pie, Risk trend, Risk-by-outcome bar
    └── pages/
        ├── login.js              ← Login page (no layout wrapper)
        ├── signup.js             ← Signup page (no layout wrapper)
        ├── index.js              ← User dashboard
        ├── evaluation.js         ← Usability survey
        ├── 404.js                ← Custom 404 page
        ├── trades/
        │   ├── add.js            ← Add trade form
        │   ├── index.js          ← Trade log (sortable, searchable, edit/delete)
        │   └── [id]/reflection.js ← Trade detail + reflections
        └── admin/
            ├── index.js          ← Admin overview + platform stats
            ├── users.js          ← User management (CRUD, activate, role)
            ├── trades.js         ← All trades monitor (filterable)
            └── evals.js          ← Evaluation responses + aggregate scores
```

---

## Role Permissions

| Action                         | User | Admin |
| ------------------------------ | ---- | ----- |
| View own trades                | Yes  | Yes   |
| Add / edit / delete own trades | Yes  | Yes   |
| View own dashboard             | Yes  | Yes   |
| Add reflections to own trades  | Yes  | Yes   |
| Submit evaluation              | Yes  | Yes   |
| View all users' trades         | No   | Yes   |
| View platform-wide stats       | No   | Yes   |
| Create / manage user accounts  | No   | Yes   |
| View all evaluation responses  | No   | Yes   |
