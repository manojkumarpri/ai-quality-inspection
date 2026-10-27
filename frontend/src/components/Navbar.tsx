import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Layers, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: 'Live Inspection', icon: Cpu },
    { path: '/history', label: 'Audit History', icon: Layers },
    { path: '/dashboard', label: 'Executive Dashboard', icon: BarChart3 },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-8 flex space-x-8 sticky top-0 z-50 shadow-sm">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2.5 transition-all duration-200 cursor-pointer ${
              isActive
                ? 'border-blue-500 text-blue-400 font-semibold shadow-[inset_0_-1px_0_0_#3b82f6]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}