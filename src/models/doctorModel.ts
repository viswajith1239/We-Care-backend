import { Schema, model, Types } from 'mongoose';
import { Interface_Doctor } from '../interface/doctor/doctor_interface';

const doctorSchema = new Schema<Interface_Doctor>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, },
    password: { type: String, },
    specializations: [{ type: Schema.Types.ObjectId, ref: 'ISpecialization' }],
    isBlocked: { type: Boolean, default: false },
    profileImage:{type:String,required:false},
    kycStatus:{type:String,enum:["pending","approved","submitted","rejected"],default:"pending"},
    isKycApproved: { type: Boolean, default: false },
  }, { timestamps: true ,collection: 'doctors'});
  
  const DoctorModel = model<Interface_Doctor>('Doctor', doctorSchema);  
  export default DoctorModel;