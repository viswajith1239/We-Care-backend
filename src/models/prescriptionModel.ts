

import mongoose, { Schema, Document, model } from 'mongoose';

interface IPrescription extends Document {
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookingId:mongoose.Types.ObjectId;
  prescriptions: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
  }[];
  createdAt: Date;
}

const PrescriptionSchema: Schema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  prescriptions: [
    {
      medicineName: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      instruction: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const PrescriptionModel = model<IPrescription>('Prescription', PrescriptionSchema);
export default PrescriptionModel
