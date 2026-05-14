import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  sku:            { type: String, required: true, unique: true, uppercase: true },
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description:    { type: String },
  quantity:       { type: Number, required: true, default: 0, min: 0 },
  price:          { type: Number, required: true, min: 0 },
  costPrice:      { type: Number, min: 0 },
  location:       { type: String, trim: true },
  minThreshold:   { type: Number, default: 10 },
  unit:           { type: String, default: 'pcs' },
  supplier:       { type: String },
  imageUrl:       { type: String },
  tags:           [{ type: String }],
  isDeleted:      { type: Boolean, default: false },
  deletedAt:      { type: Date },
  deletedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

inventorySchema.index({ name: 'text', sku: 'text', tags: 'text' });

const PURGE_SECONDS = (parseInt(process.env.SOFT_DELETE_DAYS) || 30) * 86400;
inventorySchema.index({ deletedAt: 1 }, { expireAfterSeconds: PURGE_SECONDS, sparse: true });

export default mongoose.model('Inventory', inventorySchema);
