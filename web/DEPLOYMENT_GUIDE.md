# UniCycle Deployment Guide

## Overview
- **Backend**: Railway (FastAPI + PostgreSQL)
- **Frontend**: Vercel (React + Vite)
- **Images**: Cloudinary

---

## Part 1: Cloudinary Setup (5 minutes)

1. Go to https://cloudinary.com and create a free account
2. After signup, go to Dashboard
3. Copy these values (you'll need them for Railway):
   - Cloud Name
   - API Key
   - API Secret

---

## Part 2: Backend Deployment on Railway (15 minutes)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended for easy deployment)

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `unicycle-app` repository
4. **Important**: Set the root directory to `backend`

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` variable

### Step 4: Set Environment Variables
In Railway project → Settings → Variables, add:

```
JWT_SECRET=generate-a-random-32-character-string
FRONTEND_URL=https://your-vercel-url.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**To generate JWT_SECRET**, use this in terminal:
```bash
openssl rand -hex 32
```
Or just make up a long random string.

### Step 5: Configure Build Settings
In Railway project → Settings:
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 6: Deploy
1. Click "Deploy" or push to GitHub (auto-deploys)
2. Wait for build to complete (2-3 minutes)
3. Get your backend URL (e.g., `https://unicycle-api-production.up.railway.app`)

### Step 7: Test Backend
Visit: `https://your-railway-url.railway.app/`
Should see: `{"message": "UniCycle API is running!", "version": "1.0.0"}`

---

## Part 3: Frontend Deployment on Vercel (10 minutes)

### Step 1: Update Vercel Project
Your frontend is already on Vercel, we just need to add the API URL.

### Step 2: Set Environment Variable
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.railway.app` (your Railway backend URL)
   - **Environment**: Production, Preview, Development (all)

### Step 3: Redeploy
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for build to complete

### Step 4: Test
Visit your Vercel URL and try:
1. Sign up with a university email
2. Browse listings
3. Create a listing with image upload

---

## Part 4: Update Railway CORS (After getting Vercel URL)

Go back to Railway and update:
- `FRONTEND_URL` = your actual Vercel URL (e.g., `https://unicycle-app.vercel.app`)

Then redeploy Railway (push to GitHub or click Redeploy).

---

## Troubleshooting

### "Signup failed" error
- Check Railway logs for errors
- Verify DATABASE_URL is set
- Verify JWT_SECRET is set

### Images not uploading
- Check Cloudinary credentials in Railway
- Check browser console for errors

### CORS errors
- Make sure FRONTEND_URL in Railway matches your exact Vercel URL
- No trailing slash

### Database errors
- Railway PostgreSQL should auto-connect
- Check DATABASE_URL is set in Railway variables

---

## Local Development After Deployment

Create `.env` file in `backend/`:
```
JWT_SECRET=local-dev-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Create `.env` file in `web/`:
```
VITE_API_URL=http://localhost:8000
```

---

## Costs

- **Railway**: Free tier includes $5/month credit (enough for MVP)
- **Vercel**: Free tier (generous limits)
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth)

All free for MVP/demo purposes! 🚀