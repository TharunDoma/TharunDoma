import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: Request) {
  try {
    const { title, content, category, secret, token } = await req.json();

    // Security check - Support both token (new) and secret (legacy)
    const isAuthorized = token || secret === ADMIN_SECRET;
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, reply: 'Access Denied.' },
        { status: 401 }
      );
    }

    if (!title || !content) {
      return NextResponse.json({
        success: false,
        reply: 'Title and content are required.'
      });
    }

    // Save to database
    const { error, data } = await supabase
      .from('knowledge_base')
      .insert({
        title,
        content,
        category: category || 'general',
        is_active: true
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        reply: `Error: ${error.message}`
      });
    }

    return NextResponse.json({
      success: true,
      reply: `✅ Added to knowledge base! AI now knows: "${title}"`
    });
  } catch (error) {
    console.error('Knowledge API Error:', error);
    return NextResponse.json({
      success: false,
      reply: `Error: ${error}`
    });
  }
}
