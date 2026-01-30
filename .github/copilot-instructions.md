# AI Copilot Instructions - TharunDoma Portfolio

## Architecture Overview

This is a **Next.js 14 AI-powered portfolio system** with three AI interaction modes:

### Key Components
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (dark slate-900 theme)
- **Backend**: Next.js API routes (serverless functions)
- **Database**: Supabase (PostgreSQL) for knowledge base, training documents, and chat history
- **Storage**: Supabase Storage buckets for images (`portfolio-images`)
- **AI Services**: 
  - **Gemini API** (Google Generative AI) for text-based chat
  - **OpenAI GPT-4 Vision** for multimodal image/resume analysis
  - **Pattern matching** for simple text mode updates

### Data Flow Architecture
1. **Public Chat Mode**: User question → Fetch training_documents + knowledge_base → Gemini API context → Response logged to chat_history
2. **Admin Mode**: Same flow but with access to profile data and chat logs for debugging
3. **Multimodal Mode**: File upload → OpenAI Vision (image mode) or pdf-parse (resume mode) → Supabase Storage upload → Profile updates

### Critical Tables
- `training_documents`: Extracted text from PDFs/docs (resume, projects, certifications)
- `knowledge_base`: Manual achievements, skills, experiences (is_active filtering required)
- `chat_history`: Session-based conversation logs
- `portfolio_images`: Image metadata (aspect ratio, placement, alt text, URL)
- `profile`: User profile data (only visible to admin)
- `chat_logs`: Admin-only detailed logs with user_message, ai_response, mode, session_id

## Developer Workflows

### Build & Run
```bash
npm run dev          # Local dev server (port 3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint check
```

### Database Setup
1. Run `supabase-setup-ai.sql` to create training_documents, chat_history, knowledge_base tables
2. Run `supabase-setup-images.sql` to create portfolio_images table
3. Create Supabase Storage bucket named `portfolio-images` (public)
4. Set environment variables: `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...              # For chat API
OPENAI_API_KEY=...              # For vision/multimodal
ADMIN_SECRET=...                # Shared secret for admin endpoints
```

## Project-Specific Patterns

### API Route Authorization
- **Admin endpoints** (`/api/ai-multimodal`, `/api/update-profile`) verify `ADMIN_SECRET` via:
  - FormData `secret` field (multimodal) OR
  - Header `x-admin-token` or `Authorization: Bearer` (chat)
- **Public endpoints** (`/api/chat` with `mode='PUBLIC'`) require no auth but return filtered data

### Supabase Client Strategy
- `supabaseClient.ts`: ANON key (client-side, public reads only)
- `supabaseServer.ts`: SERVICE_ROLE key (server-side, admin writes/sensitive reads)
- Chat API uses both: anon for training_documents fetch, service role for profile + chat_logs

### Component Conventions
- Use `'use client'` directive for interactive components (forms, modals, file uploads)
- Messages interface: `{ id, type: 'user'|'ai', content, timestamp }`
- File-to-DataURL pattern: Convert files to base64 for OpenAI Vision API

### AI Prompt Patterns
- **Vision prompts**: Request JSON output with structured fields (description, aspectRatio, placement, altText)
- **Chat prompts**: Provide context from multiple Supabase tables, include admin logs in ADMIN mode
- **Resume analysis**: Extract to JSON with profile fields (bio, skills, jobTitle, experiences)

## Key Files & Examples

| File | Purpose |
|------|---------|
| [app/api/chat/route.ts](../app/api/chat/route.ts) | Main conversation engine with Gemini |
| [app/api/ai-multimodal/route.ts](../app/api/ai-multimodal/route.ts) | Vision/resume processing (OpenAI) |
| [app/admin/page.tsx](../app/admin/page.tsx) | Admin console (login + image management) |
| [app/components/AIAssistant.tsx](../app/components/AIAssistant.tsx) | Chat UI component |
| [app/lib/supabaseClient.ts](../app/lib/supabaseClient.ts) | Client-side Supabase |
| [supabase-setup-ai.sql](../supabase-setup-ai.sql) | Core table schemas |

## Common Tasks

**Add new training document type**: 
1. Update category enum in training_documents table
2. Add handling in `/api/process-training-docs` route
3. Include in chat context fetch (see chat/route.ts lines 40-48)

**Update admin chat features**: 
1. Modify `/api/chat` with new admin mode checks
2. Update admin page to call new endpoint with auth header
3. Remember to fetch and display chat_logs in ADMIN mode

**Change AI model**: 
- Text: Edit `genAI.startChat()` in chat/route.ts (currently Gemini)
- Vision: Edit `openai.chat.completions.create()` in ai-multimodal/route.ts (currently GPT-4o)

**Add image optimization**: 
- Update image upload handler in ai-multimodal/route.ts
- Store metadata in portfolio_images table
- Reference in admin page gallery rendering
