import Link from 'next/link';
import { Code2, Brain, Sparkles, Zap, Database, Palette, ArrowRight } from 'lucide-react';

export default function Home() {
  const skills = [
    { name: 'AI/ML', icon: Brain, description: 'Machine Learning & Neural Networks' },
    { name: 'Web Dev', icon: Code2, description: 'Full-stack Development' },
    { name: 'UI/UX', icon: Palette, description: 'User Interface Design' },
    { name: 'Performance', icon: Zap, description: 'Optimization & Speed' },
    { name: 'Data', icon: Database, description: 'Data Engineering' },
    { name: 'Innovation', icon: Sparkles, description: 'Creative Solutions' },
  ];

  const featuredProjects = [
    {
      title: 'AI Chat Assistant',
      description: 'Interactive chatbot with natural language processing',
      link: '/projects/ai-chat',
      tag: 'AI'
    },
    {
      title: 'Project Dashboard',
      description: 'Real-time analytics and project tracking',
      link: '/dashboard',
      tag: 'Analytics'
    },
    {
      title: 'AI Tools Collection',
      description: 'Curated collection of AI-powered tools',
      link: '/projects',
      tag: 'Collection'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-emerald-500">
              Tharun Doma
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300">
              AI Engineer & Full-Stack Developer
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Building intelligent solutions with modern web technologies.
              Passionate about AI, machine learning, and creating exceptional user experiences.
            </p>
            <div className="flex justify-center gap-4 pt-6">
              <Link
                href="/projects"
                className="bg-emerald-500 text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-2"
              >
                View Projects
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/dashboard"
                className="bg-slate-800 text-emerald-500 px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors border border-emerald-500"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-emerald-500 text-center mb-12">
            Skills & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.name}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors"
                >
                  <Icon className="text-emerald-500 mb-4" size={40} />
                  <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    {skill.name}
                  </h3>
                  <p className="text-slate-400">{skill.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-emerald-500 text-center mb-12">
            Featured Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <Link
                key={project.title}
                href={project.link}
                className="group bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-all hover:transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-sm font-semibold">
                    {project.tag}
                  </span>
                  <ArrowRight className="text-slate-500 group-hover:text-emerald-500 transition-colors" size={20} />
                </div>
                <h3 className="text-2xl font-semibold text-slate-200 mb-3">
                  {project.title}
                </h3>
                <p className="text-slate-400">
                  {project.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
