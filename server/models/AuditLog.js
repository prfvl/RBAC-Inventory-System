import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:     { type: String, required: true },
  userRole:     { type: String, required: true },
  action:       {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'ROLE_CHANGE', 'EXPORT'],
    required: true
  },
  targetModel:  { type: String, enum: ['Inventory', 'User', 'Category'] },
  targetId:     { type: mongoose.Schema.Types.ObjectId },
  targetName:   { type: String },
  changes: [{
    field:     { type: String },
    oldValue:  { type: mongoose.Schema.Types.Mixed },
    newValue:  { type: mongoose.Schema.Types.Mixed },
  }],
  ipAddress:    { type: String },
  userAgent:    { type: String },
  metadata:     { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model('AuditLog', auditLogSchema);
