import mongoose, { ObjectId, Types } from "mongoose";
import { Document } from "mongoose";
  
  export interface IUser  {
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

  export interface IUsers  {
    _id: mongoose.Types.ObjectId;
    id?: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    dob?: string;
    image?: string;
    gender?: string;
    isBlocked: boolean;
  }
  export interface JwtPayload {
    email: string;
    name: string;
    iat: number;
    exp: number;
  }
  export interface JwtPayloads {
    email: string;
    name: string;
    // iat: number;
    // exp: number;
  }

  export interface IOtp{
    _id?:mongoose.Types.ObjectId,
    otp:string,
    email:string,
    createdAt:Date,
    expiresAt:Date
  }
  export interface IBooking {
      _id?: mongoose.Types.ObjectId;
      appoinmentId: mongoose.Types.ObjectId;
      doctorId: mongoose.Types.ObjectId;
      userId: mongoose.Types.ObjectId |  { name: string; email: string }
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

  export interface IMessage {
    senderId: string;
    receiverId: string;
    message: string;
    createdAt?: Date;
  }

  export interface ITransaction {
    amount: number;             
    transactionId: string;      
    transactionType: 'credit' | 'debit';
    date?: Date;                
    bookingId?: string;         
}

export  interface IReview {
  userId: mongoose.Types.ObjectId
  doctorId: mongoose.Types.ObjectId
  rating: number
  comment: string
}
  

