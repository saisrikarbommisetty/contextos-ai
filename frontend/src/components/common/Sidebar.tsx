import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Plus, 
  FileText, 
  Share2, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectApi } from '../../services/api';
import { ProjectCardData } from '../../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onResumeGlobal?: () => void;
  onOpenCreateProject?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath, 
  onNavigate, 
  onResumeGlobal,
  onOpenCreateProject 
}) => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const res = await projectApi.getAllProjects();
        if (isMounted) {
          setProjects(res || []);
        }
      } catch (err) {
        console.warn('Failed to load sidebar projects:', err);
      }
    };
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [user?.id, currentPath]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'All Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Context Graph', path: '/graph', icon: Share2 },
    { label: 'Handover Briefs', path: '/briefs', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-surface-200 border-r border-border flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">AI</span>
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

        {/* User's Real Active Workspaces */}
        <div className="px-3 py-2 space-y-1 border-t border-border/40 mt-2">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Your Projects</span>
            <span className="text-[10px] text-brand-400 font-mono">{projects.length} Active</span>
          </div>

          {projects.length > 0 ? (
            projects.map((proj, idx) => {
              const isActive = currentPath.includes(proj.id);
              const colors = ['bg-accent-cyan', 'bg-accent-emerald', 'bg-accent-amber', 'bg-brand-400'];
              const dotColor = colors[idx % colors.length];

              return (
                <button
                  key={proj.id}
                  onClick={() => onNavigate(`/project/${proj.id}`)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-brand-500/20 text-white font-semibold border border-brand-500/30'
                      : 'text-slate-300 hover:bg-surface-100 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColor} shadow-sm`}></span>
                  <span className="truncate">{proj.name}</span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-[11px] text-slate-500 italic">
              No projects yet.
            </div>
          )}

          {onOpenCreateProject && (
            <button
              onClick={onOpenCreateProject}
              className="w-full flex items-center gap-2 px-3 py-1.5 mt-1 text-[11px] text-slate-400 hover:text-brand-300 hover:bg-surface-100/50 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/60 bg-surface-300/60">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-100/80 border border-border">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-brand-400/50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Lead Engineer'}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-surface-200 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
