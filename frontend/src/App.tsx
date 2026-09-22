import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { ResumeModalOrView } from './components/resume/ResumeModalOrView';
import { ProjectBriefModal } from './components/brief/ProjectBriefModal';
import { LoadingState } from './components/common/LoadingState';
import { projectApi } from './services/api';

export function App() {
  const { user, isAuthenticated, isLoading, demoLogin } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [activeResumeProjectId, setActiveResumeProjectId] = useState<string | null>(null);
  const [activeBriefProjectId, setActiveBriefProjectId] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);

  // Load user's actual projects
  useEffect(() => {
    if (isAuthenticated) {
      projectApi.getAllProjects()
        .then((data) => setUserProjects(data || []))
        .catch((err) => console.warn('Failed to load user projects:', err));
    }
  }, [isAuthenticated, currentPath]);

  // Handle URL hash / path state synchronization
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || '/dashboard';
      setCurrentPath(hash);
    };

    if (window.location.hash) {
      handleHash();
    }

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const handleResumeClick = (projectId: string) => {
    setActiveResumeProjectId(projectId);
  };

  const handleBriefClick = (projectId: string) => {
    setActiveBriefProjectId(projectId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Connecting to ContextOS Workspace..." />
      </div>
    );
  }

  // Unauthenticated routing
  if (!isAuthenticated) {
    if (currentPath === '/login' || currentPath === '/register') {
      return (
        <LoginPage
          onSuccess={() => navigate('/dashboard')}
          onBackToLanding={() => navigate('/')}
        />
      );
    }
    return (
      <LandingPage
        onLoginClick={() => navigate('/login')}
        onDemoClick={async () => {
          await demoLogin();
          navigate('/dashboard');
        }}
      />
    );
  }

  // Parse Project Workspace path: e.g. /project/:id
  const isProjectView = currentPath.startsWith('/project/');
  const currentProjectId = isProjectView ? currentPath.split('/project/')[1] : null;

  // Selected project for fallback graph / global resume
  const defaultProjectId = currentProjectId || userProjects[0]?.id;

  // Breadcrumbs builder
  const breadcrumbs = [];
  if (isProjectView && currentProjectId) {
    const activeProj = userProjects.find((p) => p.id === currentProjectId);
    breadcrumbs.push({ label: 'Projects', path: '/dashboard' });
    breadcrumbs.push({ label: activeProj?.name || currentProjectId });
  } else if (currentPath === '/graph') {
    breadcrumbs.push({ label: 'Context Graph' });
  } else if (currentPath === '/briefs') {
    breadcrumbs.push({ label: 'Project Briefs' });
  } else {
    breadcrumbs.push({ label: 'Overview' });
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-row">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigate}
        onResumeGlobal={() => defaultProjectId && handleResumeClick(defaultProjectId)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          breadcrumbs={breadcrumbs}
          onNavigate={navigate}
          onResumeClick={() => defaultProjectId && handleResumeClick(defaultProjectId)}
          showResumeBtn={!!defaultProjectId}
        />

        <div className="flex-1">
          {isProjectView && currentProjectId ? (
            <ProjectWorkspacePage
              projectId={currentProjectId}
              initialTab="overview"
              onBackToDashboard={() => navigate('/dashboard')}
              onResumeClick={handleResumeClick}
              onGenerateBriefClick={handleBriefClick}
            />
          ) : currentPath === '/graph' ? (
            defaultProjectId ? (
              <ProjectWorkspacePage
                projectId={defaultProjectId}
                initialTab="graph"
                onBackToDashboard={() => navigate('/dashboard')}
                onResumeClick={handleResumeClick}
                onGenerateBriefClick={handleBriefClick}
              />
            ) : (
              <div className="p-10 text-center text-slate-400">
                Please create a project first to view its interconnected context graph.
              </div>
            )
          ) : currentPath === '/briefs' ? (
            <div className="p-8 md:p-10 max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Project Handover Briefs</h2>
                <p className="text-xs text-slate-400 mt-1">Select an active project to generate an executive handover brief with AI reasoning:</p>
              </div>

              {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userProjects.map((p) => (
                    <div key={p.id} className="p-5 rounded-2xl glass-card border border-border flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-sm text-white mb-1 truncate">{p.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{p.description || 'Continuous project workspace.'}</p>
                      </div>
                      <button
                        onClick={() => handleBriefClick(p.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600/30 to-indigo-600/30 hover:from-brand-600 hover:to-indigo-600 text-brand-300 hover:text-white text-xs font-semibold border border-brand-500/30 transition-all cursor-pointer"
                      >
                        Generate Handover Brief
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-2xl glass-panel border border-dashed border-border text-center text-xs text-slate-400">
                  No projects available yet. Create your first workspace to generate handover briefs.
                </div>
              )}
            </div>
          ) : (
            <DashboardPage
              onOpenProject={(id) => navigate(`/project/${id}`)}
              onResumeProject={handleResumeClick}
            />
          )}
        </div>
      </div>

      {/* Global Resume My Work Modal */}
      {activeResumeProjectId && (
        <ResumeModalOrView
          projectId={activeResumeProjectId}
          onClose={() => setActiveResumeProjectId(null)}
          onContinueWork={(taskId) => {
            navigate(`/project/${activeResumeProjectId}`);
          }}
        />
      )}

      {/* Global Project Context Brief Modal */}
      {activeBriefProjectId && (
        <ProjectBriefModal
          projectId={activeBriefProjectId}
          onClose={() => setActiveBriefProjectId(null)}
        />
      )}
    </div>
  );
}

export default App;
