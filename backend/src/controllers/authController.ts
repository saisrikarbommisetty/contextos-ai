import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'contextos_jwt_secure_secret_key_hackathon_2026';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ success: false, error: 'An account with this email already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role || 'Lead Engineer',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        },
      });

      // Provision starter workspace for immediate continuity exploration
      const starterProject = await prisma.project.create({
        data: {
          name: `${name.split(' ')[0]}'s Workspace`,
          description: 'Production application continuity workspace with automated context tracking and AI recovery.',
          status: 'In Progress',
          progress: 55,
          ownerId: user.id,
        },
      });

      // Create starter tasks
      await prisma.task.createMany({
        data: [
          {
            title: 'Initialize repository and CI deployment pipeline',
            description: 'Set up Vite, TypeScript, and automated testing workflows.',
            status: 'COMPLETED',
            priority: 'HIGH',
            projectId: starterProject.id,
            assigneeId: user.id,
          },
          {
            title: 'Implement Core Authentication & User Session Management',
            description: 'Implement JWT session security and role-based permissions.',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            projectId: starterProject.id,
            assigneeId: user.id,
          },
          {
            title: 'Resolve Staging Environment CORS & Secret Configuration',
            description: 'Staging build failed due to missing environment secrets in hosting dashboard.',
            status: 'BLOCKED',
            priority: 'CRITICAL',
            projectId: starterProject.id,
            assigneeId: user.id,
          },
        ],
      });

      // Create starter decision
      await prisma.decision.create({
        data: {
          title: 'ADR-01: Adopt JWT Auth & Modular AI Context Layer',
          description: 'Decided on stateless JWT tokens for zero-downtime scaling and Google Gemini fallback architecture.',
          madeBy: name,
          projectId: starterProject.id,
        },
      });

      // Create starter document
      await prisma.document.create({
        data: {
          title: 'System Architecture & Continuity Protocol',
          description: 'Technical specification for context reconstruction, entity relationship graphs, and AI handovers.',
          type: 'SPECIFICATION',
          url: 'https://docs.contextos.ai/specs/v1',
          projectId: starterProject.id,
        },
      });

      // Create starter activity
      await prisma.activity.create({
        data: {
          type: 'PROJECT_CREATED',
          title: 'Initialized ContextOS Workspace',
          description: `Welcome to ContextOS! Your continuity layer is active for ${starterProject.name}.`,
          projectId: starterProject.id,
          actorId: user.id,
        },
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
    }
  }

  public static async demoLogin(req: Request, res: Response): Promise<void> {
    try {
      let demoUser = await prisma.user.findUnique({ where: { email: 'demo@contextos.ai' } });
      if (!demoUser) {
        const passwordHash = await bcrypt.hash('contextos123', 10);
        demoUser = await prisma.user.create({
          data: {
            id: 'user-demo-01',
            name: 'Sai Krishna',
            email: 'demo@contextos.ai',
            passwordHash,
            role: 'Lead Full-Stack Engineer',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
        });
      }

      const token = jwt.sign({ userId: demoUser.id, email: demoUser.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        token,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          avatar: demoUser.avatar,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Demo login failed: ' + err.message });
    }
  }

  public static async me(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated.' });
      return;
    }
    res.status(200).json({ success: true, user: req.user });
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
}
