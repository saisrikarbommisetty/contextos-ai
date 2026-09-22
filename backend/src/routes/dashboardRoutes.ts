import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, DashboardController.getDashboard);

export default router;
