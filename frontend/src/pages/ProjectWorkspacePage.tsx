import React, { useState, useEffect } from 'react';
import { FullProject, Task, Decision, Document, Meeting } from '../types';
import { projectApi } from '../services/api';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { ProjectOverviewTab } from '../components/project/ProjectOverviewTab';
import { TasksTab } from '../components/project/TasksTab';
import { DecisionsTab } from '../components/project/DecisionsTab';
import { DocumentsTab } from '../components/project/DocumentsTab';
import { MeetingsTab } from '../components/project/MeetingsTab';
import { ActivityTab } from '../components/project/ActivityTab';
import { ContextGraphTab } from '../components/project/ContextGraphTab';
import { LoadingState } from '../components/common/LoadingState';
import { Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

interface ProjectWorkspacePageProps {
  projectId: string;
  initialTab?: string;
  onBackToDashboard: () => void;
  onResumeClick: (projectId: string) => void;
  onGenerateBriefClick: (projectId: string) => void;
}

export const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({
  projectId,
  initialTab = 'overview',
  onBackToDashboard,
  onResumeClick,
  onGenerateBriefClick,
}) => {
  const [project, setProject] = useState<FullProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [error, setError] = useState<string | null>(null);

  // Edit Project Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('In Progress');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Delete Project Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProject = async () => {
    try {
      const data = await projectApi.getById(projectId);
      setProject(data);
      setEditName(data.name);
      setEditDesc(data.description);
      setEditStatus(data.status);
      setEditProgress(data.progress);
    } catch (err: any) {
      console.error('Failed to load project:', err);
      setError(err.message || 'Project not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const updated = await projectApi.updateProject(project.id, {
        name: editName.trim(),
        description: editDesc,
        status: editStatus,
        progress: Number(editProgress),
      });
      setProject({
        ...project,
        name: updated.name,
        description: updated.description,
        status: updated.status,
        progress: updated.progress,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await projectApi.deleteProject(project.id);
      setShowDeleteModal(false);
      onBackToDashboard();
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    if (!project) return;
    setProject({
      ...project,
      tasks: project.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    });
  };

  const handleTaskCreated = (newTask: Task) => {
    if (!project) return;
    setProject({
      ...project,
      tasks: [newTask, ...project.tasks],
    });
  };

  const handleTaskDeleted = (taskId: string) => {
    if (!project) return;
    setProject({
      ...project,
      tasks: project.tasks.filter((t) => t.id !== taskId),
    });
  };

  const handleDecisionCreated = (newDecision: Decision) => {
    if (!project) return;
    setProject({
      ...project,
      decisions: [newDecision, ...project.decisions],
    });
  };

  const handleDecisionDeleted = (decisionId: string) => {
    if (!project) return;
    setProject({
      ...project,
      decisions: project.decisions.filter((d) => d.id !== decisionId),
    });
  };

  const handleDocumentCreated = (newDoc: Document) => {
    if (!project) return;
    setProject({
      ...project,
      documents: [newDoc, ...project.documents],
    });
  };

  const handleDocumentDeleted = (docId: string) => {
    if (!project) return;
    setProject({
      ...project,
      documents: project.documents.filter((d) => d.id !== docId),
    });
  };

  const handleMeetingCreated = (newMeeting: Meeting) => {
    if (!project) return;
    setProject({
      ...project,
      meetings: [newMeeting, ...project.meetings],
    });
  };

  if (loading) {
    return <LoadingState message="Loading project workspace..." />;
  }

  if (error || !project) {
    return (
      <div className="p-12 text-center text-rose-400 text-xs">
        {error || 'Project not found.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Workspace Header */}
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResumeClick={() => onResumeClick(project.id)}
        onGenerateBriefClick={() => onGenerateBriefClick(project.id)}
        onBackToDashboard={onBackToDashboard}
        onEditProject={() => {
          setEditName(project.name);
          setEditDesc(project.description);
          setEditStatus(project.status);
          setEditProgress(project.progress);
          setShowEditModal(true);
        }}
        onDeleteProject={() => setShowDeleteModal(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-fade-in">
        {activeTab === 'overview' && (
          <ProjectOverviewTab
            project={project}
            onResumeClick={() => onResumeClick(project.id)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            projectId={project.id}
            tasks={project.tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskCreated={handleTaskCreated}
            onTaskDeleted={handleTaskDeleted}
          />
        )}

        {activeTab === 'decisions' && (
          <DecisionsTab
            projectId={project.id}
            decisions={project.decisions}
            onDecisionCreated={handleDecisionCreated}
            onDecisionDeleted={handleDecisionDeleted}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            projectId={project.id}
            documents={project.documents}
            onDocumentCreated={handleDocumentCreated}
            onDocumentDeleted={handleDocumentDeleted}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingsTab
            projectId={project.id}
            meetings={project.meetings}
            onMeetingCreated={handleMeetingCreated}
          />
        )}

        {activeTab === 'graph' && (
          <ContextGraphTab projectId={project.id} />
        )}

        {activeTab === 'activity' && (
          <ActivityTab activities={project.activities} />
        )}
      </main>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-scale-up">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-brand-500/30 p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Project Settings</h3>
                <p className="text-xs text-slate-400">Update project name, description, status, and progress.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Planning">Planning</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-100 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30"
                >
                  <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-scale-up">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-500/40 p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Project</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-white">"{project.name}"</strong>? This will permanently remove its associated tasks, documents, decisions, and context history.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
