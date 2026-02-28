# SecureVault Cloud Deployment Guide

Deploy SecureVault without Docker - Backend on Render, Frontend on Vercel.

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Code

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/securevault.git
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"PostgreSQL"**
   - Name: `securevault-db`
   - Database: `securevault`
   - User: `securevault`
   - Plan: **Free**
   - Click **Create Database**
3. Click **"New +"** → **"Web Service"**
   - Connect your GitHub repo
   - Name: `securevault-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
4. **Environment Variables** (add these in Render dashboard):
   ```
   NODE_ENV=production
   CLIENT_URL=https://securevault-web.vercel.app  (we'll update this after Vercel deploy)
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-different-refresh-secret
   ENCRYPTION_KEY=your-32-byte-encryption-key!!!
   ```
   - Leave DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD empty - they'll auto-fill from the database
5. Click **Create Web Service**

Wait for deployment to complete. Note your backend URL: `https://securevault-api.onrender.com`

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repo
4. **Configure Project**:
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build` (or leave default)
   - Output Directory: `build`
5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://securevault-api.onrender.com/api
   ```
   (Use your actual Render backend URL)
6. Click **Deploy**

### Step 4: Update CORS (Important!)

1. Go back to Render dashboard
2. Select your `securevault-api` service
3. Go to **Environment** tab
4. Update `CLIENT_URL` to your actual Vercel URL (e.g., `https://securevault-web.vercel.app`)
5. The service will auto-redeploy

## 🔧 Post-Deployment Setup

### Seed the Database

After first deployment, you need to create the default users:

**Option 1: Using Render Shell**
1. In Render dashboard, go to your web service
2. Click **"Shell"** tab
3. Run: `node src/scripts/seed.js`

**Option 2: Local Connection**
1. Get your database connection string from Render dashboard (PostgreSQL → Connect)
2. Run locally:
   ```bash
   cd backend
   npm install
   export DATABASE_URL=postgres://... (from Render)
   node src/scripts/seed.js
   ```

### Default Credentials

After seeding:
- **Admin**: admin@securevault.test / Admin@123
- **User**: user@securevault.test / User@123

## 📋 Environment Variables Reference

### Backend (Render)

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `CLIENT_URL` | `https://your-vercel-url.vercel.app` | Yes |
| `JWT_SECRET` | Min 32 chars random string | Yes |
| `JWT_REFRESH_SECRET` | Different from JWT_SECRET | Yes |
| `ENCRYPTION_KEY` | Exactly 32 bytes | Yes |
| `DB_HOST` | Auto-filled from database | Auto |
| `DB_PORT` | Auto-filled from database | Auto |
| `DB_NAME` | Auto-filled from database | Auto |
| `DB_USER` | Auto-filled from database | Auto |
| `DB_PASSWORD` | Auto-filled from database | Auto |

### Frontend (Vercel)

| Variable | Value | Required |
|----------|-------|----------|
| `REACT_APP_API_URL` | `https://your-render-url.onrender.com/api` | Yes |

## 🔄 Auto-Deploy Setup

Both platforms support Git auto-deploy:
- **Push to main branch** → Auto deploys to production
- **Pull requests** → Create preview deployments

## 🛠️ Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Check `CLIENT_URL` in Render matches your Vercel URL exactly
2. Include `https://` and no trailing slash
3. Redeploy backend after changing env vars

### Database Connection Issues
1. Check if PostgreSQL service is running (Render dashboard)
2. Verify env vars are correctly set
3. Check logs in Render dashboard

### File Uploads Not Working
- Free tier has 512MB disk limit on Render
- Files stored on Render disk are ephemeral (redeploy = lost files)
- For production, consider AWS S3 or Cloudinary integration

## 💾 Storage Considerations

**Current Setup (Free Tier):**
- ✅ No Docker needed - saves ~5-10GB local storage
- ✅ Database: Managed PostgreSQL (1GB free)
- ✅ File Storage: Ephemeral disk (resets on redeploy)

**For Persistent File Storage:**
- Option 1: Integrate AWS S3 / Cloudinary (recommended)
- Option 2: Upgrade Render plan for persistent disk
- Option 3: Use database BYTEA for small files (< 1MB)

## 🚀 Local Development (No Docker)

If you need to develop locally without Docker:

**Backend:**
```bash
cd backend
npm install
# Create .env file with local database credentials
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Database:**
- Install PostgreSQL locally or use Render PostgreSQL with external connections enabled

## 📱 Access Your Deployed App

- **Frontend**: https://securevault-web.vercel.app
- **Backend API**: https://securevault-api.onrender.com
- **API Docs**: https://securevault-api.onrender.com/health

---

**Total Storage Needed Locally**: 0 GB (everything in cloud)
**Local Development Only**: ~200MB for node_modules when developing
