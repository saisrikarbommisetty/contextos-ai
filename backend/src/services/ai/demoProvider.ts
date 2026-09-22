import { ContextPackage, ResumeBriefing, ProjectContextBrief } from '../../types';
import { AIProvider } from './types';

export class DemoAIProvider implements AIProvider {
  public name = 'DemoAIProvider';

  public async generateResumeBriefing(pkg: ContextPackage): Promise<ResumeBriefing> {
    // Check if this is the flagship CampusConnect project
    if (pkg.projectName.toLowerCase().includes('campusconnect') || pkg.projectId.includes('campus-connect')) {
      return {
        projectId: pkg.projectId,
        projectName: pkg.projectName,
        reconstructedAt: new Date().toISOString(),
        projectState: 'Authentication module and dashboard shell are fully complete. The team is currently blocked by an API schema mismatch on the Profile endpoint, and staging deployment is pending secret configuration.',
        lastWorkingPoint: 'You last worked on the authentication module. Login and registration were completed, while profile API integration was assigned to you right as backend schema changes were merged.',
        completedItems: pkg.completedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          completedAt: t.completedAt.toISOString(),
        })),
        importantDecisions: pkg.importantDecisions.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          madeBy: d.madeBy,
          date: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        })),
        recentChanges: [
          {
            id: 'change-1',
            category: 'SCHEMA',
            title: 'Profile API schema updated to nested structure',
            description: 'Backend merged v2.1 contract changing flat fields to { profile: { identity, academic } }',
            timeAgo: '2 days ago',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'change-2',
            category: 'TASK',
            title: 'Critical Task assigned: Integrate Student Profile API',
            description: 'Assigned to Sai Krishna with priority Critical before release',
            timeAgo: 'Yesterday',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'change-3',
            category: 'DEPLOYMENT',
            title: 'Staging deployment pipeline blocked',
            description: 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in GitHub Actions environment secrets',
            timeAgo: '2 hours ago',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ],
        openLoops: pkg.openLoops,
        relevantEntities: [
          {
            id: 'doc-cc-02',
            type: 'DOCUMENT',
            title: 'v2.1 REST API Documentation & Profile Schema Migration Guide',
            snippet: 'New contract format for /api/v2/student/profile with identity and academic objects.',
            url: 'https://docs.contextos.internal/campusconnect/api-v2-1',
          },
          {
            id: 'dec-cc-01',
            type: 'DECISION',
            title: 'Use Supabase for authentication and database services',
            snippet: 'Adopted PostgreSQL RLS and Supabase auth token validation.',
          },
          {
            id: 'meet-cc-01',
            type: 'MEETING',
            title: 'Sprint 14 Sync: Auth Completion & Profile API Handoff',
            snippet: 'Priya confirmed schema updates and handed off integration to Sai.',
          },
        ],
        recommendedContinuation: {
          actionTitle: 'Update ProfileService.ts with nested v2.1 schema & test student profile view',
          reasoning: 'The backend schema update broke the legacy flat parser. Updating the frontend TypeScript interface and data mapping resolves the blocker and unblocks staging testing.',
          primaryTaskId: 'task-cc-03',
          suggestedSteps: [
            'Open frontend/src/services/profileService.ts',
            'Update UserProfile interface to expect { profile: { identity, academic } }',
            'Run component unit tests and verify profile avatar & major display',
            'Notify Priya Sharma in #dev-announcements once verified',
          ],
        },
        contextHealth: {
          score: pkg.contextHealth.score,
          status: pkg.contextHealth.status,
          summary: pkg.contextHealth.summary,
        },
      };
    }

    // Dynamic Context Reconstruction for any other project
    const lastWorkingPoint = pkg.lastSession
      ? `You last viewed ${pkg.lastSession.lastViewedEntity || 'project tasks'} on ${new Date(pkg.lastSession.startedAt).toLocaleDateString()}.`
      : `First context recovery session for ${pkg.projectName}.`;

    const projectState = pkg.openTasks.length > 0
      ? `${pkg.projectName} has ${pkg.completedTasks.length} completed tasks and ${pkg.openTasks.length} active work items. Overall progress is at ${pkg.progress}%.`
      : `${pkg.projectName} is currently in ${pkg.projectStatus} state with all tracked tasks up to date.`;

    const firstOpenTask = pkg.openTasks.find((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH') || pkg.openTasks[0];

    return {
      projectId: pkg.projectId,
      projectName: pkg.projectName,
      reconstructedAt: new Date().toISOString(),
      projectState,
      lastWorkingPoint,
      completedItems: pkg.completedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        completedAt: t.completedAt.toISOString(),
      })),
      importantDecisions: pkg.importantDecisions.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        madeBy: d.madeBy,
        date: d.date.toLocaleDateString(),
      })),
      recentChanges: pkg.recentChanges.slice(0, 4).map((c, i) => ({
        id: `change-${i}`,
        category: (c.type.includes('DOC') ? 'DOC' : c.type.includes('DEC') ? 'DECISION' : 'TASK') as any,
        title: c.title,
        description: c.description,
        timeAgo: 'Recently',
        timestamp: c.timestamp.toISOString(),
      })),
      openLoops: pkg.openLoops,
      relevantEntities: pkg.relevantDocuments.slice(0, 3).map((d) => ({
        id: d.id,
        type: 'DOCUMENT',
        title: d.title,
        snippet: d.description || 'Project specification document.',
        url: d.url,
      })),
      recommendedContinuation: {
        actionTitle: firstOpenTask ? `Continue working on: ${firstOpenTask.title}` : `Review project status for ${pkg.projectName}`,
        reasoning: firstOpenTask
          ? `This item has ${firstOpenTask.priority} priority and is currently in ${firstOpenTask.status} state.`
          : 'All core tasks are completed. You can define upcoming milestones or run regression tests.',
        primaryTaskId: firstOpenTask?.id,
        suggestedSteps: firstOpenTask
          ? [
              `Open task details for "${firstOpenTask.title}"`,
              'Review linked decisions and documentation',
              'Implement required logic and verify changes',
            ]
          : ['Review project deliverables', 'Schedule next planning sync'],
      },
      contextHealth: {
        score: pkg.contextHealth.score,
        status: pkg.contextHealth.status,
        summary: pkg.contextHealth.summary,
      },
    };
  }

  public async generateProjectBrief(pkg: ContextPackage): Promise<ProjectContextBrief> {
    return {
      projectId: pkg.projectId,
      projectName: pkg.projectName,
      generatedAt: new Date().toISOString(),
      projectOverview: pkg.projectDescription,
      currentState: `${pkg.projectName} is currently ${pkg.projectStatus.toLowerCase()} (${pkg.progress}% progress). Key foundations are established with active focus on open loops and integration testing.`,
      importantDecisions: pkg.importantDecisions.map((d) => ({
        title: d.title,
        description: d.description,
        madeBy: d.madeBy,
        date: d.date.toLocaleDateString(),
      })),
      majorMilestones: [
        {
          title: 'Core Infrastructure & Foundation',
          status: pkg.progress >= 50 ? 'Completed' : 'In Progress',
        },
        {
          title: 'API Integration & Service Contracts',
          status: pkg.progress >= 75 ? 'Completed' : 'In Progress',
        },
        {
          title: 'Staging Deployment & Quality Assurance',
          status: 'Pending',
        },
      ],
      currentBlockers: pkg.openLoops
        .filter((l) => l.status === 'BLOCKED' || l.priority === 'CRITICAL')
        .map((l) => ({
          title: l.title,
          priority: l.priority,
          resolution: l.description || 'Requires active developer intervention and configuration fix.',
        })),
      recentChanges: pkg.recentChanges.slice(0, 4).map((c) => ({
        title: c.title,
        time: new Date(c.timestamp).toLocaleDateString(),
      })),
      keyPeople: [
        { name: 'Sai Krishna', role: 'Lead Full-Stack Engineer' },
        { name: 'Priya Sharma', role: 'Backend Architect' },
        { name: 'Alex Rivera', role: 'Frontend Engineer' },
      ],
      relevantDocuments: pkg.relevantDocuments.map((d) => ({
        title: d.title,
        type: d.type,
      })),
      recommendedStartingPoint: pkg.openLoops.length > 0
        ? `Resolve top open blocker: "${pkg.openLoops[0].title}". Refer to ${pkg.relevantDocuments[0]?.title || 'documentation'} for specifications.`
        : `Start by reviewing project roadmap and assigning next sprint deliverables.`,
    };
  }
}
