import React, { useState, useEffect } from 'react';
import { Sparkles, FolderGit2, Plus, X, ArrowRight, Edit2, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { DashboardData, ProjectCardData } from '../types';
import { dashboardApi, projectApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResumeHeroCard } from '../components/dashboard/ResumeHeroCard';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { QuickStats } from '../components/dashboard/QuickStats';
import { RecentActivityTimeline } from '../components/dashboard/RecentActivityTimeline';
import { LoadingState } from '../components/common/LoadingState';

interface DashboardPageProps {
  onOpenProject: (projectId: string) => void;
  onResumeProject: (projectId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenProject,
  onResumeProject,
}) => {
  const { user, demoLogin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Project State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [projectStatus, setProjectStatus] = useState<string>('In Progress');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Edit Project State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectCardData | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('In Progress');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Delete Project State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletingProject, setDeletingProject] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      const created = await projectApi.createProject({
        name: projectName,
        description: projectDesc,
        status: projectStatus,
      });
      setShowCreateModal(false);
      setProjectName('');
      setProjectDesc('');
      await fetchDashboard();
      onOpenProject(created.id);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (project: ProjectCardData) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDesc(project.description);
    setEditStatus(project.status);
    setEditProgress(project.progress);
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;

    setIsUpdating(true);
    try {
      await projectApi.updateProject(editingProject.id, {
        name: editName.trim(),
        description: editDesc,
        status: editStatus,
        progress: Number(editProgress),
      });
      setShowEditModal(false);
      setEditingProject(null);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDelete = (projectId: string, projectName: string) => {
    setDeletingProject({ id: projectId, name: projectName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await projectApi.deleteProject(deletingProject.id);
      setShowDeleteModal(false);
      setDeletingProject(null);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExploreDemo = async () => {
    try {
      setLoading(true);
      await demoLogin();
      await fetchDashboard();
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your ContextOS Workspace..." />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 text-xs">
        {error || 'Failed to load dashboard.'}
      </div>
    );
  }

  const heroProject = data.latestProjectToResume || data.userProjects[0];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Good morning, <span className="text-brand-gradient">{user?.name || 'Sai'}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Here's where your work stands across all projects.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>New Project</span>
          </button>

          {heroProject && (
            <button
              onClick={() => onResumeProject(heroProject.id)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Resume Latest Work</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Continuity Card */}
      {heroProject && (
        <ResumeHeroCard
          project={heroProject}
          onResume={onResumeProject}
          onOpenWorkspace={onOpenProject}
        />
      )}

      {/* Quick Metrics */}
      <QuickStats stats={data.stats} />

      {/* Active Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-brand-400" />
            <h2 className="text-base font-bold text-white">Active Projects</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono font-medium">
            {data.userProjects.length} Projects Tracked
          </span>
        </div>

        {data.userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.userProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onResume={onResumeProject}
                onOpenWorkspace={onOpenProject}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl glass-panel border border-dashed border-border/80 text-center space-y-4 max-w-2xl mx-auto shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto shadow-inner">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Your workspace is ready.</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Create your first project and ContextOS will begin automatically building its working context, tracking decisions, and preparing instant briefings.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
              <button
                onClick={handleExploreDemo}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Explore Demo Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cross-Project Recent Activity Feed */}
      <div className="space-y-4">
        <RecentActivityTimeline
          activities={data.recentActivities}
          onProjectClick={onOpenProject}
        />
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-scale-up">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-brand-500/30 p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create New Project</h3>
                <p className="text-xs text-slate-400">ContextOS will automatically maintain its continuity layer.</p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign v2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Objective</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the goals, architecture, and scope of this project..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-100 border border-border rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Planning">Planning</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30"
                >
                  <span>{isCreating ? 'Creating...' : 'Initialize Project'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
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
                <h3 className="text-lg font-bold text-white">Edit Project</h3>
                <p className="text-xs text-slate-400">Update project details, status, or progress.</p>
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

      {/* Delete Project Confirmation Modal */}
      {showDeleteModal && deletingProject && (
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
              Are you sure you want to delete <strong className="text-white">"{deletingProject.name}"</strong>? This will permanently remove its associated tasks, documents, decisions, and context history.
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
