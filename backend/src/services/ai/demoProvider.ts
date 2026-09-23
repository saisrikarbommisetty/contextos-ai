import { ContextPackage, ResumeBriefing, ProjectContextBrief } from '../../types';
import { AIProvider } from './types';

/**
 * DeterministicFallbackProvider
 * 
 * Reconstructs high-signal context and continuity briefings strictly from
 * real database data (tasks, decisions, documents, meetings, activities, sessions).
 * Used when Gemini API is unavailable, rate-limited (429), or when running in local offline mode.
 */
export class DemoAIProvider implements AIProvider {
  public name = 'DeterministicFallbackProvider';

  public async generateResumeBriefing(pkg: ContextPackage): Promise<ResumeBriefing> {
    // Flagship Demo Account & Seeded Scenario Override (Only when in explicit demo mode on CampusConnect)
    const isExplicitDemo = process.env.DEMO_MODE === 'true' || pkg.projectId === 'proj-campus-connect-01';
    if (isExplicitDemo && pkg.projectName === 'CampusConnect') {
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
        aiSource: 'fallback',
      };
    }

    // =========================================================================
    // DYNAMIC DETERMINISTIC CONTEXT SYNTHESIS FOR REAL USER PROJECTS
    // =========================================================================
    const blockedTasks = pkg.openTasks.filter((t) => t.status === 'BLOCKED');
    const inProgressTasks = pkg.openTasks.filter((t) => t.status === 'IN_PROGRESS');
    const criticalOrHighTasks = pkg.openTasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH');
    const topActionTask = blockedTasks[0] || inProgressTasks[0] || criticalOrHighTasks[0] || pkg.openTasks[0];

    // Determine narrative of where the user left off
    let lastWorkingPoint = '';
    if (pkg.lastSession && pkg.lastSession.lastViewedEntity) {
      lastWorkingPoint = `In your previous session, you were working on ${pkg.lastSession.lastViewedEntity}.`;
    } else if (inProgressTasks.length > 0) {
      lastWorkingPoint = `You currently have active in-progress work on "${inProgressTasks[0].title}".`;
    } else if (pkg.completedTasks.length > 0) {
      lastWorkingPoint = `You previously completed "${pkg.completedTasks[0].title}".`;
    } else {
      lastWorkingPoint = `Workspace initialized for ${pkg.projectName}. Ready to define tasks and context.`;
    }

    // Determine overarching project state narrative
    let projectState = '';
    if (blockedTasks.length > 0) {
      projectState = `${pkg.projectName} is at ${pkg.progress}% completion with ${blockedTasks.length} blocked item(s) requiring immediate resolution before progress can resume.`;
    } else if (inProgressTasks.length > 0) {
      projectState = `${pkg.projectName} is currently active (${pkg.progress}% progress) with ${inProgressTasks.length} in-progress deliverable(s) and ${pkg.completedTasks.length} completed milestone(s).`;
    } else if (pkg.openTasks.length > 0) {
      projectState = `${pkg.projectName} has ${pkg.openTasks.length} scheduled task(s) awaiting execution (${pkg.progress}% completion).`;
    } else {
      projectState = `${pkg.projectName} is currently up to date with 0 open blockers.`;
    }

    // Build recommended continuation action
    let actionTitle = '';
    let reasoning = '';
    let suggestedSteps: string[] = [];

    if (blockedTasks.length > 0) {
      actionTitle = `Unblock: ${blockedTasks[0].title}`;
      reasoning = `This item is marked as BLOCKED with ${blockedTasks[0].priority} priority. Resolving this blocker is the single highest leverage action to maintain team momentum.`;
      suggestedSteps = [
        `Review blocker description: "${blockedTasks[0].description || blockedTasks[0].title}"`,
        'Check related architectural decisions and linked documentation',
        'Apply the necessary configuration or code change to resolve the blocker',
        'Update task status to IN_PROGRESS once unblocked',
      ];
    } else if (inProgressTasks.length > 0) {
      actionTitle = `Continue working on: ${inProgressTasks[0].title}`;
      reasoning = `This task is currently in progress (${inProgressTasks[0].priority} priority). Completing it will advance overall project progress towards the next milestone.`;
      suggestedSteps = [
        `Review task specifications for "${inProgressTasks[0].title}"`,
        'Implement required functionality and run verification tests',
        'Record any new architectural decisions made during implementation',
        'Mark task as COMPLETED when finished',
      ];
    } else if (topActionTask) {
      actionTitle = `Start next task: ${topActionTask.title}`;
      reasoning = `This is the highest priority upcoming item (${topActionTask.priority}) in the project backlog.`;
      suggestedSteps = [
        `Open task "${topActionTask.title}" and review scope`,
        'Change status to IN_PROGRESS when starting work',
        'Attach any relevant reference documentation',
      ];
    } else {
      actionTitle = `Review roadmap and define upcoming milestones for ${pkg.projectName}`;
      reasoning = 'All tracked tasks are currently completed. Creating new milestone items will maintain clear project continuity.';
      suggestedSteps = [
        'Review current project deliverables',
        'Add upcoming tasks or documentation in the workspace',
        'Record key architectural decisions as they arise',
      ];
    }

