import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { semanticSearch } from '../../lib/embeddings';
import { getStatusContext } from '../../lib/statusInference';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
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

    // Fetch context data
    const [kbResult, profileResult] = await Promise.all([
      supabaseAnon
        .from('knowledge_base')
        .select('title, content, category')
        .eq('is_active', true)
        .limit(20),
      supabaseAdmin.from('profile').select('*').limit(1).maybeSingle()
    ]);

    const knowledgeBase = kbResult.data || [];
    const profile = profileResult?.data || null;

    // RAG: Semantic search for relevant documents
    const relevantDocs = await semanticSearch(message, 5);
    
    // Get current status
    const statusContext = await getStatusContext();

    // Build system prompt
    let systemPrompt = isAdminMode
      ? `You are Tharun's Personal Operations Manager. Help him manage status, updates, and interactions.

## Current Status:
${statusContext}

## Knowledge Base:
${knowledgeBase
  .slice(0, 5)
  .map((kb: any) => `- ${kb.title}: ${kb.content.substring(0, 100)}...`)
  .join('\n')}

## Admin Tools:
- Update profile status: acknowledge requests like "I'm going out for 3 days"
- When user says they're going somewhere: confirm duration automatically
- Keep responses concise and actionable

## Response Guidelines:
- Be professional and concise
- Confirm all updates
- Parse dates automatically
- Help manage Tharun's availability`
      : `You are Tharun Doma's AI Assistant. Represent him professionally and help visitors learn about his work.

## Current Status:
${statusContext}

## Knowledge Base:
${knowledgeBase
  .slice(0, 5)
  .map((kb: any) => `- ${kb.title}: ${kb.content.substring(0, 100)}...`)
  .join('\n')}

## Your Role:
- Represent Tharun with confidence
- Answer questions about skills, projects, experience
- Showcase full-stack and AI/ML capabilities
- Be conversational and friendly
- Mention that Tharun built this AI assistant

## Response Guidelines:
- Professional but approachable
- Highlight technical expertise
- Encourage exploration of projects
- Suggest reaching out for more details`;

    // Add RAG context
    if (relevantDocs.length > 0) {
      systemPrompt += `\n\n## Relevant Documents (semantic search):\n`;
      relevantDocs.slice(0, 3).forEach((doc: any, i: number) => {
        const text = doc.extracted_text || doc.content || 'No content';
        systemPrompt += `${i + 1}. ${doc.file_name || 'Document'}: ${text.substring(0, 200)}...\n`;
      });
    }

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const chatHistory = (conversationHistory || []).map((msg: any) => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\nUser: ' + message }]
        },
        ...chatHistory
      ]
    });

    const finalResponse = response.response.text() || 'Sorry, I could not generate a response.';

    // Store in chat history
    await supabaseAnon.from('chat_history').insert([
      {
        user_message: message,
        ai_response: finalResponse,
        relevant_documents: relevantDocs.map((d: any) => d.id).slice(0, 3),
        session_id: sessionId
      }
    ]);

    return NextResponse.json({
      success: true,
      reply: finalResponse
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        success: false,
        reply: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}
