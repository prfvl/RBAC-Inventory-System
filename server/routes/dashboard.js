import express from 'express';
import { getDashboardStats, getLowStockAlerts, acknowledgeAlert, getAnalytics } from '../controllers/dashboardController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.get('/stats', verifyToken, getDashboardStats);
router.get('/analytics', verifyToken, checkRole(['Manager', 'Admin']), getAnalytics);
router.get('/low-stock', verifyToken, getLowStockAlerts);
router.patch('/alerts/:id/acknowledge', verifyToken, checkRole(['Manager', 'Admin']), acknowledgeAlert);

export default router;
