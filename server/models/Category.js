import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String },
  color:       { type: String, default: '#6B7280' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
