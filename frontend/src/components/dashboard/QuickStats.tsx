import React from 'react';
import { FolderGit2, AlertCircle, CheckCircle2, History, Sparkles } from 'lucide-react';

interface QuickStatsProps {
  stats: {
    activeProjectsCount: number;
    openLoopsCount: number;
    completedTasksCount: number;
    activeTasksCount: number;
    contextRecoveredCount: number;
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Active Projects',
      value: stats.activeProjectsCount,
      sub: 'All synced with ContextOS',
      icon: FolderGit2,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      label: 'Open Loops & Blockers',
      value: stats.openLoopsCount,
      sub: 'Requires context awareness',
      icon: AlertCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Tasks Completed',
      value: stats.completedTasksCount,
      sub: 'Archived into project memory',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Continuity Cycles',
      value: `${stats.contextRecoveredCount}x`,
      sub: 'Context loss eliminated',
      icon: Sparkles,
      color: 'text-accent-cyan',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="p-4 rounded-2xl glass-card border border-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white font-mono">{card.value}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
