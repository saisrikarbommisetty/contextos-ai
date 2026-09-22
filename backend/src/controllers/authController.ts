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
          role: role || 'Developer',
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
