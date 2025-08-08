import mongoose, { Schema, Types } from "mongoose";

export interface Interface_Doctor {
  _id?: Types.ObjectId;
  id?: string;
  name: string;
  phone: number;
  email: string;
  password: string;
  isBlocked?: boolean;
  kycStatus: String,
  specializations?: Types.ObjectId[];
  profileImage: string,
  isKycApproved: boolean
  gender?: 'male' | 'female' | 'other' | '';
  yearsOfExperience?: number;
  language?: string;
  about?: string


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

// export interface IAppoinment {
//   _id: number;
//   save(): unknown;
//   doctorId: Types.ObjectId;
//   specializationId: Types.ObjectId;
//   startDate: Date;
//   endDate: Date;
//   selectedDate: Date;
//   startTime: string;
//   endTime: string;

//   type:string

//   numberOfAppoinments: number;
//   price: number | undefined
//   isBooked: boolean,
//   status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'InProgress';
//   paymentIntentId?: string; 
// }

export interface IAppoinment {
  doctorId: Schema.Types.ObjectId;
  specializationId?: Schema.Types.ObjectId;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  price: number;
  isBooked?: boolean;
  status?: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "InProgress";
  paymentIntentId?: string;

  // New recurring appointment fields
  isRecurring?: boolean;
  recurrenceType?: "None" | "Daily" | "Weekly" | "Monthly";
  recurrenceInterval?: number;
  recurrenceEnd?: Date;
  daysOfWeek?: number[];

}

export interface ISpecialization {
  _id: Types.ObjectId;
  name: string;
}

export interface IDoctorKYC extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  kycData: IKYC;
}

export interface IWallet {
  doctorId: string;
  balance: number;
  transactions: any[];
}

export interface PaginatedWalletResponse {
  walletData: IWallet | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    tatalTransctions: number
  };
}


export interface IPaginatedWallet {
  doctorId: string;
  balance: number;
  transactions: [];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
}
export interface IDoctor {
  _id?: Types.ObjectId;
  id?: string;
  name: string;
  phone: number;
  email: string;
  password: string;
  dob?: string;
  profileImage?: string;
  gender?: 'male' | 'female' | 'other' | '';
  yearsOfExperience?: number;
  language?: string;
  specializations: Types.ObjectId[];
  about?: string
  dailySessionLimit: number
  kycStatus: 'pending' | 'approved' | 'submitted' | 'rejected';
  isBlocked?: boolean;
}

export interface PrescriptionData {
  doctorId: string;
  userId: string;
  bookingId?: string;
  // specializationId?: string;
  prescriptions: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instruction: string;
  }[];
}

export interface IReportData {
  _id: any;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  imageUrl: string;
}


export interface IDoctorDocument {
    _id: string;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

