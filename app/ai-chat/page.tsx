'use client';

import AIAssistant from '@/app/components/AIAssistant';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIChatPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">AI Assistant</h1>
          <p className="text-slate-300">Ask me anything about my experience, projects, skills, and achievements!</p>
        </div>

        {/* Chat Container */}
        <div className="h-[600px]">
          <AIAssistant />
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="font-semibold text-emerald-400 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Ask about my projects and experience</li>
            <li>• Ask about my skills and certifications</li>
            <li>• Ask about my achievements and updates</li>
            <li>• Ask about specific technologies or tools</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
