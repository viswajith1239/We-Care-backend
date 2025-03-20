import { Document } from "mongoose";
import { User, userType,} from "../userInterface/interface";
import { IUser,IOtp,IBooking,IUsers} from "../common";
import mongoose, { Types } from "mongoose";
import { Interface_Doctor, IAppoinment } from "../doctor/doctor_interface";

export interface IAuthRepository {
    existUser(email:string,phone:string): Promise<{ existEmail: boolean; existPhone: boolean }>;
    createUser(userData: userType): Promise<Document>;
    existingUser(email: string): Promise<IUser | null>;
    findUserById(userId: string): Promise<IUsers | null>;
    // userCheck(email:string): Promise<UserProfile | null>; 
    saveOTP(email: string, OTP: string, OTPExpirey: Date):Promise<void>
    getOtpsByEmail(email: string):Promise<IOtp[]|[]>
    deleteOtpById(otpId?: mongoose.Types.ObjectId):Promise<void>
    createNewUser(userData: IUser):Promise<void>
    findUser(email: string):Promise<IUser | null>
    createUsers(user: {email: string; name: string; password: string | null; }):Promise<any>
    createUser(userData: IUser): Promise<Document>;
    findUserEmail(email: string):Promise<any>
    saveResetPassword(email: string, hashedPassword: string):Promise<any>
    getAllDoctors():Promise<any>
    getDoctor(doctorId: string):Promise<Interface_Doctor[]|undefined>
    fetchAllAppoinmentschedules():Promise<IAppoinment>
    findSessionDetails(appoinmentid:string):Promise<any>
    findExistingBooking(bookingDetails:IBooking):Promise<any>
    createBooking(bookingDetails:IBooking):Promise<IBooking>
    fetchSpecializations():Promise<any>
    fetchUserData(userId:string):Promise<User|null>
    editUserData(userId:string,userData:User):Promise<any>
    fetchBookings(user_id:string):Promise<any>
    cancelAppoinment(bookId:string,userId:string,doctorId:string):Promise<any>
    getbookedDoctor(userId:string):Promise<any>
    
 };