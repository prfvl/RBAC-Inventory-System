const ROLE_HIERARCHY = { Viewer: 1, Manager: 2, Admin: 3 };

export const checkRole = (allowedRoles) => (req, res, next) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
    });
  }
  next();
};

export const requireMinRole = (minRole) => (req, res, next) => {
  if (ROLE_HIERARCHY[req.user.role] < ROLE_HIERARCHY[minRole]) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};
