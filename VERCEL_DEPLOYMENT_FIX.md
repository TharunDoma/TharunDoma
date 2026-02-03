# Fix Vercel Deployment - Show Latest Project Updates

## Problem
- ✅ Code is deployed to Vercel
- ❌ Shows generic placeholder projects instead of real database projects
- ❌ Missing environment variables causing database connection failure

## Solution: Configure Environment Variables in Vercel

### Step 1: Get Your Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Click "Reveal" to see it

### Step 2: Add Environment Variables to Vercel
1. Go to https://vercel.com/dashboard
2. Click on your **tharun-doma** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (one by one):

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Supabase → Settings → API → service_role (Reveal) |
| `ADMIN_SECRET` | Your admin password | Choose a strong password (e.g., `MySecureAdmin2026!`) |
| `GEMINI_API_KEY` | Your Google Gemini API key | https://makersuite.google.com/app/apikey |
| `OPENAI_API_KEY` | Your OpenAI API key | https://platform.openai.com/api-keys |

**Important**: Make sure to apply these variables to **Production, Preview, and Development** environments (check all 3 boxes).

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **3 dots (...)** next to the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### Step 4: Verify Database Setup
Make sure you've run all the SQL commands from UPDATES.md in your Supabase SQL Editor:

```sql
-- 1. Add image_url column
ALTER TABLE portfolio_images 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT NOT NULL,
  demo_url TEXT,
  github_url TEXT,
  is_deployed BOOLEAN DEFAULT FALSE,
  deploy_status TEXT DEFAULT 'Coming Soon',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_is_deployed ON projects(is_deployed);

-- 4. Create storage bucket policies (if not done)
-- Go to Supabase Dashboard → Storage → Create bucket named "portfolio" (public)
```

### Step 5: Add Projects via Admin Console
1. Visit https://tharun-doma.vercel.app/admin
2. Enter your ADMIN_SECRET password
3. Go to **Projects Management** section
4. Click **Add New Project**
5. Fill in your project details:
   - **EV Analysis & Virtual Assistant**
   - Description: Interactive Streamlit application...
   - Tech Stack: Streamlit, Python, Pandas, ML, NLP, Plotly
   - Demo URL: https://gp84ldgpxiqzz92ttodcpw.streamlit.app/
   - Status: Live
6. Click **Save Project**

### Step 6: Test Your Live Site
1. Visit https://tharun-doma.vercel.app/
2. You should see your real projects from the database
3. Test the AI chat at https://tharun-doma.vercel.app/ai-chat
4. Check admin console at https://tharun-doma.vercel.app/admin

## Troubleshooting

### If projects still don't show:
1. Check browser console for errors (F12 → Console tab)
2. Verify environment variables are set correctly in Vercel
3. Check Supabase logs: Supabase Dashboard → Logs
4. Ensure RLS policies allow public SELECT on projects table:
   ```sql
   CREATE POLICY "Public read projects" ON projects
     FOR SELECT USING (true);
   ```

### If images don't load:
1. Create "portfolio" storage bucket in Supabase (Settings → Storage)
2. Make it public
3. Add RLS policies from UPDATES.md

### If AI chat doesn't work:
1. Verify GEMINI_API_KEY is set in Vercel
2. Check OpenAI API key for multimodal features
3. Ensure you have credits in your Google AI / OpenAI accounts

## Expected Result
After completing these steps, your site will show:
- ✅ Real projects from Supabase database
- ✅ Working AI chat assistant
- ✅ Admin console with project management
- ✅ Image uploads to Supabase Storage
- ✅ All latest features from your codebase

## Quick Reference Links
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Your Live Site**: https://tharun-doma.vercel.app/
- **Admin Console**: https://tharun-doma.vercel.app/admin
- **AI Chat**: https://tharun-doma.vercel.app/ai-chat
