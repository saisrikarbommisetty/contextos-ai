import React from 'react';
import { FolderGit2, ArrowRight, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { ProjectCardData } from '../../types';
import { ContextHealthBadge } from '../common/ContextHealthBadge';

interface ProjectCardProps {
  project: ProjectCardData;
  onResume: (projectId: string) => void;
  onOpenWorkspace: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onResume,
  onOpenWorkspace,
}) => {
  return (
    <div className="group rounded-2xl glass-card hover:border-brand-500/40 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-100 border border-border flex items-center justify-center text-brand-400 group-hover:scale-105 group-hover:text-accent-cyan transition-all">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {project.status}
              </span>
            </div>
          </div>
          <ContextHealthBadge score={project.contextHealthScore} size="sm" showLabel={false} />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Progress</span>
            <span className="font-mono text-slate-200">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 py-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{project.openItemsCount} Open Loops</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Active recently</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/60">
        <button
          onClick={() => onResume(project.id)}
          className="py-2 px-3 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Resume</span>
        </button>
        <button
          onClick={() => onOpenWorkspace(project.id)}
          className="py-2 px-3 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
