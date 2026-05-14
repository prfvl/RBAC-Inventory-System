import User from '../models/User.js';

export const getUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
};

export const assignRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.role = role;
  await user.save();
  res.json(user);
};

export const updateStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive = isActive;
  await user.save();
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};
