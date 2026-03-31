import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
  note?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Index for getting transactions quickly by userId and date descending
TransactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
