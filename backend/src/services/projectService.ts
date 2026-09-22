import prisma from '../config/prisma';

export class ProjectService {
  /**
   * Retrieves high-level dashboard data for a user
   */
  public static async getDashboardData(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { tasks: { some: { assigneeId: userId } } },
        ],
      },
      include: {
        tasks: {
          select: { id: true, status: true, priority: true },
        },
        decisions: {
          take: 1,
          orderBy: { date: 'desc' },
        },
        activities: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        sessions: {
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    // Compute stats
    let totalOpenLoops = 0;
    let totalCompletedTasks = 0;
    let totalActiveTasks = 0;

    const projectCards = projects.map((proj) => {
      const openTasks = proj.tasks.filter((t) => t.status !== 'COMPLETED');
      const completed = proj.tasks.filter((t) => t.status === 'COMPLETED');
      const blocked = proj.tasks.filter((t) => t.status === 'BLOCKED');

      totalOpenLoops += openTasks.length;
      totalCompletedTasks += completed.length;
      totalActiveTasks += openTasks.length;

      // Estimate health
      const healthScore = Math.min(100, Math.max(40, 50 + completed.length * 10 - blocked.length * 15 + proj.activities.length * 5));

      return {
        id: proj.id,
        name: proj.name,
        description: proj.description,
        status: proj.status,
        progress: proj.progress,
        lastActiveAt: proj.lastActiveAt,
        openItemsCount: openTasks.length,
        blockedItemsCount: blocked.length,
        contextHealthScore: healthScore,
        lastActivity: proj.activities[0] || null,
        lastDecision: proj.decisions[0] || null,
        hasPreviousSession: proj.sessions.length > 0,
      };
    });

    // Recent activities across all user projects
    const recentActivities = await prisma.activity.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { tasks: { some: { assigneeId: userId } } },
          ],
        },
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 8,
    });

    // Recent decisions across projects
    const recentDecisions = await prisma.decision.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { tasks: { some: { assigneeId: userId } } },
          ],
        },
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 4,
    });

    // Identify recommended project to resume (most urgent or most recently active)
    const latestProjectToResume = projectCards[0] || null;

    return {
      userProjects: projectCards,
      latestProjectToResume,
      recentActivities,
      recentDecisions,
      stats: {
        activeProjectsCount: projects.length,
        openLoopsCount: totalOpenLoops,
        completedTasksCount: totalCompletedTasks,
        activeTasksCount: totalActiveTasks,
        contextRecoveredCount: Math.max(12, projects.length * 4),
      },
    };
  }

  public static async getAllProjects(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { tasks: { some: { assigneeId: userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        tasks: true,
        _count: {
          select: {
            tasks: true,
            documents: true,
            decisions: true,
            meetings: true,
          },
        },
      },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  public static async createProject(data: { name: string; description: string; status?: string }, ownerId: string) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || 'Continuous workspace managed by ContextOS.',
        status: data.status || 'In Progress',
        progress: 0,
        ownerId,
        lastActiveAt: new Date(),
      },
      include: {
        owner: true,
      },
    });

    // Record initial project created activity
    await prisma.activity.create({
      data: {
        projectId: project.id,
        type: 'PROJECT_CREATED',
        title: `Project Initialized: ${project.name}`,
        description: `Workspace created by ${project.owner.name}. ContextOS continuity layer active.`,
        entityType: 'PROJECT',
        entityId: project.id,
        actorId: ownerId,
      },
    });

    // Record first session
    await prisma.projectSession.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        startedAt: new Date(),
      },
    });

    return project;
  }

  public static async deleteProject(projectId: string, userId: string) {
    return prisma.project.delete({
      where: { id: projectId },
    });
  }

  public static async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true, email: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        documents: { orderBy: { updatedAt: 'desc' } },
        meetings: { orderBy: { date: 'desc' } },
        decisions: { orderBy: { date: 'desc' } },
        activities: {
          take: 25,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    return project;
  }

  public static async createTask(projectId: string, data: any, actorId?: string) {
    const task = await prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        assigneeId: data.assigneeId || actorId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { assignee: true },
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId,
        type: 'TASK_CREATED',
        title: `Task Created: ${task.title}`,
        description: task.description,
        entityType: 'TASK',
        entityId: task.id,
        actorId,
      },
    });

    // Touch project lastActiveAt
    await prisma.project.update({
      where: { id: projectId },
      data: { lastActiveAt: new Date() },
    });

    return task;
  }

  public static async updateTask(taskId: string, data: any, actorId?: string) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: { project: true, assignee: true },
    });

    // Record activity
    const activityType = data.status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED';
    await prisma.activity.create({
      data: {
        projectId: task.projectId,
        type: activityType,
        title: `${data.status === 'COMPLETED' ? 'Completed' : 'Updated'}: ${task.title}`,
        description: `Status changed to ${task.status}`,
        entityType: 'TASK',
        entityId: task.id,
        actorId,
      },
    });

    // Update project progress dynamically
    const allTasks = await prisma.task.findMany({ where: { projectId: task.projectId } });
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED');
    const newProgress = Math.round((completedTasks.length / (allTasks.length || 1)) * 100);

    await prisma.project.update({
      where: { id: task.projectId },
      data: {
        progress: newProgress,
        lastActiveAt: new Date(),
      },
    });

    return task;
  }

  public static async deleteTask(taskId: string, actorId?: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return;

    await prisma.task.delete({ where: { id: taskId } });
    await prisma.activity.create({
      data: {
        projectId: task.projectId,
        type: 'TASK_DELETED',
        title: `Task Removed: ${task.title}`,
        entityType: 'TASK',
        entityId: task.id,
        actorId,
      },
    });
  }

  public static async createDecision(projectId: string, data: any, actorName: string, actorId?: string) {
    const decision = await prisma.decision.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        madeBy: data.madeBy || actorName,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    await prisma.activity.create({
      data: {
        projectId,
        type: 'DECISION_RECORDED',
        title: `Decision: ${decision.title}`,
        description: decision.description,
        entityType: 'DECISION',
        entityId: decision.id,
        actorId,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { lastActiveAt: new Date() },
    });

    return decision;
  }

  public static async deleteDecision(decisionId: string, actorId?: string) {
    const dec = await prisma.decision.findUnique({ where: { id: decisionId } });
    if (!dec) return;

    await prisma.decision.delete({ where: { id: decisionId } });
    await prisma.activity.create({
      data: {
        projectId: dec.projectId,
        type: 'DECISION_DELETED',
        title: `Decision Archived: ${dec.title}`,
        entityType: 'DECISION',
        entityId: dec.id,
        actorId,
      },
    });
  }

  public static async createDocument(projectId: string, data: any, actorId?: string) {
    const doc = await prisma.document.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        type: data.type || 'DOC',
        url: data.url,
      },
    });

    await prisma.activity.create({
      data: {
        projectId,
        type: 'DOC_UPDATED',
        title: `Document Added: ${doc.title}`,
        description: `Type: ${doc.type}. ${doc.description || ''}`,
        entityType: 'DOCUMENT',
        entityId: doc.id,
        actorId,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { lastActiveAt: new Date() },
    });

    return doc;
  }

  public static async deleteDocument(docId: string, actorId?: string) {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) return;

    await prisma.document.delete({ where: { id: docId } });
    await prisma.activity.create({
      data: {
        projectId: doc.projectId,
        type: 'DOC_DELETED',
        title: `Document Removed: ${doc.title}`,
        entityType: 'DOCUMENT',
        entityId: doc.id,
        actorId,
      },
    });
  }

  public static async createMeeting(projectId: string, data: any, actorId?: string) {
    const meeting = await prisma.meeting.create({
      data: {
        projectId,
        title: data.title,
        summary: data.summary,
        date: data.date ? new Date(data.date) : new Date(),
        participants: data.participants || 'Team',
      },
    });

    await prisma.activity.create({
      data: {
        projectId,
        type: 'MEETING_LOGGED',
        title: `Meeting Logged: ${meeting.title}`,
        description: meeting.summary,
        entityType: 'MEETING',
        entityId: meeting.id,
        actorId,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { lastActiveAt: new Date() },
    });

    return meeting;
  }

  public static async recordSession(projectId: string, userId: string, lastViewedEntity?: string) {
    return prisma.projectSession.create({
      data: {
        projectId,
        userId,
        startedAt: new Date(),
        lastViewedEntity,
      },
    });
  }
}
