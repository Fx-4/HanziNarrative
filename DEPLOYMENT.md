# 🚀 HanziNarrative Deployment Guide

Complete step-by-step guide to deploy HanziNarrative to production (100% FREE).

## 📋 Architecture

```
Frontend  → Vercel (React/Vite)
Backend   → Render (FastAPI/Python)
Database  → Supabase (PostgreSQL)
```

---

## 🗄️ Step 1: Setup Database (Supabase)

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (free)
3. Click "New Project"
   - Name: `hanzinarrative`
   - Database Password: (save this!)
   - Region: Choose closest to you
   - Click "Create new project"

### 1.2 Get Database URL
1. Go to Project Settings → Database
2. Copy "Connection string" (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this URL, you'll need it for backend deployment

### 1.3 Run Database Migration
```bash
# In your local machine
cd backend

# Update DATABASE_URL in .env or export it:
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Run migrations
alembic upgrade head

# Seed initial data (HSK vocabulary)
python seed_hsk1_complete.py
python seed_hsk2_complete.py
# ... run other seed files as needed
```

---

## 🐍 Step 2: Deploy Backend (Render)

### 2.1 Prepare Repository
1. Make sure your code is pushed to GitHub
2. Ensure `render.yaml` exists in backend folder (already created!)

### 2.2 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free)

### 2.3 Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hanzinarrative-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### 2.4 Set Environment Variables
In Render dashboard, add these environment variables:
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SECRET_KEY=generate-a-random-secret-key-here-use-openssl-rand-hex-32
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (~5 minutes)
3. Copy your backend URL: `https://hanzinarrative-backend.onrender.com`

---

## ⚛️ Step 3: Deploy Frontend (Vercel)

### 3.1 Update API URL
Create `.env.production` in frontend folder:
```env
VITE_API_URL=https://hanzinarrative-backend.onrender.com
```

### 3.2 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)

### 3.3 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.4 Set Environment Variables
Add environment variable:
```
VITE_API_URL=https://hanzinarrative-backend.onrender.com
```

### 3.5 Deploy
1. Click "Deploy"
2. Wait for deployment (~2 minutes)
3. Copy your frontend URL: `https://hanzinarrative.vercel.app`

---

## 🔧 Step 4: Update CORS

Go back to Render dashboard and update `CORS_ORIGINS`:
```
CORS_ORIGINS=https://hanzinarrative.vercel.app
```

Then redeploy backend (click "Manual Deploy" → "Deploy latest commit")

---

## ✅ Step 5: Test Deployment

1. Visit your frontend URL
2. Try to register a new account
3. Login
4. Test all features:
   - Practice HSK vocabulary
   - Review system
   - Writing practice
   - Stories
   - Sentence builder
   - Dashboard

---

## 🎯 Important Notes

### Free Tier Limits:
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Render**: Free tier sleeps after 15min inactivity (cold start ~30s)
- **Supabase**: 500MB database, unlimited API requests

### Cold Start Fix (Render):
Free tier sleeps after 15min idle. Solutions:
1. Upgrade to paid ($7/month - no sleep)
2. Use cron-job.org to ping your backend every 10min
3. Accept 30s initial load time

### Custom Domain:
Both Vercel and Render support custom domains for free!

---

## 🔒 Security Checklist

- [ ] Change SECRET_KEY to random value
- [ ] Update CORS_ORIGINS to production URL only
- [ ] Never commit .env files
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Vercel & Render)

---

## 📊 Monitoring

### Render:
- View logs in Render dashboard
- Monitor CPU/Memory usage
- Set up alerts

### Vercel:
- Analytics dashboard
- Error tracking
- Performance monitoring

### Supabase:
- Database activity
- Query performance
- Storage usage

---

## 🆘 Troubleshooting

### Backend not responding:
1. Check Render logs for errors
2. Verify DATABASE_URL is correct
3. Ensure all dependencies in requirements.txt
4. Check if service is sleeping (cold start)

### CORS errors:
1. Verify CORS_ORIGINS includes your frontend URL
2. Redeploy backend after changing env vars
3. Clear browser cache

### Database connection failed:
1. Verify Supabase database is running
2. Check DATABASE_URL format
3. Ensure password is correct
4. Check Supabase connection limits

---

## 🎉 Success!

Your app is now live! Share it with users:
- Frontend: `https://hanzinarrative.vercel.app`
- Backend API: `https://hanzinarrative-backend.onrender.com`
- API Docs: `https://hanzinarrative-backend.onrender.com/docs`

---

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier | Paid (optional) |
|---------|-----------|-----------------|
| Vercel  | $0 | $20/month (Pro) |
| Render  | $0 (with cold start) | $7/month (no cold start) |
| Supabase| $0 | $25/month (more storage) |
| **Total**| **$0** | **$52/month** (fully managed) |

Recommended: Start with free tier, upgrade Render ($7) when you have users who need instant response.

---

Made with ❤️ using Claude Code
