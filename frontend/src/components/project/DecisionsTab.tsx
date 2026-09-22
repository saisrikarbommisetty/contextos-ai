import React, { useState } from 'react';
import { GitCommit, Plus, User as UserIcon, Calendar, CheckCircle } from 'lucide-react';
import { Decision } from '../../types';
import { projectApi } from '../../services/api';

interface DecisionsTabProps {
  projectId: string;
  decisions: Decision[];
  onDecisionCreated: (decision: Decision) => void;
}

export const DecisionsTab: React.FC<DecisionsTabProps> = ({
  projectId,
  decisions,
  onDecisionCreated,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [madeBy, setMadeBy] = useState<string>('Sai Krishna');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await projectApi.createDecision(projectId, {
        title,
        description,
        madeBy,
      });
      onDecisionCreated(created);
      setTitle('');
      setDescription('');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to log decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-border">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-brand-400" />
            <span>Architecture Decision Records (ADR)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Decisions prevent context loss and eliminate repeated debates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Decision</span>
        </button>
      </div>

      {/* Decision Cards */}
      <div className="space-y-4">
        {decisions.map((dec, idx) => (
          <div
            key={dec.id}
            className="p-5 rounded-2xl glass-card border border-border hover:border-brand-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-mono font-bold flex items-center justify-center">
                  #{decisions.length - idx}
                </span>
                <h4 className="text-sm font-bold text-slate-100">{dec.title}</h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{new Date(dec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-8 mb-3">
              {dec.description}
            </p>

            <div className="flex items-center justify-between pl-8 pt-3 border-t border-border/40 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                <span>Made by: <strong className="text-slate-300">{dec.madeBy}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active Consensus</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Decision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-border p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Record Architecture Decision</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Decision Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adopt Redis BullMQ for webhook queueing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rationale & Context</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why this decision was made, alternatives considered, and consequences..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Decision Maker / Team</label>
                <input
                  type="text"
                  value={madeBy}
                  onChange={(e) => setMadeBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  {isSubmitting ? 'Recording...' : 'Record ADR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
