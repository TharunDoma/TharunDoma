# TharunDoma Portfolio - Technical Documentation

**Project Name**: TharunDoma AI-Powered Portfolio System  
**Version**: 1.0.0  
**Last Updated**: January 30, 2026  
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Supabase, Gemini AI, OpenAI GPT-4  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Setup Instructions](#setup-instructions)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Features](#features)
8. [AI/LLM Integration](#aillm-integration)
9. [File Structure](#file-structure)
10. [Development Workflow](#development-workflow)
11. [Deployment](#deployment)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is TharunDoma?

A **modern AI-powered portfolio system** that showcases projects and skills with interactive AI features. It's a Next.js 14 application with three distinct AI modes:

1. **Text Mode** 📝: Simple text-based portfolio updates (pattern matching)
2. **Image Mode** 🖼️: Upload images, AI analyzes and suggests optimal placement with SEO metadata
3. **Resume Mode** 📄: Upload resume (PDF/DOC/TXT), AI extracts data and auto-populates profile

### Key Features

- **Interactive AI Chat**: Ask questions about projects, experience, and skills
- **Admin Console**: Secure dashboard to manage portfolio content
- **Multimodal Processing**: Image analysis with GPT-4 Vision, document parsing
- **Session-based Conversations**: Persistent chat history grouped by session
- **Real-time Context**: AI pulls from training documents, knowledge base, and profile
- **Dark Theme UI**: Modern, responsive design (Slate-900 + Indigo accents)
- **Supabase Backend**: PostgreSQL database with Row-Level Security

### Target Users

- Individual developers/creators showcasing portfolios
- Organizations wanting to build AI-powered profile systems
- Enterprises needing document processing pipelines

---

## Architecture

### High-Level System Design

```
┌────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                          │
│  (Next.js 14 Frontend - React Components)                      │
│  - Home page                                                   │
│  - Admin console                                               │
│  - AI chat interface                                           │
└──────────────────────────┬─────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│                     NEXT.JS API LAYER                          │
│  (Server-side Route Handlers)                                  │
│  - /api/chat              (Text conversations)                 │
│  - /api/ai-multimodal     (Image/Resume processing)            │
│  - /api/admin-login       (Authentication)                     │
│  - /api/update-profile    (Profile updates)                    │
│  - /api/training          (Document upload)                    │
│  - /api/knowledge         (KB management)                      │
└──────────────────────────┬─────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐       ┌────▼─────┐      ┌────▼───┐
    │ Supabase│       │ AI APIs  │      │ Storage│
    │ Database│       │          │      │ Buckets│
    │(Tables)│       │ - Gemini │      │        │
    │        │       │ - OpenAI │      │Images  │
    └────────┘       └──────────┘      └────────┘
```

### Data Flow: Chat Request

```
1. User types message in AIAssistant.tsx
2. POST /api/chat with { message, sessionId, conversationHistory, mode }
3. API Route Execution:
   a. Verify auth (if ADMIN mode)
   b. Fetch context from Supabase:
      - training_documents (extracted resume/project text)
      - knowledge_base (achievements, skills)
      - profile (user info, visible in ADMIN mode)
      - chat_logs (previous conversations, visible in ADMIN mode)
   c. Build system prompt with context
   d. Call Gemini API with full context
   e. Parse response
   f. Log to chat_history table
   g. Return to client
4. Client displays response and updates message list
```

### Data Flow: Image Upload (Multimodal)

```
1. Admin clicks upload image in admin/page.tsx
2. POST /api/ai-multimodal with:
   - FormData containing: file, message, mode='image', secret
3. API Route Execution:
   a. Verify ADMIN_SECRET
   b. Convert file to base64 Data URL
   c. Call OpenAI GPT-4o Vision with image + prompt
   d. Parse JSON response: { description, aspectRatio, placement, altText }
   e. Upload image to Supabase Storage (portfolio-images bucket)
   f. Save metadata in portfolio_images table
   g. Return image URL and metadata
3. Admin page refreshes gallery, displays new image
```

### Data Flow: Resume Upload

```
1. Admin clicks upload resume in admin/page.tsx
2. POST /api/ai-multimodal with:
   - FormData containing: file, mode='resume', secret
3. API Route Execution:
   a. Verify ADMIN_SECRET
   b. Extract text using pdf-parse library
   c. Call OpenAI with extracted text + structured extraction prompt
   d. Parse JSON response: { bio, skills, jobTitle, experiences }
   e. Update profile table with extracted data
   f. Return success with extracted data
3. Admin sees populated profile fields
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **UI Icons**: Lucide React
- **State**: React hooks (useState, useRef, useEffect)
- **3D Graphics**: Three.js, React Three Fiber (for future avatar features)

### Backend
- **Runtime**: Node.js (via Next.js)
- **API Routes**: Next.js serverless functions
- **Session Management**: Custom session IDs (UUID-based)

### Database & Storage
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage buckets
- **Authentication**: Custom header-based + secret key
- **ORM**: Supabase JS client (direct queries)

### AI/LLM Services
- **Text Chat**: Google Gemini API (generative-ai)
- **Vision Analysis**: OpenAI GPT-4o (openai)
- **Document Parsing**: pdf-parse

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **CSS Processing**: PostCSS + Autoprefixer

---

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key (for vision features)
- Google Gemini API key (for chat)

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd TharunDoma
npm install
```

### Step 2: Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get credentials:
   - Project URL
   - Anon Key
   - Service Role Key

#### Create Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Run `supabase-setup-ai.sql` to create:
   - `training_documents`
   - `knowledge_base`
   - `chat_history`
   - `chat_logs`
   - `profile`

3. Run `supabase-setup-images.sql` to create:
   - `portfolio_images`

#### Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name: `portfolio-images`
4. Check **Public bucket**
5. Click **Create bucket**

### Step 3: Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=sk-your-openai-key

# Security
ADMIN_SECRET=your-secure-random-string
```

### Step 4: Run Development Server

```bash
npm run dev
```

Server runs at **http://localhost:3000**

### Step 5: Access Application

- **Home**: http://localhost:3000
- **Admin Console**: http://localhost:3000/admin (requires ADMIN_SECRET)
- **Projects**: http://localhost:3000/projects
- **AI Chat**: http://localhost:3000/projects/ai-chat

---

## Database Schema

### Tables Overview

```sql
training_documents
├── id (UUID, PK)
├── file_name (TEXT)
├── file_type (VARCHAR) - 'pdf', 'docx', 'image', 'text'
├── extracted_text (TEXT) - Full text extracted
├── file_size (INT)
├── category (VARCHAR) - 'resume', 'project', 'certification'
├── is_active (BOOLEAN) - Filter by this
└── created_at (TIMESTAMP)

knowledge_base
├── id (UUID, PK)
├── title (TEXT)
├── content (TEXT) - Achievement, skill, or experience
├── category (VARCHAR) - 'achievement', 'skill', 'experience'
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)

chat_history
├── id (UUID, PK)
├── user_message (TEXT)
├── ai_response (TEXT)
├── session_id (VARCHAR)
├── created_at (TIMESTAMP)
└── relevant_documents (TEXT[]) - Document IDs used

profile
├── id (UUID, PK)
├── name (TEXT)
├── bio (TEXT)
├── job_title (TEXT)
├── skills (JSONB or TEXT[])
├── profile_image (TEXT) - URL
├── background_image (TEXT) - URL
└── updated_at (TIMESTAMP)

portfolio_images
├── id (UUID, PK)
├── url (TEXT)
├── description (TEXT)
├── aspect_ratio (TEXT) - '16:9', '1:1', '4:3'
├── placement (TEXT) - 'hero', 'about', 'projects', 'gallery'
├── alt_text (TEXT) - SEO alt text
└── created_at (TIMESTAMP)

chat_logs (ADMIN only)
├── id (UUID, PK)
├── user_message (TEXT)
├── ai_response (TEXT)
├── mode (VARCHAR) - 'PUBLIC' or 'ADMIN'
├── session_id (VARCHAR)
└── created_at (TIMESTAMP)
```

### Row-Level Security (RLS) Policies

- `training_documents`: Public read if `is_active=true`, authenticated insert
- `knowledge_base`: Public read if `is_active=true`, authenticated insert
- `chat_history`: Public read/insert
- `profile`: Public read, authenticated insert
- `chat_logs`: Service role only (admin)
- `portfolio_images`: Public read/insert

---

## API Routes

### 1. POST `/api/chat`

**Purpose**: Main conversational AI endpoint

**Request**:
```json
{
  "message": "What are your projects?",
  "sessionId": "abc123",
  "conversationHistory": [],
  "mode": "PUBLIC"
}
```

**Request Headers** (if ADMIN mode):
```
Authorization: Bearer <ADMIN_SECRET>
// OR
x-admin-token: <ADMIN_SECRET>
```

**Response** (Success):
```json
{
  "success": true,
  "reply": "Here are my top projects...",
  "sessionId": "abc123"
}
```

**Response** (Error):
```json
{
  "success": false,
  "reply": "Error message here"
}
```

**Modes**:
- `PUBLIC`: Limited context (training_documents + knowledge_base)
- `ADMIN`: Full context (+ profile + chat_logs)

**AI Model**: Google Gemini (generative-ai)

**File**: [app/api/chat/route.ts](app/api/chat/route.ts)

---

### 2. POST `/api/ai-multimodal`

**Purpose**: Image/Resume analysis and processing

**Request** (FormData):
```
- secret: string (ADMIN_SECRET)
- mode: 'image' | 'resume'
- message: string (instructions, optional for resume)
- files: File[] (image files or resume)
```

**Image Mode Processing**:
1. Convert image to base64
2. Call OpenAI Vision API
3. Extract: description, aspectRatio, placement, altText
4. Upload to Supabase Storage
5. Save metadata in portfolio_images table

**Resume Mode Processing**:
1. Parse PDF/DOC/TXT with pdf-parse
2. Send extracted text to OpenAI
3. Extract: bio, skills, jobTitle, experiences
4. Update profile table

**Response** (Success):
```json
{
  "success": true,
  "reply": "Image processed successfully",
  "imageUrl": "https://...",
  "metadata": {
    "description": "...",
    "aspectRatio": "16:9",
    "placement": "hero",
    "altText": "..."
  }
}
```

**File**: [app/api/ai-multimodal/route.ts](app/api/ai-multimodal/route.ts)

---

### 3. POST `/api/admin-login`

**Purpose**: Authenticate admin users

**Request**:
```json
{
  "secret": "your-admin-secret"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": "your-admin-secret",
  "message": "Login successful!"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Invalid security key"
}
```

**File**: [app/api/admin-login/route.ts](app/api/admin-login/route.ts)

---

### 4. POST `/api/update-profile`

**Purpose**: Update profile with image/text data

**Request**:
```json
{
  "image": "data:image/png;base64,...",
  "title": "profile | background | gallery",
  "description": "Optional description",
  "imageType": "profile | background | gallery",
  "token": "admin-token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated",
  "imageId": "uuid"
}
```

**File**: [app/api/update-profile/route.ts](app/api/update-profile/route.ts)

---

### 5. POST `/api/training`

**Purpose**: Upload training documents

**Request** (FormData):
```
- file: File (PDF, DOCX, TXT)
- category: string (resume, project, certification)
- token: string (admin-token)
```

**Response**:
```json
{
  "success": true,
  "documentId": "uuid",
  "extractedText": "..."
}
```

**File**: [app/api/training/route.ts](app/api/training/route.ts)

---

### 6. POST `/api/knowledge`

**Purpose**: Add/update knowledge base entries

**Request**:
```json
{
  "title": "Achievement Title",
  "content": "Description of achievement",
  "category": "achievement | skill | experience",
  "token": "admin-token"
}
```

**Response**:
```json
{
  "success": true,
  "id": "uuid"
}
```

**File**: [app/api/knowledge/route.ts](app/api/knowledge/route.ts)

---

## Features

### 1. AI Chat Interface

**Location**: `/projects/ai-chat` or floating widget

**Component**: [app/components/AIAssistant.tsx](app/components/AIAssistant.tsx)

**Features**:
- Real-time message streaming
- Session-based conversations
- Context from training documents
- Auto-scroll to latest message
- Loading indicators
- Error handling

**How it works**:
1. User types question
2. Component sends to `/api/chat`
3. API fetches context from Supabase
4. Gemini generates response
5. Response displayed in chat
6. Logged to chat_history

---

### 2. Admin Console

**Location**: `/admin`

**Component**: [app/admin/page.tsx](app/admin/page.tsx)

**Features**:
- Secure login with ADMIN_SECRET
- Image upload (profile, background, gallery)
- Resume parsing
- Chat history viewer
- Profile field editor
- Image gallery management

**Three Sections**:
1. **Login Panel**: Enter ADMIN_SECRET
2. **Image Management**: Upload + manage portfolio images
3. **Chat Console**: View admin chat logs

---

### 3. Multimodal Processing

**Image Mode**:
- Upload images
- AI suggests aspect ratio & placement
- Auto-upload to Supabase Storage
- Generate SEO alt text

**Resume Mode**:
- Upload PDF/DOC/TXT
- AI extracts: bio, skills, job title, experiences
- Auto-populate profile fields
- Store extracted data

---

### 4. Knowledge Base System

**Purpose**: Store achievements, skills, experiences

**Used by**: Chat API to provide context

**Data Model**:
```typescript
{
  id: UUID,
  title: string,
  content: string,
  category: 'achievement' | 'skill' | 'experience',
  is_active: boolean
}
```

**Example**:
```json
{
  "title": "Built AI Portfolio System",
  "content": "Created Next.js app with Gemini AI integration...",
  "category": "achievement"
}
```

---

### 5. Training Documents

**Purpose**: Store extracted text from PDFs/resumes/projects

**Used by**: Chat API as context for answers

**Data Model**:
```typescript
{
  id: UUID,
  file_name: string,
  file_type: 'pdf' | 'docx' | 'text',
  extracted_text: string,
  category: 'resume' | 'project' | 'certification',
  is_active: boolean
}
```

---

### 6. Session Management

**Purpose**: Group related messages together

**Implementation**:
```typescript
const [sessionId] = useState(Math.random().toString(36).substring(7))
// Sent with every message to /api/chat
```

**Benefits**:
- Track conversation flow
- Allow context from earlier in conversation
- Enable conversation replay/history

---

## AI/LLM Integration

### Gemini API (Text Chat)

**Provider**: Google Generative AI

**Model**: `gemini-pro` (or latest)

**Setup**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
```

**Usage** (in `/api/chat`):
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-pro" })
const chat = model.startChat({
  history: formattedHistory,
  generationConfig: { maxOutputTokens: 2048 }
})

const result = await chat.sendMessage(systemPrompt)
const text = result.response.text()
```

**Cost**: Free tier available, pay-as-you-go after

**Context Injection**:
```typescript
const systemPrompt = `You are a portfolio assistant.
Here's context about the person:
${trainingDocs}
${knowledgeBase}
${profileData}

User question: ${userMessage}`
```

---

### OpenAI GPT-4 Vision (Image Analysis)

**Provider**: OpenAI

**Model**: `gpt-4o` (latest multimodal)

**Setup**:
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
```

**Image Analysis** (in `/api/ai-multimodal`):
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      {
        type: "text",
        text: "Analyze this image for a portfolio website..."
      },
      {
        type: "image_url",
        image_url: { url: dataUrl }
      }
    ]
  }]
})
```

**Cost**: ~$0.01-0.02 per image analysis

**JSON Output**:
```json
{
  "description": "Professional headshot",
  "aspectRatio": "1:1",
  "placement": "about",
  "altText": "Professional headshot of a developer"
}
```

---

### Document Parsing (pdf-parse)

**Purpose**: Extract text from PDF/DOC/TXT files

**Setup**:
```typescript
import pdf from 'pdf-parse'

