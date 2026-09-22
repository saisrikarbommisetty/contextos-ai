import React, { useState } from 'react';
import { FileText, ExternalLink, FileCode, BookOpen, Layers, Plus, Trash2, X } from 'lucide-react';
import { Document } from '../../types';
import { projectApi } from '../../services/api';

interface DocumentsTabProps {
  projectId: string;
  documents: Document[];
  onDocumentCreated?: (doc: Document) => void;
  onDocumentDeleted?: (docId: string) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  projectId,
  documents,
  onDocumentCreated,
  onDocumentDeleted,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<string>('ARCHITECTURE');
  const [url, setUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getDocIcon = (t: string) => {
    switch (t) {
      case 'ARCHITECTURE':
        return { icon: Layers, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/30' };
      case 'API_SPEC':
        return { icon: FileCode, color: 'text-accent-cyan', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      default:
        return { icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await projectApi.createDocument(projectId, {
        title,
        description,
        type,
        url: url.trim() || undefined,
      });
      if (onDocumentCreated) onDocumentCreated(created);
      setTitle('');
      setDescription('');
      setUrl('');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await projectApi.deleteDocument(projectId, docId);
      if (onDocumentDeleted) onDocumentDeleted(docId);
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-border">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Project Documentation & Specifications</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Connected technical specifications, API schemas, and architecture RFCs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const style = getDocIcon(doc.type);
          const Icon = style.icon;

          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl glass-card border border-border hover:border-brand-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border ${style.bg}`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-100 border border-border font-mono text-slate-400 font-semibold uppercase">
                      {doc.type}
                    </span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      title="Delete document"
                      className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-100 mb-1.5">{doc.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {doc.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[11px] text-slate-400">
                <span>Updated: {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                  >
                    <span>Open Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Document Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-scale-up">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-brand-500/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Add Project Specification / Document</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auth Architecture RFC v2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="ARCHITECTURE">Architecture RFC</option>
                  <option value="API_SPEC">API Specification</option>
                  <option value="GUIDE">Deployment Guide / Playbook</option>
                  <option value="NOTE">Engineering Note</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">External Link / URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://docs.mycompany.com/rfc/auth"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Summary & Key Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain purpose, key endpoints, constraints, and architecture notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
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
                  {isSubmitting ? 'Adding...' : 'Attach Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
