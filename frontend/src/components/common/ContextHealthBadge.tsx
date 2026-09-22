import React from 'react';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ContextHealthBadgeProps {
  score: number;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ContextHealthBadge: React.FC<ContextHealthBadgeProps> = ({
  score,
  status,
  size = 'md',
  showLabel = true,
}) => {
  const getColors = (val: number) => {
    if (val >= 80) {
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        ring: 'text-emerald-500',
        label: 'Excellent',
        icon: ShieldCheck,
      };
    }
    if (val >= 60) {
      return {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        ring: 'text-indigo-500',
        label: 'Good',
        icon: Activity,
      };
    }
    return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      ring: 'text-amber-500',
      label: 'Needs Context',
      icon: AlertTriangle,
    };
  };

  const style = getColors(score);
  const IconComponent = style.icon;

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text} text-xs font-medium`}>
        <IconComponent className="w-3 h-3" />
        <span>{score}% Context</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border ${style.bg} ${style.border}`}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-surface-100 border border-border">
          <span className={`font-mono font-bold text-sm ${style.text}`}>{score}%</span>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <IconComponent className={`w-3.5 h-3.5 ${style.text}`} />
            <span>Context Health</span>
          </div>
          <div className={`text-xs ${style.text} font-medium`}>
            {status || style.label} • Ready to Resume
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border ${style.bg} ${style.border} ${style.text} text-xs font-semibold`}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
      <span>{score}% Health</span>
      {showLabel && <span className="text-slate-400 text-[10px] font-normal">({status || style.label})</span>}
    </div>
  );
};
