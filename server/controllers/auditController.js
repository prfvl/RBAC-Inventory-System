import AuditLog from '../models/AuditLog.js';
import Inventory from '../models/Inventory.js';
import Alert from '../models/Alert.js';

export const getAuditLogs = async (req, res) => {
  const { action, role, from, to, page = 1, limit = 20, userId, itemId } = req.query;
  const query = {};

  if (action)  query.action   = action;
  if (role)    query.userRole = role;
  if (userId)  query.userId   = userId;
  if (itemId)  query.targetId = itemId;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to)   query.createdAt.$lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    AuditLog.countDocuments(query),
  ]);

  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
};

export const getLogsByUser = async (req, res) => {
  req.query.userId = req.params.userId;
  return getAuditLogs(req, res);
};

export const getLogsByItem = async (req, res) => {
  req.query.itemId = req.params.itemId;
  return getAuditLogs(req, res);
};
