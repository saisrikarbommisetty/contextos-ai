import prisma from '../../config/prisma';
import { ContextPackage } from '../../types';

export class ContextEngine {
  /**
   * Reconstructs full contextual package for a given project and user
   */
  public static async buildContextPackage(projectId: string, userId: string): Promise<ContextPackage> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        tasks: {
          include: { assignee: true },
          orderBy: { updatedAt: 'desc' },
        },
        documents: {
          orderBy: { updatedAt: 'desc' },
        },
        meetings: {
          orderBy: { date: 'desc' },
        },
        decisions: {
          orderBy: { date: 'desc' },
        },
        activities: {
          orderBy: { timestamp: 'desc' },
        },
        sessions: {
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 2,
        },
      },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    // Determine user's previous session boundary
    const previousSession = project.sessions.length > 0 ? project.sessions[0] : null;
    const sessionBoundaryTime = previousSession
      ? (previousSession.endedAt || previousSession.startedAt)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago if no session

    // Filter tasks
    const completedTasks = project.tasks
      .filter((t) => t.status === 'COMPLETED')
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        completedAt: t.updatedAt,
      }));

    const openTasks = project.tasks
      .filter((t) => t.status !== 'COMPLETED')
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
      }));

    // Identify recent changes (activities or modified records after session boundary)
    const recentActivities = project.activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      timestamp: a.timestamp,
    }));

    // Categorize changes specifically after previous session
    const recentChanges = project.activities
      .filter((a) => new Date(a.timestamp).getTime() >= new Date(sessionBoundaryTime).getTime() - 1000 * 60 * 5)
      .map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description || 'Project state update recorded.',
        timestamp: a.timestamp,
      }));

    // If no recent changes strictly after session, include the 4 most recent project activities as changes
    const fallbackChanges = recentChanges.length > 0
      ? recentChanges
      : project.activities.slice(0, 4).map((a) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description || 'Recent update.',
          timestamp: a.timestamp,
        }));

    // Identify Open Loops (Blockers + In Progress + Unfinished critical tasks)
    const openLoops: ContextPackage['openLoops'] = [];

    // Add blocked tasks first
    project.tasks
      .filter((t) => t.status === 'BLOCKED')
      .forEach((t) => {
        openLoops.push({
          id: `loop-blocked-${t.id}`,
          title: `[BLOCKED] ${t.title}`,
          priority: 'CRITICAL',
          status: 'BLOCKED',
          relatedEntity: `task:${t.id}`,
          description: t.description || undefined,
        });
      });

    // Add In-Progress critical or high priority tasks
    project.tasks
      .filter((t) => t.status === 'IN_PROGRESS')
      .forEach((t) => {
        openLoops.push({
          id: `loop-prog-${t.id}`,
          title: t.title,
          priority: (t.priority as any) || 'HIGH',
          status: 'IN_PROGRESS',
          relatedEntity: `task:${t.id}`,
          description: t.description || undefined,
        });
      });

    // Add high-priority TODO tasks
    project.tasks
      .filter((t) => t.status === 'TODO' && (t.priority === 'HIGH' || t.priority === 'CRITICAL'))
      .forEach((t) => {
        openLoops.push({
          id: `loop-todo-${t.id}`,
          title: t.title,
          priority: (t.priority as any) || 'HIGH',
          status: 'TODO',
          relatedEntity: `task:${t.id}`,
          description: t.description || undefined,
        });
      });

    // Compute Context Health Score (0 - 100%)
    const health = this.calculateContextHealth(project);

    return {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description,
      projectStatus: project.status,
      progress: project.progress,
      lastSession: previousSession
        ? {
            startedAt: previousSession.startedAt,
            endedAt: previousSession.endedAt,
            lastViewedEntity: previousSession.lastViewedEntity,
          }
        : null,
      recentActivity: recentActivities,
      completedTasks,
      openTasks,
      importantDecisions: project.decisions.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        madeBy: d.madeBy,
        date: d.date,
      })),
      relevantDocuments: project.documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        type: doc.type,
        url: doc.url,
      })),
      recentMeetings: project.meetings.map((m) => ({
        id: m.id,
        title: m.title,
        summary: m.summary,
        date: m.date,
        participants: m.participants,
      })),
      recentChanges: fallbackChanges,
      openLoops,
      contextHealth: health,
    };
  }

  /**
   * Deterministic Context Health Calculator
   * Factors: Activity recency, Decision records, Task clarity, Documentation volume
   */
  private static calculateContextHealth(project: any): ContextPackage['contextHealth'] {
    let activityScore = 20;
    let decisionScore = 20;
    let taskClarityScore = 20;
    let documentationScore = 20;

    // Activity recency check
    const recentActivityCount = project.activities?.length || 0;
    if (recentActivityCount >= 5) activityScore = 25;
    else if (recentActivityCount >= 2) activityScore = 20;
    else activityScore = 10;

    // Decision record check
    const decisionCount = project.decisions?.length || 0;
    if (decisionCount >= 3) decisionScore = 25;
    else if (decisionCount >= 1) decisionScore = 20;
    else decisionScore = 8;

    // Task clarity check (tasks exist with priority/assignees)
    const taskCount = project.tasks?.length || 0;
    const completedCount = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
    if (taskCount >= 3 && completedCount > 0) taskClarityScore = 25;
    else if (taskCount >= 1) taskClarityScore = 18;
    else taskClarityScore = 10;

    // Documentation check
    const docCount = project.documents?.length || 0;
    if (docCount >= 2) documentationScore = 25;
    else if (docCount >= 1) documentationScore = 20;
    else documentationScore = 10;

    const totalScore = Math.min(100, activityScore + decisionScore + taskClarityScore + documentationScore);

    let status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' = 'GOOD';
    let summary = 'Your project has sufficient recent activity and connected contextual information.';

    if (totalScore >= 85) {
      status = 'EXCELLENT';
      summary = 'Rich contextual memory available. All decisions, documents, and task relationships are clearly linked.';
    } else if (totalScore < 60) {
      status = 'NEEDS_ATTENTION';
      summary = 'Limited contextual data recorded. Link more documents and record key architectural decisions.';
    }

    return {
      score: totalScore,
      status,
      summary,
      breakdown: {
        activityScore,
        decisionScore,
        taskClarityScore,
        documentationScore,
      },
    };
  }
}
