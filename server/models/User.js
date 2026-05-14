import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  passwordHash:  { type: String, required: true },
  role:          { type: String, enum: ['Viewer', 'Manager', 'Admin'], default: 'Viewer' },
  isActive:      { type: Boolean, default: true },
  lastLogin:     { type: Date },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
