import mongoose, { ObjectId, Types } from "mongoose";

export type userType={
    userId:string;
    name:string;
    email:string;
    phone:string;
    password:string;
    // createdAt:Date
   // confirmpassword:string


}
export interface User {
    userId: string;
    name: string;
    phone : string;
    email: string;
    isBlocked: boolean;
    
  
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
  