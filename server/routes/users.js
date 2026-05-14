import express from 'express';
import { getUsers, assignRole, updateStatus, deleteUser } from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import auditLogger from '../middleware/auditLogger.js';

const router = express.Router();

router.use(verifyToken, checkRole('Admin'));

router.get('/', getUsers);
router.patch('/:id/role', auditLogger('ROLE_CHANGE'), assignRole);
router.patch('/:id/status', auditLogger('UPDATE'), updateStatus);
router.delete('/:id', auditLogger('DELETE'), deleteUser);

export default router;
