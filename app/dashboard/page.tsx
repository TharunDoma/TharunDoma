'use client';

import { Code2, Layers, Rocket, Briefcase, BookOpen, Cpu } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Years of Experience', value: '3+ years', icon: Briefcase, color: 'sky' },
    { title: 'Projects Delivered', value: '20+', icon: Rocket, color: 'indigo' },
    { title: 'Tech Stack', value: 'Full‑stack & AI', icon: Code2, color: 'violet' },
    { title: 'Core Domains', value: 'Web • Data • ML', icon: Layers, color: 'cyan' },
  ];

  const highlights = [
    'Hands‑on with modern web frameworks (Next.js, React, Tailwind).',
    'AI integrations: Gemini models, context-aware assistants.',
    'Data/ML exposure: pipelines, text extraction, search & ranking.',
    'Built this portfolio and AI assistant end‑to‑end.',
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      sky: { bg: 'bg-sky-500/10', text: 'text-sky-500' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
    };
    return colors[color] || colors.sky;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-sky-500 mb-2">Overview</h1>
          <p className="text-slate-400">Public profile snapshot for visitors and recruiters</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={stat.title}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${colors.bg} rounded-lg p-3`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  <span className="text-emerald-500 text-sm font-semibold">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-slate-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-200">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Highlights (public, non-sensitive) */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-indigo-500" size={24} />
            <h2 className="text-2xl font-bold text-slate-200">Highlights</h2>
          </div>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="text-slate-300">• {h}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tech Stack Overview */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Code2 className="text-sky-500" size={24} />
              <h2 className="text-2xl font-bold text-slate-200">Tech Stack</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <span>Next.js • React • TypeScript</span>
              <span>Tailwind CSS • UI/UX</span>
              <span>Supabase • PostgreSQL</span>
              <span>Gemini Models • AI SDK</span>
              <span>Node.js • APIs</span>
              <span>Data Pipelines • PDF Parsing</span>
            </div>
          </div>

          {/* Featured Areas */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="text-indigo-500" size={24} />
              <h2 className="text-2xl font-bold text-slate-200">Featured Areas</h2>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>• Building interactive portfolios and AI assistants</li>
              <li>• End‑to‑end web apps with clean UI/UX</li>
              <li>• Document processing and knowledge systems</li>
              <li>• Practical integrations with modern AI models</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Explore Work</h2>
          <p className="text-slate-400 mb-4">See featured projects and tools Tharun has built.</p>
          <a href="/projects" className="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-indigo-700 transition-all">View Projects</a>
        </div>
      </div>
    </div>
  );
}
