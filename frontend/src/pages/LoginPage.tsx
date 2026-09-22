import React, { useState } from 'react';
import { Layers, Sparkles, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToLanding }) => {
  const { login, demoLogin, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('demo@contextos.ai');
  const [password, setPassword] = useState<string>('contextos123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed.');
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
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl glass-panel border border-brand-500/30 p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 mb-4 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/30">
              <div className="w-full h-full bg-surface-300 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-brand-400" />
              </div>
            </div>
          </button>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Create your Account' : 'Welcome to ContextOS'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? 'Start recovering work context across your projects' : 'Sign in to access your continuous workspace'}
          </p>
        </div>

        {/* 1-Click Demo Login Hero Button */}
        <div className="mb-6">
          <button
            onClick={handleDemoClick}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>⚡ Instant Hackathon Demo Login</span>
          </button>
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full"></div>
            <span className="bg-surface-200 px-3 text-[11px] text-slate-500 font-medium uppercase">Or with credentials</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Sai Krishna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="demo@contextos.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
                className="w-full pl-9 pr-3 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>{isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-brand-400" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>{isRegister ? 'Already have an account? ' : "Don't have an account? "}</span>
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-brand-400 hover:text-brand-300 font-semibold"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
