import React, { useState } from 'react';
import { Layers, Sparkles, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Briefcase, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToLanding }) => {
  const { login, demoLogin, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('Lead Full-Stack Engineer');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTabSwitch = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setError(null);
    if (toRegister) {
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setEmail('demo@contextos.ai');
      setPassword('contextos123');
    }
  };

  const handlePrefillDemo = () => {
    setIsRegister(false);
    setEmail('demo@contextos.ai');
    setPassword('contextos123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Please provide your full name.');
        }
        await register({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
      } else {
        await login(email.trim().toLowerCase(), password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await demoLogin();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-cyan/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl glass-panel border border-brand-500/30 p-7 md:p-8 shadow-2xl relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 mb-3 group focus:outline-none"
            title="Return to ContextOS overview"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-surface-300 rounded-[14px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-brand-400" />
              </div>
            </div>
          </button>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Join ContextOS to eliminate context thrashing & work fatigue'
              : 'Sign in to access your continuous multi-project workspace'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex rounded-2xl bg-surface-200/80 p-1 border border-border mb-6">
          <button
            type="button"
            onClick={() => handleTabSwitch(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              !isRegister
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              isRegister
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        {!isRegister && (
          <div className="mb-5">
            <button
              onClick={handleDemoClick}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 glow-hero-btn transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>⚡ 1-Click Instant Demo Login (Sai Krishna)</span>
            </button>
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border w-full"></div>
              <span className="bg-surface-200 px-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Or Sign In Below
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Lead Full-Stack Engineer">Lead Full-Stack Engineer</option>
                    <option value="Backend Architect">Backend Architect</option>
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Engineering Manager">Engineering Manager</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={handlePrefillDemo}
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Use Demo Email
                </button>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder={isRegister ? "your.name@company.com" : "demo@contextos.ai"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-400 mt-0.5" />
              <span>Includes auto-provisioned starter workspace with live AI context continuity!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all mt-2 cursor-pointer"
          >
            <span>{isLoading ? 'Authenticating...' : isRegister ? 'Create Account & Launch Workspace' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-5 text-center text-xs text-slate-400">
          <span>{isRegister ? 'Already registered? ' : "Need an account? "}</span>
          <button
            onClick={() => handleTabSwitch(!isRegister)}
            className="text-brand-400 hover:text-brand-300 font-bold ml-1 transition-colors"
          >
            {isRegister ? 'Sign In' : 'Create One Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
