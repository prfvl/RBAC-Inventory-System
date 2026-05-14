import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  itemId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  itemName:     { type: String },
  sku:          { type: String },
  quantity:     { type: Number },
  threshold:    { type: Number },
  severity:     { type: String, enum: ['WARNING', 'CRITICAL'], default: 'WARNING' },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt:  { type: Date },
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);
