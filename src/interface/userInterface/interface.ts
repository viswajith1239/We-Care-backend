import mongoose, { ObjectId, Types } from "mongoose";
import Stripe from "stripe";

export type userType = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  // createdAt:Date
  // confirmpassword:string


}
export interface User {
  userId: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  dob?: string
  gender?: string,
  _id?: string;
  id?: string;
  password?: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;


}

export interface UserProfile {
  image: {
    url: string;
    type: string;
  };
  _id: ObjectId;
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  DOB: Date;
  address: string;
  isBlocked: boolean;

}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  email: string;
  phone: number;
  password: string;
  dob?: string;
  image?: string;
  gender?: string;
  isBlocked: boolean;
}


export interface IOtp {
  _id?: mongoose.Types.ObjectId;
  otp: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ILoginUser {
  email: string;
  password: string;
}
export interface JwtPayload {
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface IBooking {
  _id?: mongoose.Types.ObjectId;
  appoinmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | { name: string; email: string }
  specialization?: string;

  bookingDate: Date;
  startDate: Date;
  // endDate: Date; 
  startTime: string;
  endTime: string;
  amount: number | undefined;
  paymentStatus: "Confirmed" | "Cancelled" | "Completed";
  createdAt: Date;
  updatedAt: Date;
  payment_intent?: string;



}


export interface IBookings {
  _id?: mongoose.Types.ObjectId;
  appoinmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | { name: string; email: string };
  specialization?: string;
  bookingDate: Date;
  startDate: Date;
  startTime: string;
  endTime: string;
  amount: number | undefined;
  paymentStatus: "Confirmed" | "Cancelled" | "Completed";
  createdAt: Date;
  updatedAt: Date;
  payment_intent?: string;
}


export interface BookingListResponse {
  bookings: IBookings[];
  pagination: Pagination;
}


export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}


export interface IReportData {
  _id: any;
  userId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  imageUrl: string;
}


export interface cancelBooking {
  _id: Types.ObjectId;
  appoinmentId: Types.ObjectId;
  doctorId: Types.ObjectId;
  userId: Types.ObjectId| { name: string; email: string };
  bookingDate: Date;
  startDate: Date;
  startTime: string;
  endTime: string;
  amount: number|undefined;
  paymentStatus: "Confirmed" | "Cancelled"|"Completed";
  payment_intent?: string|undefined;
  createdAt: Date;
  updatedAt: Date;
  
}

export type CancelAppointmentResponse =
  | cancelBooking
  | {
      success: boolean;
      message: string;
      booking: cancelBooking;
      refund: Stripe.Response<Stripe.Refund>;
    }
  | {
      success: boolean;
      message: string;
      booking: cancelBooking;
      error: unknown;
    };


export interface Specialization {
  _id: Types.ObjectId;
  name: string;
  description: string;
  isListed: boolean;
  createdAt: Date;
  __v: number;
}



export interface Doctor {
  _id: mongoose.Types.ObjectId; 
  name: string;
  email: string;
  phone: number;
  password: string;
  specializations: string[]; 
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  kycStatus: 'pending' | 'approved' | 'rejected'; 
  profileImage: string;
  isKycApproved: boolean;
  yearsOfExperience: number;
}


export interface IReportDatas {
  _id: mongoose.Types.ObjectId; 
  userId: mongoose.Types.ObjectId; 
  doctorId: mongoose.Types.ObjectId; 
  userName: string;
  userEmail: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}


export interface IDoctors {
  _id: ObjectId;
  name: string;
  email: string;
  phone: number;
  password: string;
  specializations: ObjectId[];
  isBlocked: boolean;
  isKycApproved: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected'; 
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  profileImage: string;
}


export interface UpdateResult {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: any | null;
  upsertedCount: number;
  matchedCount: number;
}


export interface userProfileUpdate {
  _id: mongoose.Types.ObjectId; 
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked: boolean;
  createdAt: string;
  profileImage: string;
  dob?: string;
  gender?: string;
  address?:string
}

