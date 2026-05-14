import AuditLog from '../models/AuditLog.js';

const auditLogger = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await AuditLog.create({
          userId:     req.user.userId,
          userName:   req.user.name,
          userRole:   req.user.role,
          action,
          targetModel: 'Inventory',
          targetId:    req.params.id || data?._id,
          targetName:  data?.name,
          ipAddress:   req.ip,
          userAgent:   req.headers['user-agent'],
          metadata:    req.body,
        });
      } catch (e) {
        console.error('Audit log failed:', e.message);
      }
    }
    originalJson(data);
  };
  next();
};

export default auditLogger;
