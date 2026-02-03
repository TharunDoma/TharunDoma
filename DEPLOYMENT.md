# TharunDoma Deployment Guide - Go Live

**Date**: February 2, 2026  
**Goal**: Deploy portfolio to share with recruiters and on LinkedIn

---

## Quick Summary

You have 3 deployment options:

| Option | Ease | Cost | Time | Best For |
|--------|------|------|------|----------|
| **Vercel** (Recommended) | ⭐⭐⭐⭐⭐ | Free | 5 mins | Next.js apps |
| **Railway** | ⭐⭐⭐⭐ | $5-20/month | 10 mins | General apps |
| **Docker + VPS** | ⭐⭐⭐ | $5-20/month | 30 mins | Full control |

---

## OPTION 1: VERCEL (Easiest - Recommended)

### Why Vercel?
- ✅ Made by Next.js creators
- ✅ Automatic deployments from GitHub
- ✅ Free tier for hobby projects
- ✅ Lightning fast
- ✅ Perfect for portfolio/resume

### Step 1: Create GitHub Repository

If you don't have one yet:

```bash
cd C:\Users\tharu\tkbrand\TharunDoma\TharunDoma

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TharunDoma portfolio"

# Create repo on github.com and set remote
git remote add origin https://github.com/YOUR_USERNAME/tharundoma.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important**: Make sure `.env.local` is in `.gitignore` (it should be)

```bash
# Verify .env.local won't be pushed
cat .gitignore | grep env.local
# Should show: .env.local
```

---

### Step 2: Deploy on Vercel

**Method A: Via Vercel Dashboard (Easiest)**

1. Go to **https://vercel.com**
2. Click **"Sign Up"** → Choose "GitHub"
3. Authorize Vercel to access your GitHub account
4. Click **"Import Project"**
5. Select `tharundoma` repository
6. Click **"Import"**

That's it! Vercel will auto-detect it's a Next.js app and configure it.

**Method B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from project directory)
cd C:\Users\tharu\tkbrand\TharunDoma\TharunDoma
vercel

# Follow prompts:
# 1. Link to Vercel account
# 2. Select "Skip and deploy"
# 3. Confirm project name
```

---

### Step 3: Add Environment Variables

After deployment, add your secrets:

1. Go to **Vercel Dashboard** → Your project
2. Click **Settings** → **Environment Variables**
3. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
GEMINI_API_KEY = your-gemini-key
OPENAI_API_KEY = sk-your-openai-key
ADMIN_SECRET = your-secure-random-secret
```

**Get these from**:
- Supabase: https://app.supabase.com → Project Settings
- Gemini: https://ai.google.dev → API Keys
- OpenAI: https://platform.openai.com → API Keys

---

### Step 4: Redeploy with Environment Variables

After adding variables:

1. In Vercel dashboard, go to **Deployments**
2. Click the latest deployment
3. Click **Redeploy** (this uses new env vars)
4. Wait 2-3 minutes for build to complete

---

### Step 5: Get Your Live URL

Once deployment is green (✅):

Your site is live at: **https://tharundoma.vercel.app**

You can also set a custom domain if you own one:
- Vercel Settings → Domains → Add Domain

---

## OPTION 2: RAILWAY (Good Alternative)

If Vercel doesn't work for you:

### Setup Railway

1. Go to **https://railway.app**
2. Click **"Start Project"** → **"Deploy from GitHub repo"**
3. Authorize GitHub
4. Select `tharundoma` repository
5. Railway auto-detects and deploys

### Add Environment Variables

In Railway dashboard:
1. Click **Variables**
2. Add all `.env.local` variables
3. Click **Deploy**

Your site will be at: **https://tharundoma-production.up.railway.app** (or custom domain)

---

## OPTION 3: CUSTOM DOMAIN (Optional)

### Use a Custom Domain Instead of vercel.app

**Best**: Buy domain from:
- Namecheap ($3-10/year)
- Google Domains ($12/year)
- Cloudflare ($8/year)

### Connect to Vercel

1. Buy domain
2. In Vercel → Project → Settings → Domains
3. Add your domain
4. Follow instructions to point nameservers to Vercel

**Result**: https://yourname.com instead of https://tharundoma.vercel.app

---

## Pre-Deployment Checklist

Before going live, verify:

- [ ] `.env.local` is in `.gitignore`
- [ ] All environment variables are set
- [ ] Supabase tables created (run SQL scripts)
- [ ] Supabase `portfolio-images` bucket created and PUBLIC
- [ ] No hardcoded secrets in code
- [ ] TypeScript builds without errors: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Admin page works locally
- [ ] Chat works and uses correct API keys

---

## Testing Live Deployment

Once live, test these:

```bash
# 1. Check HTTPS is enforced
curl -I https://your-domain.com
# Should see: Strict-Transport-Security

