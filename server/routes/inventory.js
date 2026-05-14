import express from 'express';
import { getInventory, getInventoryItem, createItem, updateStock, updatePrice, softDeleteItem, hardDeleteItem, restoreItem, getDeletedItems, exportInventory } from '../controllers/inventoryController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole, requireMinRole } from '../middleware/checkRole.js';
import auditLogger from '../middleware/auditLogger.js';
import { validateCreateItem } from '../validators/inventoryValidator.js';

const router = express.Router();

router.get('/', verifyToken, getInventory);
router.get('/export', verifyToken, checkRole(['Manager', 'Admin']), exportInventory);
router.get('/deleted', verifyToken, checkRole('Admin'), getDeletedItems);
router.get('/:id', verifyToken, getInventoryItem);

router.post('/', verifyToken, checkRole(['Manager', 'Admin']), validateCreateItem, auditLogger('CREATE'), createItem);
router.put('/:id', verifyToken, checkRole(['Manager', 'Admin']), updateStock);
router.patch('/:id/price', verifyToken, checkRole('Admin'), auditLogger('UPDATE'), updatePrice);
router.delete('/:id', verifyToken, checkRole(['Manager', 'Admin']), softDeleteItem);
router.delete('/:id/hard', verifyToken, checkRole('Admin'), hardDeleteItem);
router.patch('/:id/restore', verifyToken, checkRole('Admin'), restoreItem);

export default router;
