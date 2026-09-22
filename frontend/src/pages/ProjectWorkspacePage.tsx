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

  const fetchProject = async () => {
    try {
      const data = await projectApi.getById(projectId);
      setProject(data);
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

  const handleDecisionCreated = (newDecision: Decision) => {
    if (!project) return;
    setProject({
      ...project,
      decisions: [newDecision, ...project.decisions],
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
          />
        )}

        {activeTab === 'decisions' && (
          <DecisionsTab
            projectId={project.id}
            decisions={project.decisions}
            onDecisionCreated={handleDecisionCreated}
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
    </div>
  );
};
