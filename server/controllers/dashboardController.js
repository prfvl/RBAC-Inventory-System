import Inventory from '../models/Inventory.js';
import AuditLog from '../models/AuditLog.js';
import Alert from '../models/Alert.js';

export const getDashboardStats = async (req, res) => {
  const [totalItems, lowStockItems, totalValue, recentActivity] = await Promise.all([
    Inventory.countDocuments({ isDeleted: false }),
    Inventory.find({ $expr: { $lte: ['$quantity', '$minThreshold'] }, isDeleted: false })
              .select('name sku quantity minThreshold'),
    Inventory.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name'),
  ]);

  res.json({
    totalItems,
    lowStockCount:    lowStockItems.length,
    lowStockItems,
    totalInventoryValue: totalValue[0]?.total || 0,
    recentActivity,
  });
};

export const getAnalytics = async (req, res) => {
  const [byCategory, topItems] = await Promise.all([
    Inventory.aggregate([
      { $match: { isDeleted: false } },
      { $group: {
          _id: '$category',
          totalValue:    { $sum: { $multiply: ['$quantity', '$price'] } },
          itemCount:     { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
      }},
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $sort: { totalValue: -1 } },
    ]),
    Inventory.find({ isDeleted: false })
      .sort({ $expr: { $multiply: ['$quantity', '$price'] } })
      .limit(10)
      .select('name sku quantity price'),
  ]);

  res.json({ byCategory, topItems });
};

export const getLowStockAlerts = async (req, res) => {
  const alerts = await Alert.find({ acknowledged: false }).populate('itemId', 'name sku quantity minThreshold');
  res.json(alerts);
};

export const acknowledgeAlert = async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  
  alert.acknowledged = true;
  alert.acknowledgedBy = req.user.userId;
  alert.acknowledgedAt = new Date();
  await alert.save();
  
  res.json(alert);
};