const pdfBuffer = await file.arrayBuffer()
const data = await pdf(Buffer.from(pdfBuffer))
const text = data.text
```

**Output**: Plain text extracted from document

**Then**: Sent to OpenAI for structured extraction

---

## File Structure

```
TharunDoma/
├── app/
│   ├── api/                          # API Routes (serverless functions)
│   │   ├── chat/route.ts             # Main chat endpoint (Gemini)
│   │   ├── ai-multimodal/route.ts    # Image/Resume processing (GPT-4o)
│   │   ├── admin-login/route.ts      # Admin authentication
│   │   ├── update-profile/route.ts   # Profile updates
│   │   ├── training/route.ts         # Document uploads
│   │   ├── knowledge/route.ts        # Knowledge base management
│   │   └── process-training-docs/route.ts
│   │
│   ├── components/                   # Reusable React components
│   │   ├── AIAssistant.tsx           # Chat interface component
│   │   ├── FloatingAIWidget.tsx      # Floating chat widget
│   │   ├── Avatar3D.tsx              # 3D avatar (Three.js)
│   │   ├── GLBAvatar.tsx             # GLB model loader
│   │   ├── GLBAvatarWrapper.tsx      # Avatar wrapper
│   │   ├── ImageGallery.tsx          # Image gallery
│   │   ├── Navbar.tsx                # Navigation bar
│   │   └── Footer.tsx                # Footer
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── supabaseClient.ts         # Client-side Supabase (anon key)
│   │   └── supabaseServer.ts         # Server-side Supabase (service role)
│   │
│   ├── admin/                        # Admin console page
│   │   └── page.tsx
│   │
│   ├── ai-chat/                      # Chat page
│   │   └── page.tsx
│   │
│   ├── dashboard/                    # Dashboard page
│   │   └── page.tsx
│   │
│   ├── projects/                     # Projects showcase
│   │   ├── page.tsx
│   │   └── ai-chat/page.tsx
│   │
│   ├── page.tsx                      # Home/landing page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── components/                       # Global components
│   ├── Navbar.tsx
│   └── Footer.tsx
│
├── .github/
│   └── copilot-instructions.md      # AI agent instructions
│
├── public/                           # Static assets
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
│
├── .env.local                        # Environment variables (LOCAL ONLY)
├── .gitignore                        # Git ignore rules
│
├── supabase-setup-ai.sql             # Database table creation
├── supabase-setup-images.sql         # Image table creation
├── supabase-setup-gallery.sql        # Gallery schema
├── supabase-setup-profile-images.sql # Profile images schema
│
├── README.md                         # Project overview
└── MULTIMODAL-README.md              # Multimodal features guide
```

---

## Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# Run in watch mode for hot reload
# Auto-reload on file changes
```

