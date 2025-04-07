// models/Prescription.ts

import mongoose, { Schema, Document } from 'mongoose';

interface IPrescription extends Document {
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  prescriptions: {
    medicineName: string;
    description: string;
  }[];
  createdAt: Date;
}

const PrescriptionSchema: Schema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  prescriptions: [
    {
      medicineName: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
