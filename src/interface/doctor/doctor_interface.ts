import mongoose, { Types } from "mongoose";

export interface Interface_Doctor{
    _id?: Types.ObjectId;
    id?: string; 
    name: string;
    phone: number;
    email: string;
    password: string;
    isBlocked?: boolean;
    kycStatus:String,
    specializations?: Types.ObjectId[];


}

export interface IOtp {
    _id?: mongoose.Types.ObjectId;
    otp: string;
    email: string;
    createdAt: Date;
    expiresAt: Date;
  }


  export interface IKYC extends Document {
    doctorId: Types.ObjectId;
    specializationId: Types.ObjectId[];
    profileImage: string,
    certificate: string
    aadhaarFrontSide: string,
    aadhaarBackSide: string,
    kycStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason: string
    kycSubmissionDate: Date;
    kycComments: string;
  }