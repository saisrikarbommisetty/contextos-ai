import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthenticatedUser } from '../types';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'contextos_jwt_secure_secret_key_hackathon_2026';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // In DEMO_MODE, if no token is passed, allow fallback to demo user if available
      if (process.env.DEMO_MODE === 'true') {
        const demoUser = await prisma.user.findUnique({
          where: { email: 'demo@contextos.ai' },
        });
        if (demoUser) {
          req.user = {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            avatar: demoUser.avatar,
          };
          return next();
        }
      }
      res.status(401).json({ success: false, error: 'Access token required. Please log in.' });
      return;
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err || !decoded?.userId) {
        res.status(403).json({ success: false, error: 'Invalid or expired session token.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'User associated with token not found.' });
        return;
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };

      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Authentication internal failure.' });
  }
};
