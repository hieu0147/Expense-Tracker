import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId; // Optional: If null/undefined, it's a default category
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    icon: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
