# VISERA

AI-powered resume checker: upload PDF → parse text → ATS analysis → suggested rewrites → version history & diff.

## Live

- **App (frontend):** https://visera-lyart.vercel.app
- **API health:** https://visera.onrender.com/api/health

## Stack

- **Frontend:** React, Vite, Tailwind CSS, TanStack Query, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Gemini AI
- **Deploy:** Vercel (UI) · Render (API) · MongoDB Atlas

## Features

- Register / login / logout (JWT)
- Profile & password update; forgot-password email flow
- PDF resume upload and text extraction
- ATS-oriented analysis with score, issues, strengths, keyword gaps
- Apply AI rewrites → new resume versions
- Version list, compare (diff), history & dashboard insights

## Local setup

### Prerequisites

- Node.js 18+ (20+ recommended)
- MongoDB Atlas account (or local MongoDB)
- Gemini API key (for analysis)
- Optional: Gmail App Password (for reset emails)

### 1. Backend

```bash
cd backend
cp .env.example .env