### Building for Production

```bash
# Build
npm run build

# This creates:
# - .next/ folder (optimized bundles)
# - Server-side components compiled
# - Client-side bundles minified

# Start production server
npm start
```

### Linting & Code Quality

```bash
# Run ESLint
npm run lint

# Fix formatting
npm run lint -- --fix
```

### Adding a New API Route

1. Create `app/api/new-feature/route.ts`
2. Export `POST`, `GET`, `PUT`, etc. functions
3. Use Supabase clients from `app/lib/`
4. Implement proper error handling
5. Test with curl or Postman

**Example**:
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Process request
    const result = await supabase.from('table').insert(data)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

### Adding a New Component

1. Create `app/components/NewComponent.tsx`
2. Add `'use client'` if interactive
3. Export default component
4. Use in pages

**Example**:
```typescript
'use client'

import { useState } from 'react'

export default function NewComponent() {
  const [state, setState] = useState('')
  
  return (
    <div className="...">
      {/* Component UI */}
    </div>
  )
}
```

---

## Deployment

### Hosting Options

#### 1. Vercel (Recommended)

**Easiest for Next.js**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to connect GitHub repo
```

**Features**:
- Automatic deployments from GitHub
- Built-in Next.js optimization
- Edge Functions support
- Free tier available

**Environment Variables**:
1. Go to Vercel project settings
2. Add all `.env.local` variables
3. Redeploy

**Cost**: Free tier for hobby projects

---

#### 2. Railway

**Easy deployment**

1. Push to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables
4. Deploy

**Cost**: Pay-as-you-go ($5-20/month typical)

---

#### 3. Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t tharundoma .
docker run -p 3000:3000 tharundoma
```

