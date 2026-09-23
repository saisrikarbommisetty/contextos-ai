import { Response } from 'express';
import { AuthRequest } from '../types';
import { ProjectService } from '../services/projectService';
import { GraphBuilder } from '../services/context/graphBuilder';
import { ContextEngine } from '../services/context/contextEngine';
import prisma from '../config/prisma';

export class ProjectController {
  public static async getAllProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }
      const projects = await ProjectService.getAllProjects(userId);
      res.status(200).json({ success: true, data: projects });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }
      const { name, description, status } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Project name is required.' });
        return;
      }

      const project = await ProjectService.createProject({ name: name.trim(), description, status }, userId);
      res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const updated = await ProjectService.updateProject(id, req.body, userId);
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.deleteProject(id, userId);
      res.status(200).json({ success: true, message: 'Project and all associated context deleted.' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const project = await ProjectService.getProjectById(id, userId);
      res.status(200).json({ success: true, data: project });
    } catch (err: any) {
      res.status(err.statusCode || 404).json({ success: false, error: err.message });
    }
  }

  public static async getProjectTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const tasks = await prisma.task.findMany({
        where: { projectId: id },
        include: { assignee: true },
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      });
      res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const task = await ProjectService.createTask(id, req.body, userId);
      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const task = await ProjectService.updateTask(taskId, req.body, userId);
      res.status(200).json({ success: true, data: task });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.deleteTask(taskId, userId);
      res.status(200).json({ success: true, message: 'Task deleted.' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectDocuments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const docs = await prisma.document.findMany({
        where: { projectId: id },
        orderBy: { updatedAt: 'desc' },
      });
      res.status(200).json({ success: true, data: docs });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async createDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const doc = await ProjectService.createDocument(id, req.body, userId);
      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async deleteDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { docId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.deleteDocument(docId, userId);
      res.status(200).json({ success: true, message: 'Document deleted.' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectMeetings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const meetings = await prisma.meeting.findMany({
        where: { projectId: id },
        orderBy: { date: 'desc' },
      });
      res.status(200).json({ success: true, data: meetings });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async createMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const meeting = await ProjectService.createMeeting(id, req.body, userId);
      res.status(201).json({ success: true, data: meeting });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectDecisions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const decisions = await prisma.decision.findMany({
        where: { projectId: id },
        orderBy: { date: 'desc' },
      });
      res.status(200).json({ success: true, data: decisions });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async createDecision(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      const decision = await ProjectService.createDecision(id, req.body, req.user?.name || 'Project Team', userId);
      res.status(201).json({ success: true, data: decision });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async deleteDecision(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { decisionId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.deleteDecision(decisionId, userId);
      res.status(200).json({ success: true, message: 'Decision deleted.' });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const activities = await prisma.activity.findMany({
        where: { projectId: id },
        orderBy: { timestamp: 'desc' },
        take: 30,
      });
      res.status(200).json({ success: true, data: activities });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getContextGraph(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const graph = await GraphBuilder.buildProjectGraph(id);
      res.status(200).json({ success: true, data: graph });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }

  public static async getChanges(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ProjectService.verifyProjectAccess(id, userId);
      const contextPackage = await ContextEngine.buildContextPackage(id, userId);

      res.status(200).json({
        success: true,
        data: {
          projectId: contextPackage.projectId,
          projectName: contextPackage.projectName,
          lastSession: contextPackage.lastSession,
          changes: contextPackage.recentChanges,
          openLoops: contextPackage.openLoops,
          contextHealth: contextPackage.contextHealth,
        },
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  }
}
