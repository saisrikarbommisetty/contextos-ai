import React from 'react';
import { 
  Sparkles, 
  FileText, 
  Share2, 
  FolderGit2, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Edit2,
  Trash2
} from 'lucide-react';
import { FullProject } from '../../types';
import { ContextHealthBadge } from '../common/ContextHealthBadge';

interface ProjectHeaderProps {
  project: FullProject;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onResumeClick: () => void;
  onGenerateBriefClick: () => void;
  onBackToDashboard: () => void;
  onEditProject?: () => void;
  onDeleteProject?: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  activeTab,
  onTabChange,
  onResumeClick,
  onGenerateBriefClick,
  onBackToDashboard,
  onEditProject,
  onDeleteProject,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: `Tasks (${project.tasks.length})` },
    { id: 'decisions', label: `Decisions (${project.decisions.length})` },
    { id: 'documents', label: `Documents (${project.documents.length})` },
    { id: 'meetings', label: `Meetings (${project.meetings.length})` },
    { id: 'graph', label: 'Context Graph' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="border-b border-border/80 bg-surface-200/90 backdrop-blur-md pt-6 px-6">
      {/* Back button */}
      <button
        onClick={onBackToDashboard}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </button>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <FolderGit2 className="w-6 h-6 text-brand-400" />
              <span>{project.name}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              {project.status}
            </span>
            <ContextHealthBadge score={84} status="Good" size="sm" />
          </div>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            {project.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Owner: <strong className="text-slate-300">{project.owner?.name}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last active: <strong className="text-slate-300">2 days ago</strong></span>
            </div>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onEditProject && (
            <button
              onClick={onEditProject}
              title="Edit Project"
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-slate-300 hover:text-white text-xs transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {onDeleteProject && (
            <button
              onClick={onDeleteProject}
              title="Delete Project"
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-rose-500/20 border border-border hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onGenerateBriefClick}
            className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Generate Brief</span>
          </button>

          <button
            onClick={() => onTabChange('graph')}
            className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4 text-accent-cyan" />
            <span>Context Graph</span>
          </button>

          <button
            onClick={onResumeClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Resume My Work</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-border/40 pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-brand-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
