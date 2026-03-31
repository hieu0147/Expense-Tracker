import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpToken extends Document {
  userId: mongoose.Types.ObjectId;
  otp: string;
  expiresAt: Date;
}

const OtpTokenSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // This will automatically delete the document when expiresAt is reached
  },
});

export const OtpToken = mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);
