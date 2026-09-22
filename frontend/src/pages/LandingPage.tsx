import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  GitCommit, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onDemoClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onDemoClick }) => {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-border/80 bg-surface-200/80 backdrop-blur-xl sticky top-0 z-40 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/30">
            <div className="w-full h-full bg-surface-300 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">Context<span className="text-brand-400">OS</span></span>
            <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-bold">MVP</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLoginClick}
            className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onDemoClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Try Demo</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-16 pb-20 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Glow Background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-accent-cyan/15 rounded-full blur-[90px] pointer-events-none"></div>

        {/* Hero Tagline pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 animate-float">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>The AI Context Layer for Human Work</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl">
          Never lose your <br />
          <span className="text-brand-gradient">work context</span> again.
        </h1>

        {/* Supporting text */}
        <p className="text-base md:text-xl text-slate-400 mt-6 max-w-2xl leading-relaxed">
          ContextOS reconstructs where you left off, what changed, why decisions were made, and what to do next—so you can get back into the flow instantly.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <button
            onClick={onDemoClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-base font-extrabold flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/40 glow-hero-btn transition-all"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>Launch Hackathon Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onLoginClick}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-border text-slate-200 text-sm font-semibold transition-all"
          >
            Sign In / Register
          </button>
        </div>

        {/* Interactive Simulation Preview Card */}
        <div className="w-full max-w-4xl mt-16 rounded-3xl glass-panel border border-brand-500/30 p-6 md:p-8 shadow-2xl text-left relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-mono text-slate-400 ml-2">contextos.ai/demo/campusconnect</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-bold">
              AI Continuity Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-surface-100/70 border border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-400 mb-1">
                <Clock className="w-4 h-4" />
                <span>Where You Left Off</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auth complete. Profile API assigned as schema changed to nested JSON.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/70 border border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-cyan mb-1">
                <GitCommit className="w-4 h-4" />
                <span>Decision Context</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supabase selected for DB/Auth. Schema migration approved for v2.1.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/70 border border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Zap className="w-4 h-4" />
                <span>Recommended Next</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Update ProfileService.ts to resolve 400 error and verify frontend view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="px-6 md:px-12 py-16 bg-surface-300/60 border-t border-border/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Why Traditional Productivity Fails
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-3">
              Context-switching overhead destroys hours of focus every single week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Broken Flow */}
            <div className="p-6 rounded-2xl glass-card border border-rose-500/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-4">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Without ContextOS</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Switch projects and lose entire mental working model</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Spend 30 minutes reading old Slack messages and commits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Accidentally break code due to unnoticed schema changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Re-debate architectural decisions already settled weeks ago</span>
                </li>
              </ul>
            </div>

            {/* The ContextOS Flow */}
            <div className="p-6 rounded-2xl glass-card border border-brand-500/40 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>With ContextOS</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Click <strong>Resume My Work</strong> for an instant 10-second briefing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>See exact diff of decisions, schema changes, and uncommitted loops</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Visual Context Graph reveals interconnected dependencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Jump immediately into the highest-impact recommended continuation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-6 md:px-12 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span className="text-slate-400 font-semibold">ContextOS</span>
          <span>• AI Context Recovery & Continuity Platform</span>
        </div>
        <p>© 2026 ContextOS. Built for high-velocity knowledge workers.</p>
      </footer>
    </div>
  );
};
