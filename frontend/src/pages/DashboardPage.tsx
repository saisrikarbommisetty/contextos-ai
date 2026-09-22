import React, { useState, useEffect } from 'react';
import { Sparkles, FolderGit2, Plus, X, ArrowRight } from 'lucide-react';
import { DashboardData } from '../types';
import { dashboardApi, projectApi } from '../services/api';
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
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [projectStatus, setProjectStatus] = useState<string>('In Progress');
  const [isCreating, setIsCreating] = useState<boolean>(false);

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

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-border text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => heroProject && onResumeProject(heroProject.id)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 glow-hero-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Resume Latest Work</span>
          </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.userProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onResume={onResumeProject}
              onOpenWorkspace={onOpenProject}
            />
          ))}
        </div>
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
    </div>
  );
};
