import React from 'react';
import { Sparkles, ChevronRight, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  breadcrumbs: Array<{ label: string; path?: string }>;
  onNavigate: (path: string) => void;
  onResumeClick?: () => void;
  showResumeBtn?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  breadcrumbs,
  onNavigate,
  onResumeClick,
  showResumeBtn = true,
}) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border/80 bg-surface-200/90 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="text-slate-400 hover:text-slate-200 font-medium transition-colors"
        >
          ContextOS
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            {crumb.path ? (
              <button
                onClick={() => onNavigate(crumb.path!)}
                className="text-slate-400 hover:text-slate-200 font-medium transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-slate-200 font-semibold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Center/Right Toolbar */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Demo Mode: Ready</span>
        </div>

        {/* Global Resume Action Button */}
        {showResumeBtn && onResumeClick && (
          <button
            onClick={onResumeClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Resume My Work</span>
          </button>
        )}
      </div>
    </header>
  );
};
