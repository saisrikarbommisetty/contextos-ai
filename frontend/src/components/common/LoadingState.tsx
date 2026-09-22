import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  isContextReconstructing?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subMessage,
  isContextReconstructing = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel border border-border">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
          {isContextReconstructing ? (
            <Sparkles className="w-8 h-8 text-brand-400 animate-spin-slow" />
          ) : (
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          )}
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-cyan opacity-20 blur-md animate-pulse"></div>
      </div>
      <h3 className="text-base font-semibold text-slate-100">{message}</h3>
      {subMessage && <p className="text-xs text-slate-400 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};
