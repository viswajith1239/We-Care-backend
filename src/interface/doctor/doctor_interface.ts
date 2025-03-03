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
    profileImage:string,
    isKycApproved:boolean


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

  export interface IAppoinment {
    _id: number;
    save(): unknown;
    doctorId: Types.ObjectId;
    specializationId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    selectedDate: Date;
    startTime: string;
    endTime: string;
    // isSingleSession: boolean;
    type:string
    // SessionType:string
    numberOfAppoinments: number;
    price: number | undefined
    isBooked: boolean,
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'InProgress';
    paymentIntentId?: string; 
  }

  export interface ISpecialization {
    _id: Types.ObjectId;
    name: string;
  }
  
  export interface IDoctorKYC extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    kycData: IKYC; // Embedded KYC data
  }
  