---

### Pre-deployment Checklist

- [ ] All environment variables set
- [ ] Supabase tables created (all 6 tables)
- [ ] Storage bucket created and public
- [ ] API keys valid and have quota
- [ ] No hardcoded secrets in code
- [ ] TypeScript builds without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] `.env.local` in `.gitignore`

---

## Common Tasks

### Task: Add New Training Document Type

1. **Update database**:
   ```sql
   -- In supabase-setup-ai.sql
   -- Add new value to category enum or update INSERT logic
   ```

2. **Update `/api/training` route**:
   ```typescript
   const category = validateCategory(req.body.category)
   // Handle new type
   ```

3. **Update chat context** in `/api/chat`:
   ```typescript
   // Add filter for new category
   const docs = await supabase
     .from('training_documents')
     .select('*')
     .eq('is_active', true)
     .in('category', ['resume', 'project', 'new-type'])
   ```

### Task: Change AI Models

**Text Chat**:
```typescript
// In /api/chat/route.ts
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
// Options: gemini-pro, gemini-1.5-pro, gemini-1.5-flash
```

**Vision**:
```typescript
// In /api/ai-multimodal/route.ts
model: "gpt-4o"  // or gpt-4-vision, gpt-4-turbo-vision
```

### Task: Add New Admin Feature

