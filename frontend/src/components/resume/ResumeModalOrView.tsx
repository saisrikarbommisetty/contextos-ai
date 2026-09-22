import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  GitCommit, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  X, 
  ExternalLink,
  ShieldCheck,
  Check,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResumeBriefing } from '../../types';
import { projectApi } from '../../services/api';
import { ContextHealthBadge } from '../common/ContextHealthBadge';

interface ResumeModalOrViewProps {
  projectId: string;
  onClose: () => void;
  onContinueWork?: (taskId?: string) => void;
}

const RECONSTRUCTION_STEPS = [
  'Gathering recent activity & commit history...',
  'Connecting project context & relational graph...',
  'Reviewing architecture decision records (ADR)...',
  'Analyzing changes since last active session...',
  'Identifying unresolved open loops & blockers...',
  'Reconstructing your working state...',
];

export const ResumeModalOrView: React.FC<ResumeModalOrViewProps> = ({
  projectId,
  onClose,
  onContinueWork,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [briefing, setBriefing] = useState<ResumeBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    // Step progression animation (total ~1.8 seconds for nice realistic feeling)
    interval = setInterval(() => {
      setStepIndex((curr) => {
        if (curr < RECONSTRUCTION_STEPS.length - 1) return curr + 1;
        return curr;
      });
    }, 320);

    const executeResume = async () => {
      try {
        const data = await projectApi.resumeWork(projectId);
        // Ensure user sees the nice reconstruction steps before showing result
        setTimeout(() => {
          setBriefing(data);
          setLoading(false);
          // Trigger celebratory continuity confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
          });
        }, 1200);
      } catch (err: any) {
        setError(err.message || 'Failed to reconstruct context.');
        setLoading(false);
      }
    };

    executeResume();

    return () => clearInterval(interval);
  }, [projectId]);

  const handleContinueAction = () => {
    if (onContinueWork) {
      onContinueWork(briefing?.recommendedContinuation?.primaryTaskId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-brand-500/40 shadow-2xl shadow-brand-500/20 overflow-hidden animate-scale-up">
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-surface-100/80 hover:bg-surface-50 text-slate-400 hover:text-white border border-border transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          /* ============================================================
             RECONSTRUCTION ANIMATION STEPPER
             ============================================================ */
          <div className="p-12 md:p-16 flex flex-col items-center justify-center text-center">
            {/* Pulsing AI Context Core */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-cyan p-1 shadow-2xl shadow-brand-500/40 animate-pulse">
                <div className="w-full h-full bg-surface-300 rounded-[22px] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-amber-300 animate-spin-slow" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 to-accent-cyan opacity-40 blur-xl rounded-full animate-pulse-glow"></div>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-2">
              ContextOS is Reconstructing Your Work
            </h2>
            <p className="text-xs text-brand-300 font-medium font-mono mb-8">
              Connecting project history, decisions, and uncommitted threads...
            </p>

            {/* Stepper Progress List */}
            <div className="w-full max-w-md space-y-2 text-left bg-surface-200/90 border border-border rounded-2xl p-4">
              {RECONSTRUCTION_STEPS.map((step, idx) => {
                const isDone = idx < stepIndex;
                const isCurrent = idx === stepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-brand-500/20 text-white font-semibold border border-brand-500/40'
                        : isDone
                        ? 'text-slate-300'
                        : 'text-slate-600 opacity-40'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></div>
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : error || !briefing ? (
          /* ============================================================
             ERROR RECOVERY
             ============================================================ */
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-base font-bold text-white">Context Reconstruction Notice</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              {error || 'Your project data is intact. Please refresh or navigate through the workspace directly.'}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Open Workspace
            </button>
          </div>
        ) : (
          /* ============================================================
             STRUCTURED BRIEFING HERO EXPERIENCE
             ============================================================ */
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Briefing Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Context Ready • 100% Reconstructed</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Welcome back to <span className="text-brand-gradient">{briefing.projectName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Here is the exact state of work, what changed while you were away, and where to continue.
                </p>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <ContextHealthBadge score={briefing.contextHealth.score} status={briefing.contextHealth.status} size="lg" />
              </div>
            </div>

            {/* SECTION 1: WHERE YOU LEFT OFF (Hero Narrative) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900/40 via-surface-100 to-surface-200 border border-brand-500/30 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>1. Where You Left Off</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed font-medium">
                {briefing.lastWorkingPoint}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {briefing.projectState}
              </p>
            </div>

            {/* SECTION 7 (HIGHLIGHTED): RECOMMENDED CONTINUATION */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-600/20 via-indigo-600/20 to-accent-cyan/20 border border-brand-500/50 shadow-lg shadow-brand-500/10">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Recommended Continuation</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/30 text-white font-mono font-bold">
                  Next Best Action
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white mb-1.5">
                {briefing.recommendedContinuation.actionTitle}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {briefing.recommendedContinuation.reasoning}
              </p>

              {/* Step Checklist */}
              {briefing.recommendedContinuation.suggestedSteps && (
                <div className="space-y-1.5 bg-surface-200/80 p-3.5 rounded-xl border border-border mb-4">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Execution Steps:</p>
                  {briefing.recommendedContinuation.suggestedSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleContinueAction}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn"
              >
                <span>Continue Work on This Task</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2-COLUMN GRID: WHAT CHANGED & OPEN LOOPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SECTION 4: WHAT CHANGED */}
              <div className="p-5 rounded-2xl glass-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-cyan" />
                    <span>What Changed Since Last Session</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-100 text-slate-400 font-mono">
                    {briefing.recentChanges.length} Events
                  </span>
                </div>

                <div className="space-y-2.5">
                  {briefing.recentChanges.map((change) => (
                    <div key={change.id} className="p-3 rounded-xl bg-surface-100/70 border border-border">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-200">{change.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{change.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {change.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: OPEN LOOPS & BLOCKERS */}
              <div className="p-5 rounded-2xl glass-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Open Loops & Blockers</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                    {briefing.openLoops.length} Items
                  </span>
                </div>

                <div className="space-y-2.5">
                  {briefing.openLoops.map((loop) => {
                    const isBlocked = loop.status === 'BLOCKED' || loop.priority === 'CRITICAL';
                    return (
                      <div
                        key={loop.id}
                        className={`p-3 rounded-xl border ${
                          isBlocked
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                            : 'bg-surface-100/70 border-border text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold">{loop.title}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isBlocked ? 'bg-rose-500/20 text-rose-300' : 'bg-surface-200 text-slate-400'
                          }`}>
                            {loop.priority}
                          </span>
                        </div>
                        {loop.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {loop.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2-COLUMN GRID: IMPORTANT DECISIONS & COMPLETED ITEMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SECTION 3: IMPORTANT DECISIONS */}
              <div className="p-5 rounded-2xl glass-card border border-border">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <GitCommit className="w-4 h-4 text-brand-400" />
                  <span>Important Decisions Made</span>
                </h3>

                <div className="space-y-2.5">
                  {briefing.importantDecisions.map((dec) => (
                    <div key={dec.id} className="p-3 rounded-xl bg-surface-100/70 border border-border">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-200">{dec.title}</p>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{dec.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {dec.description}
                      </p>
                      <p className="text-[10px] text-brand-400 mt-1 font-medium">
                        By: {dec.madeBy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: WHAT YOU COMPLETED */}
              <div className="p-5 rounded-2xl glass-card border border-border">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>What You Completed</span>
                </h3>

                <div className="space-y-2">
                  {briefing.completedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-100/70 border border-border">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-slate-200 font-medium">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 6: RELEVANT INFORMATION */}
            {briefing.relevantEntities && briefing.relevantEntities.length > 0 && (
              <div className="p-5 rounded-2xl glass-card border border-border">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span>Relevant Specifications & Documents</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {briefing.relevantEntities.map((ent) => (
                    <div key={ent.id} className="p-3 rounded-xl bg-surface-100/80 border border-border flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-200 text-brand-300 font-mono font-bold uppercase">
                          {ent.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 mt-1.5 mb-1 line-clamp-1">{ent.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{ent.snippet}</p>
                      </div>
                      {ent.url && (
                        <a
                          href={ent.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold mt-2"
                        >
                          <span>Open Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
