import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Use anon for public fetches; service role for trusted server-side actions
const supabaseAnon = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

export async function POST(req: Request) {
  try {
    const { message, sessionId, conversationHistory = [], mode = 'PUBLIC' } = await req.json();

    const isAdminMode = mode === 'ADMIN';

    if (isAdminMode) {
      const token = req.headers.get('x-admin-token') || req.headers.get('authorization');
      if (!token || token.replace('Bearer ', '').trim() !== (ADMIN_SECRET || '')) {
        return NextResponse.json({ success: false, reply: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        reply: 'Please ask me something!'
      });
    }

    // 1. Fetch all training documents, knowledge base, and profile status
    const [docsResult, kbResult, profileResult, logsResult] = await Promise.all([
      supabaseAnon
        .from('training_documents')
        .select('id, extracted_text, file_name, category')
        .eq('is_active', true),
      supabaseAnon
        .from('knowledge_base')
        .select('content, category')
        .eq('is_active', true),
      supabaseAdmin
        .from('profile')
        .select('*')
        .limit(1)
        .maybeSingle(),
      isAdminMode
        ? supabaseAdmin
            .from('chat_logs')
            .select('id, user_message, ai_response, created_at, mode, session_id')
            .order('created_at', { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [] })
    ]);

    const documents = docsResult.data || [];
    const knowledgeBase = kbResult.data || [];
    const profile = profileResult?.data || null;
    const recentLogs = (logsResult as any).data || [];

    // 2. Build context from documents
    const profileStatusText = buildProfileStatusInstruction(profile, isAdminMode);

    let context = isAdminMode
      ? `You are Tharun's Personal Operations Manager. You help Tharun by answering operational questions, summarizing recruiter conversations, and updating his profile status when instructed.

## Tools you may use:
- Read chat_logs (last 50 entries provided)
- Update profile by emitting an action line: ACTION: UPDATE_PROFILE {"status":"...","current_location":"...","private_notes":"..."}
  - Only emit fields that should change
  - Keep your human-facing answer separate from the action line

## Admin Access:
- You may reference private notes below and summarize recruiter conversations.
- Keep responses concise and actionable for Tharun.
${profileStatusText}
` : `You are Tharun Doma's AI Assistant. Your role is to represent Tharun Doma professionally and help visitors (recruiters, potential clients, or anyone interested) learn about him, his capabilities, and his work.

## Who You Are:
- Tharun Doma's intelligent assistant, built by Tharun himself
- This entire portfolio website was designed and built by Tharun from scratch
- You showcase Tharun's skills, experience, projects, and what he can deliver

## How to Respond:
- When someone asks about "you/your", you're speaking about Tharun Doma
- Be confident, professional, and personable
- Highlight what Tharun can do and deliver
- Mention relevant projects he's built
- Show enthusiasm about his capabilities and growth
- Be helpful for recruiters conducting mini-interviews
- Share both technical and soft skills
- Mention that Tharun built this AI assistant and website

## Tharun's Information:
`;

    // Add document content with better context
    if (documents.length > 0) {
      context += '### Career & Professional Background:\n';
      documents.forEach((doc: any) => {
        if (doc.extracted_text && doc.extracted_text.length > 0) {
          // Remove placeholder text
          let text = doc.extracted_text
            .replace(/^PDF:.*?\[.*?\]/, '')
            .replace(/^Word Document:.*?\[.*?\]/, '')
            .trim();
          if (text) {
            context += `${text}\n\n`;
          }
        }
      });
    }

    // Add knowledge base content
    if (knowledgeBase.length > 0) {
      context += '### Key Achievements & Highlights:\n';
      knowledgeBase.forEach((item: any) => {
        context += `✓ ${item.content}\n`;
      });
      context += '\n';
    }

    context += `### About This Portfolio:
- Built entirely by Tharun Doma using modern web technologies
- Features an AI assistant (me!) that you're currently talking to
- Designed to be interactive and showcase Tharun's capabilities
- Demonstrates full-stack development skills

## Your Role:
1. Answer questions about Tharun's background, skills, and experience
2. Help visitors understand what Tharun can do
3. Be conversational and professional - suitable for recruiter interactions
4. Share insights from his resume and projects
5. Highlight both his technical expertise and soft skills
6. Mention this website and AI as examples of what he can build
7. If asked something not in the data, be honest but suggest talking directly to Tharun
8. Keep responses concise but informative
9. Encourage visitors to explore his projects or reach out

## Tone:
- Professional but approachable
- Confident about Tharun's abilities
- Friendly and engaging
- Honest and transparent

${profileStatusText}`;

    // 3. Build conversation history for context
    const conversationContext = (conversationHistory || [])
      .map(
        (msg: any) =>
          `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      )
      .join('\n');

    // Add admin-only recent logs for context
    let adminLogContext = '';
    if (isAdminMode && recentLogs.length > 0) {
      adminLogContext = '\n\nRecent recruiter chats (newest first):\n';
      recentLogs.forEach((log: any) => {
        adminLogContext += `- [${log.created_at}] User: ${log.user_message} | AI: ${log.ai_response}\n`;
      });
    }

    const fullPrompt = `${context}${adminLogContext}\n\nConversation:\n${conversationContext}\n\nUser: ${message}\n\nAssistant:`;

    // 4. Call Gemini API using SDK (try supported models)
    const modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash'];
    let lastError: any = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        let aiReply = response.text() || 'Sorry, I could not generate a response.';

        // Admin mode: detect and execute profile update actions
        if (isAdminMode) {
          const actionMatch = aiReply.match(/ACTION:\s*UPDATE_PROFILE\s*(\{.*\})/i);
          if (actionMatch) {
            try {
              const payload = JSON.parse(actionMatch[1]);
              await supabaseAdmin.from('profile').upsert({
                id: profile?.id || '00000000-0000-0000-0000-000000000001',
                ...payload,
                last_updated: new Date().toISOString()
              });
              aiReply = aiReply.replace(actionMatch[0], '').trim();
            } catch (parseErr) {
              console.error('Failed to apply profile update action', parseErr);
            }
          }
        }

        // Save to chat logs for PUBLIC (and optionally for admin audit)
        await supabaseAdmin.from('chat_logs').insert({
          user_message: message,
          ai_response: aiReply,
          session_id: sessionId,
          mode,
          relevant_documents: documents.map((d: any) => d.id)
        });

        return NextResponse.json({
          success: true,
          reply: aiReply
        });
      } catch (err) {
        lastError = err;
        continue; // try next model
      }
    }

    console.error('Gemini Error (all models failed):', lastError);
    return await getFallbackResponse(message, documents, knowledgeBase);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      success: false,
      reply: 'Error processing your request. Please try again.'
    });
  }
}

// Fallback: Simple text search when AI is unavailable
async function getFallbackResponse(message: string, documents: any[], knowledgeBase: any[]) {
  const query = message.toLowerCase();

  // Utility: score text by keyword overlap
  const keywords = ['tharun', 'experience', 'project', 'skill', 'education', 'work', 'role', 'responsibilities', 'achievement'];
  const scoreText = (text: string) => {
    const t = text.toLowerCase();
    return keywords.reduce((acc, k) => acc + (t.includes(k) ? 1 : 0), 0) + Math.min(Math.floor(t.length / 500), 3);
  };

  // Normalize placeholder removal
  const cleanText = (t: string) => t
    .replace(/^PDF:.*?\[.*?\]/, '')
    .replace(/^Word Document:.*?\[.*?\]/, '')
    .trim();

  // Rank documents by relevance
  const rankedDocs = (documents || [])
    .filter((d: any) => d.extracted_text && d.extracted_text.length > 0)
    .map((d: any) => ({
      file_name: d.file_name,
      text: cleanText(d.extracted_text),
      score: scoreText(d.extracted_text) + (d.extracted_text.toLowerCase().includes(query) ? 2 : 0)
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3);

  // Build highlights from documents
  const extractHighlights = (text: string) => {
    const sentences = text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 40);
    const picks: string[] = [];
    for (const s of sentences) {
      if (picks.length >= 4) break;
      if (keywords.some(k => s.toLowerCase().includes(k))) picks.push(s);
    }
    // Fallback to first 3 sentences
    if (picks.length === 0) return sentences.slice(0, 3);
    return picks;
  };

  const docSections = rankedDocs.map((d: any) => {
    const highlights = extractHighlights(d.text).join(' ');
    return `• From ${d.file_name}: ${highlights}`;
  });

  // Knowledge base additions (top 3)
  const kbItems = (knowledgeBase || [])
    .map((k: any) => k.content)
    .slice(0, 3)
    .map((c: string) => `• ${c}`);

  // Compose professional answer
  const header = `I am Tharun Doma's AI assistant. Here's a concise professional summary based on the available training data:`;
  const bodyParts = [...docSections, ...kbItems];

  if (bodyParts.length > 0) {
    const reply = `${header}\n${bodyParts.join('\n')}\n\nIf you have specific questions about Tharun's skills, projects, roles, or education, ask away and I'll tailor the details.`;
    return NextResponse.json({ success: true, reply });
  }

  // If absolutely no data, provide a polite Tharun-centric fallback
  const reply = `I am Tharun Doma's AI assistant. I don't have detailed training data loaded yet. You can upload resumes, achievements, and project docs in the admin panel; once processed, I'll answer professionally and in detail.`;
  return NextResponse.json({ success: true, reply });
}

// Build dynamic status instructions for system prompt
function buildProfileStatusInstruction(profile: any, isAdminMode: boolean): string {
  if (!profile) return '';
  const { status, current_location, last_updated, private_notes, return_date } = profile;
  let statusLine = '';
  if (status === 'AWAY') {
    statusLine = `Status: AWAY. If anyone asks for availability, state that Tharun is currently away${return_date ? ` until ${return_date}` : ''} and will respond when back.`;
  } else if (status === 'HIRED') {
    statusLine = 'Status: HIRED. Politely decline new job offers while remaining professional.';
  } else if (status === 'JOB_HUNTING') {
    statusLine = 'Status: JOB_HUNTING. Engage positively with recruiters and express interest in opportunities.';
  }

  const locationLine = current_location ? `Current location: ${current_location}.` : '';
  const updatedLine = last_updated ? `Last updated: ${last_updated}.` : '';
  const privateLine = isAdminMode && private_notes ? `Private notes: ${private_notes}.` : '';

  const lines = [statusLine, locationLine, updatedLine, privateLine].filter(Boolean);
  if (lines.length === 0) return '';
  return `\n## Dynamic Status\n${lines.join('\n')}`;
}
