import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-border">
      <div className="w-12 h-12 rounded-xl bg-surface-100 border border-border flex items-center justify-center mb-4 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-200 border border-border text-xs font-semibold transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
