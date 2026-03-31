import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  warningSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['MONTHLY', 'YEARLY'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    warningSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, categoryId: 1, startDate: -1 });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);