1. **Create API route**: `app/api/new-feature/route.ts`
2. **Check ADMIN_SECRET**:
   ```typescript
   const secret = req.headers.get('authorization')?.replace('Bearer ', '')
   if (secret !== process.env.ADMIN_SECRET) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```
3. **Add UI** in `app/admin/page.tsx`
4. **Call API from admin page**

### Task: Optimize API Response Time

**Current bottleneck**: Multiple Supabase queries

**Solution**: Parallel queries with `Promise.all()`
```typescript
const [docs, kb, profile] = await Promise.all([
  supabase.from('training_documents').select(...),
  supabase.from('knowledge_base').select(...),
  supabase.from('profile').select(...)
])
```

### Task: Add Rate Limiting

Use middleware:
```typescript
// middleware.ts at root
import { NextResponse } from 'next/server'

const rateLimit = new Map()

export function middleware(request: Request) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  
  // Simple rate limiting logic
  const lastRequest = rateLimit.get(ip) || 0
  if (now - lastRequest < 1000) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  rateLimit.set(ip, now)
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
```

---

## Troubleshooting

### Issue: "SUPABASE_URL is not defined"

**Cause**: Missing environment variables

**Fix**:
```bash
# Check .env.local exists and has:
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_URL=...
```

**Note**: `NEXT_PUBLIC_*` variables are exposed to client. `SUPABASE_*` are server-only.

