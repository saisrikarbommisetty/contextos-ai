import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Zap, 
  FileText, 
  Share2, 
  Settings, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onResumeGlobal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onResumeGlobal }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'All Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Context Graph', path: '/graph', icon: Share2 },
    { label: 'Handover Briefs', path: '/briefs', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-surface-200 border-r border-border flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('/dashboard')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-surface-300 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-brand-400 group-hover:text-accent-cyan transition-colors" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Context</span>
                <span className="text-brand-400">OS</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">MVP</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Work Continuity Layer</p>
            </div>
          </button>
        </div>

        {/* Global Quick Action */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={onResumeGlobal || (() => onNavigate('/dashboard'))}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 glow-hero-btn transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Resume Latest Work</span>
          </button>
        </div>

        {/* Navigation links */}
        <div className="px-3 py-3 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400"></span>}
              </button>
            );
          })}
        </div>

        {/* Pinned Demo Projects */}
        <div className="px-3 py-2 space-y-1 border-t border-border/40 mt-2">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Active Projects</span>
            <span className="text-[10px] text-brand-400 font-mono">3 Active</span>
          </div>
          <button
            onClick={() => onNavigate('/project/proj-campus-connect-01')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              currentPath.includes('proj-campus-connect-01')
                ? 'bg-brand-500/20 text-white font-semibold border border-brand-500/30'
                : 'text-slate-300 hover:bg-surface-100 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-accent-cyan shadow-sm shadow-accent-cyan"></span>
            <span className="truncate">CampusConnect</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-surface-300 text-slate-400 font-mono">Hero</span>
          </button>

          <button
            onClick={() => onNavigate('/project/proj-ai-research-02')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              currentPath.includes('proj-ai-research-02')
                ? 'bg-brand-500/20 text-white font-semibold border border-brand-500/30'
                : 'text-slate-300 hover:bg-surface-100 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
            <span className="truncate">AI Research Assistant</span>
          </button>

          <button
            onClick={() => onNavigate('/project/proj-team-portal-03')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
              currentPath.includes('proj-team-portal-03')
                ? 'bg-brand-500/20 text-white font-semibold border border-brand-500/30'
                : 'text-slate-300 hover:bg-surface-100 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-accent-amber"></span>
            <span className="truncate">Team Productivity Portal</span>
          </button>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/60 bg-surface-300/60">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-100/80 border border-border">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-brand-400/50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || 'Sai Krishna'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Lead Engineer'}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-surface-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
