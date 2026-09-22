import React, { useState } from 'react';
import { Users, Calendar, MessageSquare, Plus, X } from 'lucide-react';
import { Meeting } from '../../types';
import { projectApi } from '../../services/api';

interface MeetingsTabProps {
  projectId: string;
  meetings: Meeting[];
  onMeetingCreated?: (meeting: Meeting) => void;
}

export const MeetingsTab: React.FC<MeetingsTabProps> = ({
  projectId,
  meetings,
  onMeetingCreated,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [participants, setParticipants] = useState<string>('Sai Krishna, Priya Sharma');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await projectApi.createMeeting(projectId, {
        title,
        summary,
        participants,
      });
      if (onMeetingCreated) onMeetingCreated(created);
      setTitle('');
      setSummary('');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to log meeting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-border">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Meeting Sync Summaries & Action Items</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key points distilled from team planning and architecture syncs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Meeting</span>
        </button>
      </div>

      <div className="space-y-4">
        {meetings.map((meet) => (
          <div
            key={meet.id}
            className="p-5 rounded-2xl glass-card border border-border hover:border-brand-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <span>{meet.title}</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(meet.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-6 mb-3">
              {meet.summary}
            </p>

            <div className="flex items-center gap-2 pl-6 pt-3 border-t border-border/40 text-[11px] text-slate-400 flex-wrap">
              <span className="font-medium text-slate-500">Participants:</span>
              {meet.participants.split(',').map((p, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-surface-100 border border-border text-slate-300 text-[10px]"
                >
                  {p.trim()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Log Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-scale-up">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-brand-500/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Log Team Sync / Meeting</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 15 Planning & Security Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Summary & Takeaways</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize key talking points, agreed milestones, and action items..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Participants (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Sai Krishna, Priya Sharma, Alex Rivera"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
                  {isSubmitting ? 'Logging...' : 'Log Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
