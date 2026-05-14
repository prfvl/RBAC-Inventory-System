import Inventory from '../models/Inventory.js';
import AuditLog from '../models/AuditLog.js';
import { checkAndAlertLowStock } from '../utils/checkLowStock.js';
import { Parser } from 'json2csv';

export const getInventory = async (req, res) => {
  const { search, category, minQty, maxQty, page = 1, limit = 20, sort } = req.query;
  const query = { isDeleted: false };

  if (search)   query.$text = { $search: search };
  if (category) query.category = category;
  if (minQty !== undefined || maxQty !== undefined) {
    query.quantity = {};
    if (minQty !== undefined) query.quantity.$gte = Number(minQty);
    if (maxQty !== undefined) query.quantity.$lte = Number(maxQty);
  }

  const [sortField, sortOrder] = sort?.split(':') || ['createdAt', 'desc'];
  const sortObj = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Inventory.find(query).populate('category', 'name color').sort(sortObj)
             .skip((page - 1) * limit).limit(Number(limit)),
    Inventory.countDocuments(query),
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
};

export const getInventoryItem = async (req, res) => {
  const item = await Inventory.findById(req.params.id).populate('category');
  if (!item || item.isDeleted) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

export const createItem = async (req, res) => {
  const item = await Inventory.create({
    ...req.body,
    createdBy: req.user.userId,
    lastUpdatedBy: req.user.userId
  });
  res.status(201).json(item);
};

export const updateStock = async (req, res) => {
  const { quantity, location } = req.body;
  const item = await Inventory.findById(req.params.id);
  if (!item || item.isDeleted) return res.status(404).json({ message: 'Item not found' });

  const changes = [];

  if (quantity !== undefined && quantity !== item.quantity) {
    changes.push({ field: 'quantity', oldValue: item.quantity, newValue: quantity });
    item.quantity = quantity;
  }

  if (location !== undefined && location !== item.location) {
    changes.push({ field: 'location', oldValue: item.location, newValue: location });
    item.location = location;
  }

  item.lastUpdatedBy = req.user.userId;
  await item.save();

  if (changes.length > 0) {
    await AuditLog.create({
      userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
      action: 'UPDATE', targetModel: 'Inventory', targetId: item._id, targetName: item.name,
      changes,
      ipAddress: req.ip,
    });
  }

  await checkAndAlertLowStock(item);

  res.json(item);
};

export const updatePrice = async (req, res) => {
  const { price, costPrice } = req.body;
  const item = await Inventory.findById(req.params.id);
  if (!item || item.isDeleted) return res.status(404).json({ message: 'Item not found' });

  item.price = price !== undefined ? price : item.price;
  item.costPrice = costPrice !== undefined ? costPrice : item.costPrice;
  item.lastUpdatedBy = req.user.userId;
  
  await item.save();
  res.json(item);
};

const getPurgeDate = (deletedAt) => {
  const days = parseInt(process.env.SOFT_DELETE_DAYS) || 30;
  return new Date(deletedAt.getTime() + days * 86400 * 1000);
};

export const softDeleteItem = async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item || item.isDeleted) return res.status(404).json({ message: 'Item not found' });

  item.isDeleted  = true;
  item.deletedAt  = new Date();
  item.deletedBy  = req.user.userId;
  await item.save();

  await AuditLog.create({
    userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
    action: 'DELETE', targetModel: 'Inventory', targetId: item._id, targetName: item.name,
    ipAddress: req.ip,
  });

  res.json({ message: 'Item soft-deleted', purgesAt: getPurgeDate(item.deletedAt) });
};

export const hardDeleteItem = async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  await AuditLog.create({
    userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
    action: 'DELETE', targetModel: 'Inventory', targetId: item._id, targetName: item.name,
    metadata: { hardDelete: true },
    ipAddress: req.ip,
  });

  res.json({ message: 'Item permanently deleted' });
};

export const restoreItem = async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item || !item.isDeleted) return res.status(404).json({ message: 'Item not found or not deleted' });

  item.isDeleted = false;
  item.deletedAt = undefined;
  item.deletedBy = undefined;
  await item.save();

  await AuditLog.create({
    userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
    action: 'RESTORE', targetModel: 'Inventory', targetId: item._id, targetName: item.name,
    ipAddress: req.ip,
  });

  res.json(item);
};

export const getDeletedItems = async (req, res) => {
  const purgeDays = parseInt(process.env.SOFT_DELETE_DAYS) || 30;

  const items = await Inventory.find({ isDeleted: true })
    .populate('deletedBy', 'name')
    .sort({ deletedAt: -1 });

  const withCountdown = items.map(item => {
    const msRemaining = (item.deletedAt.getTime() + purgeDays * 86400 * 1000) - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86400000));
    return {
      ...item.toObject(),
      daysUntilPurge: daysRemaining,
      purgesAt: new Date(item.deletedAt.getTime() + purgeDays * 86400 * 1000),
    };
  });

  res.json(withCountdown);
};

export const exportInventory = async (req, res) => {
  const items = await Inventory.find({ isDeleted: false }).populate('category', 'name');
  const fields = ['name', 'sku', 'category.name', 'quantity', 'price', 'location', 'minThreshold'];
  const parser = new Parser({ fields });
  const csv = parser.parse(items.map(i => i.toObject({ virtuals: true })));

  await AuditLog.create({
    userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
    action: 'EXPORT', metadata: { format: 'CSV', count: items.length }, ipAddress: req.ip,
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('inventory_export.csv');
  res.send(csv);
};