---

### Issue: Chat API returns empty response

**Cause**: No training documents or knowledge base entries

**Fix**:
1. Add entries to `knowledge_base` table
2. Upload documents to `training_documents` table
3. Ensure `is_active = true` for all entries

**Check**:
```bash
# Query in Supabase SQL Editor
SELECT * FROM knowledge_base WHERE is_active = true;
SELECT * FROM training_documents WHERE is_active = true;
```

---

### Issue: Image upload fails with "Access Denied"

**Cause**: Wrong ADMIN_SECRET or missing secret

**Fix**:
1. Verify `ADMIN_SECRET` matches in:
   - API route check
   - Admin page login
   - FormData submission

2. Check Supabase Storage permissions:
   - `portfolio-images` bucket should be PUBLIC
   - RLS policy allows public insert

---

### Issue: "TypeError: Cannot read property 'text' of undefined"

**Cause**: Gemini API returned no response

**Fix**:
1. Check GEMINI_API_KEY is valid
2. Verify API key has usage quota
3. Check message length (too long = error)
4. Add error logging:
   ```typescript
   console.log('Gemini response:', result)
   if (!result?.response?.text()) {
     throw new Error('No text in response')
   }
   ```

---

### Issue: "CORS error" on image upload

**Cause**: Supabase Storage CORS not configured

**Fix**:
1. Go to Supabase Storage settings
2. Add CORS origin: `http://localhost:3000` (dev)
3. Add production origin: `https://yourdomain.com`

---

### Issue: Long response times (>10s)

**Cause**: Slow Supabase queries or large context

**Fix**:
1. Add database indexes:
   ```sql
   CREATE INDEX idx_is_active ON training_documents(is_active);
   CREATE INDEX idx_category ON training_documents(category);
   ```

2. Limit context size:
   ```typescript
   .select('id, extracted_text')  // Only needed columns
   .limit(5)  // Top 5 most relevant
   ```

3. Cache responses:
   ```typescript
   // Add Redis or simple in-memory cache
   ```

---

## Contributors Guide

### Before Contributing

1. Read this document
2. Understand the architecture section
3. Review the relevant API route
4. Check for similar implementations

### Making Changes

1. Create feature branch: `git checkout -b feature/your-feature`
2. Follow TypeScript best practices
3. Add error handling
4. Test locally
5. Update documentation
6. Create pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (configured)
- **ESLint**: No errors allowed
- **Components**: Use `'use client'` for interactivity
- **API routes**: Always validate input and auth

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [OpenAI API](https://platform.openai.com/docs)

### Community
- GitHub Issues (for bugs)
- GitHub Discussions (for questions)
- Discord/Slack (if applicable)

---

## License

[Your License Here]

---

**Last Updated**: January 30, 2026  
**Maintainer**: Tharun Doma  
**Version**: 1.0.0
