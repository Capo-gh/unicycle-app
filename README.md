# UniCycle -- Student Marketplace Montreal

A verified student-only marketplace for Montreal universities. Students can buy and sell textbooks, electronics, furniture, and more with people from their campus.

**Live site:** https://www.unicycleapp.ca

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + SQLAlchemy + PostgreSQL (Supabase) |
| Web | React 19 + Vite + Tailwind CSS |
| Mobile | React Native + Expo (iOS + Android) |
| Database hosting | Supabase (Nano plan, AWS us-west-2) |
| Backend hosting | Render |
| Web hosting | Vercel |
| Email | Resend (`noreply@unicycleapp.ca`) |
| Images | Cloudinary |
| Payments | Stripe (escrow/Secure Pay) |
| i18n | English + French (shared/i18n/) |

---

## Project Structure

```
unicycle-app/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API route handlers
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── utils/        # Auth, email, dependencies
│   │   ├── config.py     # Settings (reads from env vars)
│   │   ├── database.py   # DB connection
│   │   └── main.py       # App entry point, scheduler jobs
│   ├── alembic/          # DB migrations
│   └── requirements.txt
├── web/              # React web app
│   ├── src/
│   │   ├── pages/        # Full page components
│   │   ├── components/   # Shared UI components
│   │   ├── api/          # Axios API clients per feature
│   │   ├── store/        # Zustand state (auth, marketplace)
│   │   └── utils/
│   └── public/           # robots.txt, sitemap.xml, icons
├── mobile/           # React Native + Expo app
│   └── src/
│       └── screens/      # One file per screen
└── shared/
    ├── i18n/             # en.json + fr.json translation files
    └── constants/        # Universities list, colors
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Create a `backend/.env` file:

```
DATABASE_URL=your_supabase_connection_string
SECRET_KEY=any_random_string
RESEND_API_KEY=re_your_key
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ADMIN_EMAIL=your@email.com
```

### Web

```bash
cd web
npm install
npm run dev
```

Web runs at `http://localhost:5173`.

### Mobile

```bash
cd mobile
npm install
npx expo start
```

---

## Database Migrations

We use Alembic. `env.py` reads `DATABASE_URL` from config, not `alembic.ini`.

```bash
cd backend

# Create a new migration
python -m alembic revision --autogenerate -m "description"

# Apply migrations
python -m alembic upgrade head
```

---

## Key Features

- **Auth** -- University email domain validation for 9 Montreal schools, email verification via Resend, JWT tokens
- **Listings** -- CRUD, image upload (Cloudinary + compression), 60-day expiry with bump/renew, boost (Stripe, 48hr top placement)
- **Free category** -- Post items for free, no price required
- **Messaging** -- Real-time via WebSocket, typing indicators, read receipts, reply threading, image messages
- **Secure Pay** -- Stripe escrow: buyer pays into escrow, funds released on confirmation
- **Saved listings + saved searches** -- Email alerts every 4 hours for new matches
- **Reviews** -- Star ratings on completed transactions
- **Referral system** -- Unique referral codes, boost credits awarded on signup
- **Admin dashboard** -- Stats, user management (suspend/unsuspend), listing moderation, reports, announcements, sponsor management
- **Sponsor system** -- Sponsors pin listings to top of a category at specific universities
- **i18n** -- Full English + French support across web and mobile

---

## Supported Universities

McGill, Concordia, UdeM, UQAM, Polytechnique Montreal, ETS, HEC Montreal, Universite Laval, Universite de Sherbrooke

---

## Deployment

- **Backend:** Render -- auto-deploys from `main` branch
- **Web:** Vercel -- auto-deploys from `main` branch
- **Mobile:** EAS Build (`eas build --platform all`)

Environment variables are set in Render (backend) and Vercel (web). Never commit `.env` files.

---

## Conventions

- Backend validation lives in `schemas/` (Pydantic). Prices: `ge=0, le=99999`. Titles: `min_length=3, max_length=150`.
- Images stored as JSON array of Cloudinary URLs in `listings.images`
- "All Montreal" marketplace uses `university=all` -- omit university param from API calls
- Soft delete for listings: `is_active=False` (not a real DB delete)
- Rate limiting via `slowapi` -- sensitive auth endpoints are limited per IP
