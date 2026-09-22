import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  GitCommit, 
  FileText, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { FullProject } from '../../types';

interface ProjectOverviewTabProps {
  project: FullProject;
  onResumeClick: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  onResumeClick,
  onNavigateTab,
}) => {
  const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED');
  const openTasks = project.tasks.filter((t) => t.status !== 'COMPLETED');
  const blockedTasks = project.tasks.filter((t) => t.status === 'BLOCKED');

  return (
    <div className="space-y-6">
      {/* Current State Executive Summary */}
      <div className="p-6 rounded-2xl glass-panel border border-brand-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"></span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Reconstructed Project State
            </h2>
          </div>
          <button
            onClick={onResumeClick}
            className="text-xs text-brand-300 hover:text-brand-200 font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Resume Briefing</span>
          </button>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          Authentication implementation with Supabase is complete and verified. The team is currently blocked by an API schema mismatch on the Student Profile endpoint, while staging deployment is waiting on environment variable configuration.
        </p>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Overall Milestone Progress</span>
            <span className="text-white font-mono">{project.progress}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Open Loops & Recent Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Loops & Blockers */}
        <div className="p-6 rounded-2xl glass-card border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Open Loops & Immediate Blockers</span>
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold">
                {openTasks.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {openTasks.slice(0, 4).map((task) => {
                const isBlocked = task.status === 'BLOCKED';
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isBlocked
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-surface-100/70 border-border text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold">{task.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        isBlocked ? 'bg-rose-500/20 text-rose-300' : 'bg-surface-200 text-slate-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tasks')}
            className="mt-4 pt-3 border-t border-border/40 text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Manage All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Decisions */}
        <div className="p-6 rounded-2xl glass-card border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-brand-400" />
                <span>Architecture Decision Records (ADRs)</span>
              </h3>
              <span className="text-xs font-mono text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20 font-semibold">
                {project.decisions.length} Recorded
              </span>
            </div>

            <div className="space-y-3">
              {project.decisions.slice(0, 3).map((dec) => (
                <div key={dec.id} className="p-3.5 rounded-xl bg-surface-100/70 border border-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-slate-200">{dec.title}</p>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(dec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {dec.description}
                  </p>
                  <p className="text-[10px] text-brand-400 font-medium mt-1">
                    Made by: {dec.madeBy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('decisions')}
            className="mt-4 pt-3 border-t border-border/40 text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View All Decisions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
