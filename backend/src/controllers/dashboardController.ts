import { Response } from 'express';
import { AuthRequest } from '../types';
import { ProjectService } from '../services/projectService';

export class DashboardController {
  public static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'User context missing.' });
        return;
      }

      const dashboardData = await ProjectService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve dashboard: ' + err.message });
    }
  }
}
