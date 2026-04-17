# UniCycle -- Claude Code Context

This is a student-only marketplace for Montreal universities. Read this before making any changes.

## Stack

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (Supabase), deployed on Render
- **Web:** React 19 + Vite + Tailwind CSS, deployed on Vercel
- **Mobile:** React Native + Expo (iOS + Android)
- **Email:** Resend SDK (`noreply@unicycleapp.ca`)
- **Images:** Cloudinary (compress before upload with browser-image-compression)
- **Payments:** Stripe (escrow system called "Secure Pay")
- **i18n:** shared/i18n/en.json + fr.json -- used by both web and mobile

## Key File Locations

- Backend models: `backend/app/models/`
- Backend routers: `backend/app/routers/`
- Backend config: `backend/app/config.py`
- Backend email util: `backend/app/utils/email.py`
- Web pages: `web/src/pages/`
- Web components: `web/src/components/`
- Web API clients: `web/src/api/`
- Mobile screens: `mobile/src/screens/`
- Shared i18n: `shared/i18n/en.json` + `shared/i18n/fr.json`
- DB migrations: `backend/alembic/versions/`

## Coding Conventions

- No comments unless the WHY is non-obvious
- No em dashes in any user-facing text or copy -- use hyphens or colons instead
- No `Co-Authored-By` lines in git commits
- Prices validated: `ge=0, le=99999`. Titles: `min_length=3, max_length=150`
- Soft delete for listings: set `is_active=False`, never hard delete
- "All Montreal" browsing: pass `university=all`, omit university param from API call
- Free listings: `category="Free"`, `price=0`, skip price input in forms
- Images stored as JSON array of Cloudinary URLs in `listings.images` column
- Rate limiting via `slowapi` on sensitive auth endpoints

## Auth Flow

1. User signs up with university email
2. Resend sends verification email with token
3. User clicks link -> `is_verified=True`, sets password
4. JWT token issued on login, stored in Zustand auth store
5. Token sent as `Authorization: Bearer <token>` header

## Database Migrations

Always use Alembic -- do NOT add raw `ALTER TABLE` to `main.py`.

```bash
cd backend
python -m alembic revision --autogenerate -m "description"
python -m alembic upgrade head
```

## Adding a New Feature Checklist

- [ ] Backend: model (if new table), schema, router, register router in `main.py`
- [ ] Web: API client in `web/src/api/`, page or component, route in `App.jsx` if needed
- [ ] Mobile: screen in `mobile/src/screens/`, add to navigator if needed
- [ ] i18n: add keys to both `en.json` and `fr.json`
- [ ] Migration: run Alembic if schema changed

## Environment Variables (Render/Vercel)

Never commit `.env`. Key vars on Render:
- `DATABASE_URL` -- Supabase connection string
- `SECRET_KEY` -- JWT signing key
- `RESEND_API_KEY` -- Resend email API key
- `FRONTEND_URL` -- `https://www.unicycleapp.ca`
- `CLOUDINARY_*` -- Cloudinary credentials
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `ADMIN_EMAIL` -- receives report notifications

## What's Been Built (v1)

- Full auth with university email validation (9 Montreal schools)
- Listings with expiry (60 days), bump, boost (Stripe), free category
- Secure Pay escrow transactions
- Messaging (WebSocket, typing indicators, read receipts, reply threading, image messages)
- Saved listings + saved search email alerts (4-hour intervals via APScheduler)
- Reviews and ratings
- Referral system with boost credits
- Admin dashboard (stats, suspend users, moderate listings, reports, announcements, sponsors)
- Sponsor system (pin listings to top of category per university)
- Full EN/FR i18n on web and mobile
- PWA support on web