# 2. Test admin page
https://your-domain.com/admin
# Enter ADMIN_SECRET

# 3. Test chat
https://your-domain.com/projects/ai-chat
# Ask a question

# 4. Check security headers
https://securityheaders.com/?q=your-domain.com
```

---

## Share on LinkedIn

Once live, add to LinkedIn profile:

1. Go to LinkedIn Profile → **Edit public profile**
2. In **About** section, add link:
   > "Check out my AI-powered portfolio: https://your-domain.com"

3. Or in **Website** section:
   > Website Name: "TharunDoma Portfolio"
   > URL: https://your-domain.com

4. In **Featured** section:
   - Click **Add** → **Website**
   - Add portfolio link
   - Add screenshot/description

---

## Share in Job Applications

**When applying:**

1. **Cover Letter**:
   > "I've built an AI-powered portfolio showcasing my projects and skills at https://your-domain.com"

2. **Resume Links**:
   - Portfolio: https://your-domain.com
   - GitHub: https://github.com/your-username/tharundoma

3. **Application Forms**:
   - Portfolio URL field: https://your-domain.com

---

## Monitoring & Maintenance

### View Logs

**Vercel**:
- Dashboard → Deployments → Click deployment → Logs

**Railway**:
- Dashboard → Logs tab

### Monitor Errors

Set up **Sentry** (optional):

```bash
npm install @sentry/nextjs
```

Then in Vercel environment variables:
```
SENTRY_AUTH_TOKEN = your-sentry-token
```

### Auto-Deploy on Push

**Vercel & Railway** automatically redeploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update admin features"
git push origin main

# Automatically deploys! 🚀
```

---

## Troubleshooting Deployment

### Issue: Build fails

```
ERROR: Failed to compile
```

**Fix**:
1. Check `npm run build` works locally
2. Verify TypeScript errors: `npx tsc --noEmit`
3. Check all imports are correct

### Issue: Environment variables not working

```
Error: SUPABASE_URL is undefined
```

**Fix**:
1. Go to Vercel/Railway dashboard
2. Add environment variables
3. Redeploy (don't just refresh)

### Issue: Chat returns error

```
Error: GEMINI_API_KEY not found
```

**Fix**:
1. Verify API key is valid
2. Check it's in environment variables
3. Check key has API quota
4. Redeploy

### Issue: Images not loading

```
Image failed to load
```

**Fix**:
1. Check Supabase `portfolio-images` bucket is PUBLIC
2. Check image URLs are correct
3. Verify storage permissions in Supabase

---

## Getting the Best Performance

### Cache Static Assets

In `next.config.js`:
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

### Enable ISR (Incremental Static Regeneration)

In API routes:
```typescript
// Cache response for 3600 seconds (1 hour)
response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
```

---

## After Deployment Success

1. ✅ Test everything works
2. ✅ Get live URL
3. ✅ Add to LinkedIn
4. ✅ Share in job applications
5. ✅ Monitor logs for errors
6. ✅ Keep code updated on GitHub

---

## Quick Reference: Commands

```bash
# Build locally to test
npm run build

# Start production server locally
npm start

# Deploy to Vercel
vercel

# Deploy to Railway (via GitHub)
# Just push to GitHub and Railway auto-deploys

# Check what's deployed
git log --oneline  # See commit history
```

---

## Recommended: Vercel (Start Here)

Because:
- ✅ Free for hobby projects
- ✅ 5-minute setup
- ✅ Auto-deploys from GitHub
- ✅ Custom domain support
- ✅ Built for Next.js
- ✅ Perfect performance

**Just follow Steps 1-5 above and you're live!** 🚀

---

## Support

**Vercel Docs**: https://vercel.com/docs  
**Railway Docs**: https://docs.railway.app  
**Next.js Deployment**: https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app

---

**Created**: February 2, 2026
