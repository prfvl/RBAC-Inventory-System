import fs from 'fs';
import { join } from 'path';
import Inventory from '../models/Inventory.js';
import express from 'express';
import { getInventory, getInventoryItem, createItem, updateStock, updatePrice, softDeleteItem, hardDeleteItem, restoreItem, getDeletedItems, exportInventory } from '../controllers/inventoryController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole, requireMinRole } from '../middleware/checkRole.js';
import auditLogger from '../middleware/auditLogger.js';
import { validateCreateItem } from '../validators/inventoryValidator.js';
import upload from '../middleware/upload.js';
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
// Image upload — Admin/Manager only
router.post(
    '/:id/image',
    verifyToken,
    checkRole(['Manager', 'Admin']),
    upload.single('image'),
    async (req, res) => {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Delete old image file if it exists
        if (item.imageUrl) {
            const oldPath = join(process.cwd(), item.imageUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        item.imageUrl = `/uploads/${req.file.filename}`;
        await item.save();
        res.json({ imageUrl: item.imageUrl });
    }
);
export default router;
