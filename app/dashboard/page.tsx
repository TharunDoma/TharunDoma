'use client';

import { DollarSign, TrendingUp, Target, Award, Calendar, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Earnings',
      value: '$12,450',
      change: '+15.3%',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+2',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Goals Achieved',
      value: '24/30',
      change: '80%',
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Achievements',
      value: '15',
      change: '+3 this month',
      icon: Award,
      color: 'yellow'
    },
  ];

  const recentEarnings = [
    { project: 'AI Chat Development', amount: '$2,500', date: 'Jan 20, 2026', status: 'completed' },
    { project: 'Dashboard Design', amount: '$1,800', date: 'Jan 18, 2026', status: 'completed' },
    { project: 'API Integration', amount: '$3,200', date: 'Jan 15, 2026', status: 'completed' },
    { project: 'Website Redesign', amount: '$4,950', date: 'Jan 10, 2026', status: 'completed' },
  ];

  const goals = [
    { title: 'Complete 10 AI projects', progress: 80, target: '10 projects' },
    { title: 'Earn $15,000 this month', progress: 83, target: '$15,000' },
    { title: 'Learn 3 new technologies', progress: 66, target: '3 techs' },
    { title: 'Build personal brand', progress: 60, target: '100 followers' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400">
            Track your progress, earnings, and goals
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Earnings */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-bold text-slate-200">
                Recent Earnings
              </h2>
            </div>
            <div className="space-y-4">
              {recentEarnings.map((earning, index) => (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-emerald-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-slate-200 font-semibold">
                      {earning.project}
                    </h3>
                    <span className="text-emerald-500 font-bold">
                      {earning.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">{earning.date}</span>
                    <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-xs font-semibold">
                      {earning.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-bold text-slate-200">
                Goals Progress
              </h2>
            </div>
            <div className="space-y-6">
              {goals.map((goal, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-slate-200 font-semibold">{goal.title}</h3>
                    <span className="text-emerald-500 font-semibold">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="bg-slate-900 rounded-full h-3 mb-1">
                    <div
                      className="bg-emerald-500 rounded-full h-3 transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Target: {goal.target}</span>
                    {goal.progress >= 100 && (
                      <CheckCircle2 className="text-emerald-500" size={16} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">
            Monthly Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-emerald-500">23</p>
              <p className="text-slate-500 text-sm mt-1">+5 from last month</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Average per Project</p>
              <p className="text-3xl font-bold text-emerald-500">$541</p>
              <p className="text-slate-500 text-sm mt-1">+$67 from last month</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-emerald-500">96%</p>
              <p className="text-slate-500 text-sm mt-1">22/23 completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
