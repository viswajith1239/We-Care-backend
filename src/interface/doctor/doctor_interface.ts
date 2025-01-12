import mongoose, { Types } from "mongoose";

export interface Interface_Doctor{
    _id?: Types.ObjectId;
    id?: string; 
    name: string;
    phone: number;
    email: string;
    password: string;
    isBlocked?: boolean;
    specializations?: Types.ObjectId[];


}

export interface IOtp {
    _id?: mongoose.Types.ObjectId;
    otp: string;
    email: string;
    createdAt: Date;
    expiresAt: Date;
  }