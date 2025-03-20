import { Schema, model } from 'mongoose';
import { IOtp } from '../interface/userInterface/interface';

const otpSchema = new Schema<IOtp>({
    otp: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });


otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = model<IOtp>('otp', otpSchema);
export default OtpModel;