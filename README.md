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
