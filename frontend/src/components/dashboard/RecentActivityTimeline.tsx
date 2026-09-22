import React from 'react';
import { 
  CheckCircle2, 
  FileCode2, 
  GitCommit, 
  ShieldAlert, 
  FileText, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Activity } from '../../types';

interface RecentActivityTimelineProps {
  activities: Activity[];
  onProjectClick?: (projectId: string) => void;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  activities,
  onProjectClick,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TASK_COMPLETED':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'SCHEMA_CHANGED':
        return { icon: FileCode2, color: 'text-accent-cyan', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'DECISION_RECORDED':
        return { icon: GitCommit, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/30' };
      case 'BLOCKER_FLAGGED':
        return { icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
      case 'DOC_UPDATED':
        return { icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
      default:
        return { icon: Sparkles, color: 'text-slate-400', bg: 'bg-surface-100 border-border' };
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-2xl glass-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <span>Cross-Project Activity Feed</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">Live Sync</span>
        </h3>
      </div>

      <div className="space-y-4">
        {activities.map((act) => {
          const style = getActivityIcon(act.type);
          const Icon = style.icon;

          return (
            <div key={act.id} className="flex items-start gap-3 group">
              <div className={`p-2 rounded-xl border ${style.bg} shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${style.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-brand-300 transition-colors">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {formatTime(act.timestamp)}
                  </span>
                </div>
                {act.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                )}
                {act.project && (
                  <button
                    onClick={() => onProjectClick && onProjectClick(act.projectId)}
                    className="inline-flex items-center gap-1 mt-1 text-[10px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    <span>{act.project.name}</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
