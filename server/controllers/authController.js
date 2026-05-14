import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { createClient } from 'redis';

const redisClient = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null;
if (redisClient) {
  redisClient.connect().catch(console.error);
}

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, passwordHash, role: role || 'Viewer' });

  await AuditLog.create({
    userId: req.user?.userId || user._id,
    userName: req.user?.name || user.name,
    userRole: req.user?.role || 'Admin',
    action: 'CREATE',
    targetModel: 'User',
    targetId: user._id,
    targetName: user.email,
    ipAddress: req.ip,
  });

  res.status(201).json({ message: 'User registered', userId: user._id });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  user.lastLogin = new Date();
  await user.save();

  await AuditLog.create({
    userId: user._id, userName: user.name, userRole: user.role,
    action: 'LOGIN', ipAddress: req.ip, userAgent: req.headers['user-agent'],
  });

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user || !user.isActive) return res.status(403).json({ message: 'Forbidden' });

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && redisClient) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      if (decoded && decoded.jti) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisClient.setEx(`blocklist:${decoded.jti}`, ttl, '1');
        }
      }
    }
  } catch (e) {
    console.error('Logout blocklist failed', e);
  }

  res.clearCookie('refreshToken');

  if (req.user) {
    await AuditLog.create({
      userId: req.user.userId, userName: req.user.name, userRole: req.user.role,
      action: 'LOGOUT', ipAddress: req.ip,
    });
  }

  res.json({ message: 'Logged out successfully' });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
