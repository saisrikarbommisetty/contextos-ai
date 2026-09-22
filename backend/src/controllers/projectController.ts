import { Response } from 'express';
import { AuthRequest } from '../types';
import { ProjectService } from '../services/projectService';
import { GraphBuilder } from '../services/context/graphBuilder';
import { ContextEngine } from '../services/context/contextEngine';
import prisma from '../config/prisma';

export class ProjectController {
  public static async getAllProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'user-demo-01';
      const projects = await ProjectService.getAllProjects(userId);
      res.status(200).json({ success: true, data: projects });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'User must be authenticated to create a project.' });
        return;
      }
      const { name, description, status } = req.body;
      if (!name) {
        res.status(400).json({ success: false, error: 'Project name is required.' });
        return;
      }

      const project = await ProjectService.createProject({ name, description, status }, userId);
      res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-01';
      await ProjectService.deleteProject(id, userId);
      res.status(200).json({ success: true, message: 'Project deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(id);
      res.status(200).json({ success: true, data: project });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  public static async getProjectTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tasks = await prisma.task.findMany({
        where: { projectId: id },
        include: { assignee: true },
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      });
      res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await ProjectService.createTask(id, req.body, req.user?.id);
      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const task = await ProjectService.updateTask(taskId, req.body, req.user?.id);
      res.status(200).json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      await ProjectService.deleteTask(taskId, req.user?.id);
      res.status(200).json({ success: true, message: 'Task deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectDocuments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const docs = await prisma.document.findMany({
        where: { projectId: id },
        orderBy: { updatedAt: 'desc' },
      });
      res.status(200).json({ success: true, data: docs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await ProjectService.createDocument(id, req.body, req.user?.id);
      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async deleteDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { docId } = req.params;
      await ProjectService.deleteDocument(docId, req.user?.id);
      res.status(200).json({ success: true, message: 'Document deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectMeetings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meetings = await prisma.meeting.findMany({
        where: { projectId: id },
        orderBy: { date: 'desc' },
      });
      res.status(200).json({ success: true, data: meetings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createMeeting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meeting = await ProjectService.createMeeting(id, req.body, req.user?.id);
      res.status(201).json({ success: true, data: meeting });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectDecisions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const decisions = await prisma.decision.findMany({
        where: { projectId: id },
        orderBy: { date: 'desc' },
      });
      res.status(200).json({ success: true, data: decisions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createDecision(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const decision = await ProjectService.createDecision(id, req.body, req.user?.name || 'Project Team', req.user?.id);
      res.status(201).json({ success: true, data: decision });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async deleteDecision(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { decisionId } = req.params;
      await ProjectService.deleteDecision(decisionId, req.user?.id);
      res.status(200).json({ success: true, message: 'Decision deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getProjectActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const activities = await prisma.activity.findMany({
        where: { projectId: id },
        orderBy: { timestamp: 'desc' },
        take: 30,
      });
      res.status(200).json({ success: true, data: activities });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getContextGraph(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const graph = await GraphBuilder.buildProjectGraph(id);
      res.status(200).json({ success: true, data: graph });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getChanges(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-01';
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
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
