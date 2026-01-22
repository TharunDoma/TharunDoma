import Link from 'next/link';
import { Home, Briefcase, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-emerald-500">Portfolio</span>
          </Link>
          
          <div className="flex space-x-6">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-slate-300 hover:text-emerald-500 transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link 
              href="/projects" 
              className="flex items-center space-x-2 text-slate-300 hover:text-emerald-500 transition-colors"
            >
              <Briefcase size={20} />
              <span>Projects</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-slate-300 hover:text-emerald-500 transition-colors"
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
