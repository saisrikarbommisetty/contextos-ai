import React from 'react';
import { Sparkles, ArrowRight, Clock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ProjectCardData } from '../../types';

interface ResumeHeroCardProps {
  project: ProjectCardData | null;
  onResume: (projectId: string) => void;
  onOpenWorkspace: (projectId: string) => void;
}

export const ResumeHeroCard: React.FC<ResumeHeroCardProps> = ({
  project,
  onResume,
  onOpenWorkspace,
}) => {
  if (!project) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel border border-brand-500/30 p-6 md:p-8 shadow-2xl shadow-brand-500/10">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-accent-cyan/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Ready for Instant Continuity</span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Resume <span className="text-brand-gradient">{project.name}</span>
          </h2>

          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {project.description}
          </p>

          {/* Quick Context Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-100/80 border border-border">
              <Clock className="w-4 h-4 text-brand-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Last Active</p>
                <p className="text-xs font-semibold text-slate-200">2 days ago</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-100/80 border border-border">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Open Loops</p>
                <p className="text-xs font-semibold text-slate-200">{project.openItemsCount} items to resolve</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-100/80 border border-border">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Context Health</p>
                <p className="text-xs font-semibold text-emerald-400">{project.contextHealthScore}% (High)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <button
            onClick={() => onResume(project.id)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-brand-600/30 glow-hero-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Resume My Work</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenWorkspace(project.id)}
            className="px-5 py-3 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-200 border border-border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span>Open Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
