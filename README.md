# TripAI 🌍

AI-powered travel planning — chat to plan, one click to book.

---

## Project Structure

```
tripai/
├── backend/     → Python FastAPI (AI, APIs, payments, database)
└── frontend/    → Next.js (website UI)
```

---

## Setup Instructions

### Step 1 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Open .env and fill in your API keys

# Run backend
uvicorn main:app --reload
# Backend runs at http://localhost:8000
```

### Step 2 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run frontend
npm run dev
# Frontend runs at http://localhost:3000
```

---

## API Keys You Need

| Service | Where to get | Cost |
|---------|-------------|------|
| Groq | console.groq.com | Free |
| Supabase | supabase.com | Free |
| Razorpay | razorpay.com | Free (test mode) |
| Amadeus | developers.amadeus.com | Free (sandbox) |
| Google Places | console.cloud.google.com | $200 free credit/month |
| RapidAPI Hotels | rapidapi.com | Free tier |

---

## Build Phases

- [ ] Step 2 — Database Schema
- [ ] Step 3 — Auth System
- [ ] Step 4 — User Profile & Preferences
- [ ] Step 5 — AI Chat Interface
- [ ] Step 6 — Flight, Hotel, Places APIs
- [ ] Step 7 — Razorpay Payments
- [ ] Step 8 — PDF Generation
- [ ] Step 9 — End-to-End Testing
- [ ] Step 10 — Cloud Deployment
