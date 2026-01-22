import Link from 'next/link';
import { MessageSquare, Image, Music, Video, FileText, Code, Wand2, Brain } from 'lucide-react';

export default function ProjectsPage() {
  const aiTools = [
    {
      title: 'AI Chat Assistant',
      description: 'Conversational AI with natural language understanding and context awareness',
      icon: MessageSquare,
      link: '/projects/ai-chat',
      color: 'emerald'
    },
    {
      title: 'Image Generator',
      description: 'Text-to-image AI that creates stunning visuals from descriptions',
      icon: Image,
      link: '#',
      color: 'blue'
    },
    {
      title: 'Music Composer',
      description: 'AI-powered music generation based on mood and genre preferences',
      icon: Music,
      link: '#',
      color: 'purple'
    },
    {
      title: 'Video Editor',
      description: 'Automated video editing with AI-driven scene detection and transitions',
      icon: Video,
      link: '#',
      color: 'pink'
    },
    {
      title: 'Content Writer',
      description: 'Generate high-quality articles, blog posts, and creative content',
      icon: FileText,
      link: '#',
      color: 'yellow'
    },
    {
      title: 'Code Assistant',
      description: 'AI-powered code completion, refactoring, and bug detection',
      icon: Code,
      link: '#',
      color: 'cyan'
    },
    {
      title: 'Style Transfer',
      description: 'Apply artistic styles to your photos using neural networks',
      icon: Wand2,
      link: '#',
      color: 'indigo'
    },
    {
      title: 'Smart Analytics',
      description: 'ML-powered data analysis and predictive insights',
      icon: Brain,
      link: '#',
      color: 'red'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; text: string; bg: string }> = {
      emerald: { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' },
      purple: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10' },
      pink: { border: 'border-pink-500', text: 'text-pink-500', bg: 'bg-pink-500/10' },
      yellow: { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      cyan: { border: 'border-cyan-500', text: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      indigo: { border: 'border-indigo-500', text: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      red: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500/10' },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-emerald-500 mb-4">
            AI Tools Collection
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Explore our suite of AI-powered tools designed to enhance productivity and creativity
          </p>
        </div>

        {/* Grid of AI Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const colors = getColorClasses(tool.color);
            const isActive = tool.link !== '#';

            return (
              <Link
                key={tool.title}
                href={tool.link}
                className={`group bg-slate-800 border ${colors.border} rounded-lg p-6 transition-all hover:transform hover:scale-105 ${
                  !isActive && 'cursor-not-allowed opacity-60'
                }`}
              >
                <div className={`${colors.bg} rounded-lg p-4 w-fit mb-4`}>
                  <Icon className={colors.text} size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {tool.description}
                </p>
                {!isActive && (
                  <span className="text-xs text-slate-500 mt-2 inline-block">
                    Coming Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
