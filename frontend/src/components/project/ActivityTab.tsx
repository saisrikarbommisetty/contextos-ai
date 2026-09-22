import React from 'react';
import { 
  Activity as ActivityIcon, 
  CheckCircle2, 
  FileCode2, 
  GitCommit, 
  ShieldAlert, 
  FileText 
} from 'lucide-react';
import { Activity } from '../../types';

interface ActivityTabProps {
  activities: Activity[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activities }) => {
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
      default:
        return { icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl glass-panel border border-border">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-brand-400" />
          <span>Project Audit Trail & Chronological History</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Everything that happened in the project across tasks, documents, and decisions.
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((act) => {
          const style = getActivityIcon(act.type);
          const Icon = style.icon;

          return (
            <div
              key={act.id}
              className="p-4 rounded-2xl glass-card border border-border flex items-start gap-3.5 hover:border-brand-500/30 transition-all"
            >
              <div className={`p-2.5 rounded-xl border ${style.bg} shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${style.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs md:text-sm font-bold text-slate-100">{act.title}</p>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(act.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {act.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {act.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
