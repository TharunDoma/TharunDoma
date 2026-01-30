import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function GET() {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY' }, { status: 400 });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data?.error || data }, { status: res.status });
    }

    // Return only useful models (exclude embeddings/tools)
    const models = (data.models || []).map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      supportedMethods: m.supportedMethods,
    }));

    return NextResponse.json({ success: true, models });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
