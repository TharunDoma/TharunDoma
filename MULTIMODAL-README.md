# AI Multimodal Portfolio Admin System

## 🚀 Features

Your portfolio now has **3 powerful AI modes**:

### 1. **Text Mode** 📝
Simple text-based updates using pattern matching.
- "Change my name to John Doe"
- "Update my job title to Senior Developer"

### 2. **Image Mode** 🖼️
Upload images and let AI:
- Analyze the image content
- Suggest optimal aspect ratio (16:9, 1:1, 4:3, etc.)
- Recommend best placement (hero, about, projects, gallery)
- Generate SEO-friendly alt text
- Auto-upload to Supabase storage
- Optimize for web

### 3. **Resume Mode** 📄
Upload your resume (PDF, DOC, TXT) and AI will:
- Extract all key information
- Generate professional "About Me" bio
- Extract skills and experiences
- Suggest job title
- Auto-populate your profile fields
- Extract project descriptions

## 📋 Setup Instructions

### Step 1: Set up Supabase Storage

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **"New Bucket"**
5. Name it: `portfolio-images`
6. ✅ Check **"Public bucket"** (important!)
7. Click **"Create bucket"**

### Step 2: Run the SQL Script

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `supabase-setup-images.sql`
4. Paste and click **"Run"**

This creates the `portfolio_images` table to store image metadata.

### Step 3: Get OpenAI API Key

Since you need multimodal AI (vision + document analysis), you'll need OpenAI:

1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to **API Keys**
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
6. **Add billing**: Go to https://platform.openai.com/account/billing
   - Add payment method (required even for pay-as-you-go)
   - OpenAI charges ~$0.01 per image analysis
   - Resume analysis: ~$0.02-0.05 per document

### Step 4: Update `.env.local`

Add your OpenAI key to your `.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
```

### Step 5: Restart the Server

```bash
npm run dev
```

## 🎯 How to Use

### Access Admin Panel
Go to: `http://localhost:3000/admin`

### Text Updates
1. Click **Text Update** tab
2. Enter security code
3. Type command: "Change my name to Tharun Doma"
4. Click **Execute with AI**

### Upload Images
1. Click **Upload Image** tab
2. Enter security code
3. Click **Choose Files** and select image(s)
4. Add instructions: "Add this as my profile photo and optimize it"
5. Click **Execute with AI**

**AI will:**
- Analyze the image
- Suggest aspect ratio
- Recommend placement
- Upload to Supabase
- Return public URL

### Analyze Resume
1. Click **Analyze Resume** tab  
2. Enter security code
3. Upload your resume (PDF/DOC/TXT)
4. Add instructions: "Generate my about section from this resume"
5. Click **Execute with AI**

**AI will:**
- Extract your name, title, skills
- Generate professional bio
- Auto-update your profile
- Extract projects and experiences

## 💡 Example Use Cases

### Scenario 1: New Portfolio Setup
1. Upload resume → AI generates all profile text
2. Upload profile photo → AI optimizes and places it
3. Upload project screenshots → AI categorizes them
4. Done! Portfolio is populated automatically

### Scenario 2: Quick Updates
1. Text mode: "Update my job title to Senior Engineer"
2. Done in seconds!

### Scenario 3: Add Project Images
1. Upload 5 project screenshots
2. AI analyzes each one
3. Suggests: "Project 1: 16:9 ratio, Projects section"
4. Auto-uploads to Supabase
5. Returns URLs for your components

## 🔧 Technical Details

### API Routes
- `/api/update-profile` - Text-based updates (pattern matching)
- `/api/ai-multimodal` - Image & document analysis (OpenAI Vision + Assistants)

### AI Models Used
- **GPT-4o**: Multimodal (text + vision)
- **Assistants API**: Document extraction from PDFs

### Storage
- **Supabase Storage**: Image hosting (public URLs)
- **Supabase Database**: Image metadata, profile data

### Cost Estimate
- Text updates: FREE (no AI)
- Image analysis: ~$0.01 per image
- Resume analysis: ~$0.02-0.05 per document
- Storage: FREE up to 1GB (Supabase free tier)

## 🚨 Troubleshooting

### "Access Denied"
- Check your `ADMIN_SECRET` in `.env.local`
- Make sure you're entering the correct security code

### "Storage bucket not found"
- Create the `portfolio-images` bucket in Supabase
- Make sure it's PUBLIC

### "OpenAI API Error"
- Check your OpenAI API key is valid
- Verify billing is set up
- Check you have credits available

### "Model not found"
- Make sure you're using OpenAI (not Gemini/Grok)
- The code uses `gpt-4o` which is available with billing

## 📊 Database Schema

### `profile` table (existing)
```sql
section_name: 'full_name' | 'job_title' | 'hero_headline' | 'about_bio'
content: TEXT
```

### `portfolio_images` table (new)
```sql
id: UUID
url: TEXT (Supabase storage URL)
description: TEXT (AI-generated)
aspect_ratio: TEXT (e.g., "16:9")
placement: TEXT (e.g., "hero")
alt_text: TEXT (SEO-friendly)
created_at: TIMESTAMP
```

## 🎨 Next Steps

1. **Fetch Images in Frontend**: Query `portfolio_images` table
2. **Display Dynamic Images**: Use the stored URLs
3. **Auto-resize**: Apply AI-suggested aspect ratios
4. **Gallery Component**: Show all uploaded images
5. **Project Cards**: Link images to project descriptions

---

**Built with:**
- Next.js 14
- Supabase (Database + Storage)
- OpenAI GPT-4o (Vision + Assistants)
- TypeScript
- Tailwind CSS

Enjoy your AI-powered portfolio admin! 🚀
