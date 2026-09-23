import prisma from '../config/prisma';

export class ProjectService {
  /**
   * Enforces strict server-side project authorization
   * @param projectId ID of the project
   * @param userId ID of the requesting user
   * @param requireOwnership If true, only the project owner can perform this operation
   */
  public static async verifyProjectAccess(projectId: string, userId: string, requireOwnership = false) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: { select: { assigneeId: true } },
      },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const isOwner = project.ownerId === userId;
    const isAssignee = project.tasks.some((t) => t.assigneeId === userId);
    const isDemoProject = project.ownerId === 'user-demo-01';
    const isDemoUser = userId === 'user-demo-01';

    if (requireOwnership) {
      if (!isOwner) {
        const err = new Error('Forbidden: Only the project owner can perform this action.');
        (err as any).statusCode = 403;
        throw err;
      }
      return project;
    }

    // Read access: Owner, Assignee, Demo user, or viewing a public demo project
    if (!isOwner && !isAssignee && !isDemoUser && !isDemoProject) {
      const err = new Error('Forbidden: You do not have permission to access this project.');
      (err as any).statusCode = 403;
      throw err;
    }

    return project;
  }

  /**
   * Retrieves high-level dashboard data strictly for the authenticated user
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

      // Dynamic Context Health calculation based on actual tasks and activities
      let healthScore = 100;
      if (openTasks.length > 0) {
        const blockerPenalty = blocked.length * 20;
        const progressBonus = Math.min(30, completed.length * 5);
        healthScore = Math.min(100, Math.max(30, 80 - blockerPenalty + progressBonus));
      }

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

    // Recent activities strictly from the user's projects
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

    // Recent decisions strictly from the user's projects
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
        contextRecoveredCount: projects.length > 0 ? Math.max(1, projects.length * 3) : 0,
      },
    };
  }

  /**
   * Retrieves all projects owned by the user
   */
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

  /**
   * Creates a new real project for the authenticated user
   */
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

    // Record activity
    await prisma.activity.create({
      data: {
        projectId: project.id,
        type: 'PROJECT_CREATED',
        title: `Project Initialized: ${project.name}`,
        description: `Workspace created. ContextOS continuity layer active.`,
        entityType: 'PROJECT',
        entityId: project.id,
        actorId: ownerId,
      },
    });

    // Record initial session
    await prisma.projectSession.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        startedAt: new Date(),
      },
    });

    return project;
  }

  /**
   * Updates an existing project with authorization check
   */
  public static async updateProject(projectId: string, data: { name?: string; description?: string; status?: string; progress?: number }, userId: string) {
    await this.verifyProjectAccess(projectId, userId, true);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        progress: data.progress,
        lastActiveAt: new Date(),
      },
    });

    await prisma.activity.create({
      data: {
        projectId,
        type: 'PROJECT_EDITED',
        title: `Project Details Updated`,
        description: `Status: ${updated.status}, Progress: ${updated.progress}%`,
        entityType: 'PROJECT',
        entityId: projectId,
        actorId: userId,
      },
    });

    return updated;
  }

  /**
   * Deletes a project with authorization check
   */
  public static async deleteProject(projectId: string, userId: string) {
    await this.verifyProjectAccess(projectId, userId, true);

    return prisma.project.delete({
      where: { id: projectId },
    });
  }

  /**
   * Retrieves full workspace data for a project with authorization check
   */
  public static async getProjectById(projectId: string, userId: string) {
    await this.verifyProjectAccess(projectId, userId);

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
          take: 30,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!project) {
      const err = new Error(`Project ${projectId} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    // Auto-record user session when opening project
    await this.recordSession(projectId, userId, 'project:view');

    return project;
  }

  /**
   * Creates a task with project authorization
   */
  public static async createTask(projectId: string, data: any, actorId: string) {
    await this.verifyProjectAccess(projectId, actorId);

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

    // Auto calculate project progress
    const allTasks = await prisma.task.findMany({ where: { projectId } });
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED');
    const newProgress = Math.round((completedTasks.length / (allTasks.length || 1)) * 100);

    // Record activity
    await prisma.activity.create({
      data: {
        projectId,
        type: 'TASK_CREATED',
        title: `Task Created: ${task.title}`,
        description: task.description || `Priority: ${task.priority}, Status: ${task.status}`,
        entityType: 'TASK',
        entityId: task.id,
        actorId,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { lastActiveAt: new Date(), progress: newProgress },
    });

    return task;
  }

  /**
   * Updates a task with authorization
   */
  public static async updateTask(taskId: string, data: any, actorId: string) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      const err = new Error('Task not found');
      (err as any).statusCode = 404;
      throw err;
    }

    await this.verifyProjectAccess(existing.projectId, actorId);

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
        title: `${data.status === 'COMPLETED' ? 'Task Completed' : 'Task Updated'}: ${task.title}`,
        description: `Status: ${task.status}, Priority: ${task.priority}`,
        entityType: 'TASK',
        entityId: task.id,
        actorId,
      },
    });

    // Recalculate project progress
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

  /**
   * Deletes a task with authorization
   */
  public static async deleteTask(taskId: string, actorId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return;

    await this.verifyProjectAccess(task.projectId, actorId, true);

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

    // Recalculate progress
    const allTasks = await prisma.task.findMany({ where: { projectId: task.projectId } });
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED');
    const newProgress = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

    await prisma.project.update({
      where: { id: task.projectId },
      data: { lastActiveAt: new Date(), progress: newProgress },
    });
  }

  /**
   * Records a decision with authorization
   */
  public static async createDecision(projectId: string, data: any, actorName: string, actorId: string) {
    await this.verifyProjectAccess(projectId, actorId);

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

  /**
   * Deletes a decision with authorization
   */
  public static async deleteDecision(decisionId: string, actorId: string) {
    const dec = await prisma.decision.findUnique({ where: { id: decisionId } });
    if (!dec) return;

    await this.verifyProjectAccess(dec.projectId, actorId, true);

    await prisma.decision.delete({ where: { id: decisionId } });
    await prisma.activity.create({
      data: {
        projectId: dec.projectId,
        type: 'DECISION_DELETED',
        title: `Decision Removed: ${dec.title}`,
        entityType: 'DECISION',
        entityId: dec.id,
        actorId,
      },
    });
  }

  /**
   * Creates a document with authorization
   */
  public static async createDocument(projectId: string, data: any, actorId: string) {
    await this.verifyProjectAccess(projectId, actorId);

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

  /**
   * Deletes a document with authorization
   */
  public static async deleteDocument(docId: string, actorId: string) {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) return;

    await this.verifyProjectAccess(doc.projectId, actorId, true);

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

  /**
   * Creates a meeting with authorization
   */
  public static async createMeeting(projectId: string, data: any, actorId: string) {
    await this.verifyProjectAccess(projectId, actorId);

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

  /**
   * Records working session
   */
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