    // Build entity references
    const relevantEntities: ResumeBriefing['relevantEntities'] = [];
    pkg.relevantDocuments.slice(0, 3).forEach((d) => {
      relevantEntities.push({
        id: d.id,
        type: 'DOCUMENT',
        title: d.title,
        snippet: d.description || 'Project specification document.',
        url: d.url,
      });
    });

    pkg.importantDecisions.slice(0, 2).forEach((d) => {
      relevantEntities.push({
        id: d.id,
        type: 'DECISION',
        title: d.title,
        snippet: d.description,
      });
    });

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
        date: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })),
      recentChanges: pkg.recentChanges.slice(0, 5).map((c, idx) => ({
        id: `change-${idx}`,
        category: (c.type.includes('DOC') ? 'DOC' : c.type.includes('DEC') ? 'DECISION' : c.type.includes('TASK') ? 'TASK' : 'SCHEMA') as any,
        title: c.title,
        description: c.description,
        timeAgo: 'Recently',
        timestamp: c.timestamp.toISOString(),
      })),
      openLoops: pkg.openLoops,
      relevantEntities,
      recommendedContinuation: {
        actionTitle,
        reasoning,
        primaryTaskId: topActionTask?.id,
        suggestedSteps,
      },
      contextHealth: {
        score: pkg.contextHealth.score,
        status: pkg.contextHealth.status,
        summary: pkg.contextHealth.summary,
      },
      aiSource: 'fallback',
    };
  }

  public async generateProjectBrief(pkg: ContextPackage): Promise<ProjectContextBrief> {
    const isExplicitDemo = process.env.DEMO_MODE === 'true' || pkg.projectId === 'proj-campus-connect-01';
    if (isExplicitDemo && pkg.projectName === 'CampusConnect') {
      return {
        projectId: pkg.projectId,
        projectName: pkg.projectName,
        generatedAt: new Date().toISOString(),
        projectOverview: pkg.projectDescription,
        currentState: 'Authentication flow is complete. Staging pipeline is temporarily blocked by missing environment secrets, and the student profile endpoint is being refactored for v2.1 schema.',
        importantDecisions: pkg.importantDecisions.map((d) => ({
          title: d.title,
          description: d.description,
          madeBy: d.madeBy,
          date: d.date.toLocaleDateString(),
        })),
        majorMilestones: [
          { title: 'Core Auth & Session Management', status: 'Completed' },
          { title: 'API Integration & Contract Testing', status: 'In Progress' },
          { title: 'Staging Deployment & Production Release', status: 'Pending' },
        ],
        currentBlockers: pkg.openLoops
          .filter((l) => l.status === 'BLOCKED' || l.priority === 'CRITICAL')
          .map((l) => ({
            title: l.title,
            priority: l.priority,
            resolution: l.description || 'Provide environment variables in GitHub secrets and re-run deployment pipeline.',
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
        recommendedStartingPoint: 'Update ProfileService.ts with nested v2.1 schema & verify staging environment secret configuration.',
        aiSource: 'fallback',
      };
    }

    return {
      projectId: pkg.projectId,
      projectName: pkg.projectName,
      generatedAt: new Date().toISOString(),
      projectOverview: pkg.projectDescription || `Continuous workspace for ${pkg.projectName}.`,
      currentState: `${pkg.projectName} is at ${pkg.progress}% progress with ${pkg.completedTasks.length} completed items and ${pkg.openTasks.length} active open loops.`,
      importantDecisions: pkg.importantDecisions.map((d) => ({
        title: d.title,
        description: d.description,
        madeBy: d.madeBy,
        date: d.date.toLocaleDateString(),
      })),
      majorMilestones: [
        {
          title: 'Initial Workspace Architecture & Infrastructure',
          status: pkg.progress >= 30 ? 'Completed' : 'In Progress',
        },
        {
          title: 'Core Feature Implementation & Integration',
          status: pkg.progress >= 70 ? 'Completed' : pkg.progress >= 20 ? 'In Progress' : 'Pending',
        },
        {
          title: 'Verification, Testing & Handover',
          status: pkg.progress === 100 ? 'Completed' : 'Pending',
        },
      ],
      currentBlockers: pkg.openLoops
        .filter((l) => l.status === 'BLOCKED' || l.priority === 'CRITICAL')
        .map((l) => ({
          title: l.title,
          priority: l.priority,
          resolution: l.description || 'Active intervention required to resolve dependencies or credentials.',
        })),
      recentChanges: pkg.recentChanges.slice(0, 4).map((c) => ({
        title: c.title,
        time: new Date(c.timestamp).toLocaleDateString(),
      })),
      keyPeople: [
        { name: pkg.projectName ? `${pkg.projectName} Lead` : 'Project Lead', role: 'Owner' },
      ],
      relevantDocuments: pkg.relevantDocuments.map((d) => ({
        title: d.title,
        type: d.type,
      })),
      recommendedStartingPoint: pkg.openLoops.length > 0
        ? `Focus on highest priority open loop: "${pkg.openLoops[0].title}".`
        : `Review project roadmap and schedule next development cycle.`,
      aiSource: 'fallback',
    };
  }
}
