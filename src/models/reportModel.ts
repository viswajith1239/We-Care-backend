
import mongoose, { Schema,model } from 'mongoose';
import { IReportData } from '../interface/userInterface/interface';

const reportSchema = new Schema<IReportData>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId:{type: mongoose.Schema.Types.ObjectId, ref:'Doctor'},
    userName: { type: String },
    userEmail: { type: String },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const ReportModel=model<IReportData>('MedicalReport',reportSchema)
export default ReportModel
