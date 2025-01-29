import { Schema, model } from "mongoose";
import { IKYC } from '../interface/doctor/doctor_interface';
const kycSchema = new Schema<IKYC>({
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: false },
    specializationId: [{ type: Schema.Types.ObjectId, ref: 'ISpecialization', required: false }],
    profileImage: { type: String, required: true },
    aadhaarFrontSide: { type: String, required: true },
    aadhaarBackSide: { type: String, required: true },
    certificate: { type: String, required: true },
    kycStatus: { type: String, enum: ['pending', 'approved', 'submitted', 'rejected'], default: 'pending' },
    kycSubmissionDate: { type: Date, default: Date.now },
    kycComments: { type: String, required: false },
}, { timestamps: true });

const KYCModel = model<IKYC>("KYC", kycSchema);
export default KYCModel