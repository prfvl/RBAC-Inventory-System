import express from 'express';
import { getAuditLogs, getLogsByUser, getLogsByItem } from '../controllers/auditController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.get('/', verifyToken, checkRole(['Manager', 'Admin']), getAuditLogs);
router.get('/user/:userId', verifyToken, checkRole('Admin'), getLogsByUser);
router.get('/item/:itemId', verifyToken, checkRole(['Manager', 'Admin']), getLogsByItem);

export default router;
