import mongoose, { Schema, Document } from 'mongoose';

interface IKycRejectionReason extends Document {
  doctorId: string;
  reason: string;
  date: Date;
}

const KycRejectionReasonSchema: Schema = new Schema({
  doctorId: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const KycRejectionReasonModel = mongoose.model<IKycRejectionReason>(
  'KycRejectionReason',
  KycRejectionReasonSchema
);

export default KycRejectionReasonModel;