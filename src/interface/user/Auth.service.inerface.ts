
import { User } from "../userInterface/interface";
import { IUser, JwtPayload } from "../common";

export interface IAuthService {
    signup(userData: {name: string;email: string;phone: string;password: string;confirmpassword: string;}): Promise<{token:string}>;
    verifyOTP(userData:IUser,otp:string):Promise<void>
    verifyForgotOTP(userData: string, otp: string):Promise<void>
    resendOTP(email: string):Promise<void>
    login(email: string, password: string):Promise<any>
    googleSignUpUser(decodedToken: JwtPayload):Promise<any>
    forgotpassword(emailData:string):Promise<any>
    resetapassword(userData: string, payload: { newPassword: string} ):Promise<any>
    getAllDoctors():Promise<any>
    getAppoinmentSchedules():Promise<any>
    getDoctor(doctorId:string):Promise<any>
    checkoutPayment(appoinmentid:string,userId:string):Promise<any>
    findBookingDetails(session_id: string, user_id: string, stripe_session_id: string):Promise<any>
    fetchSpecialization():Promise<any>
    fechtUserData(userId:string):Promise<User|null>
    getAllUsers():Promise<any>
    contact(name:string, email:string, subject:string,phone:string,message:string,timestamp:string):Promise<any>
    // getBookedsessionData(userId:string|undefined):Promise<any>
    // findBookings(user_id:string,doctor_id:string):Promise<any>
    getUserStatus(userId: string): Promise<{ isBlocked: boolean }>;
    editUserData(userId:string,userData:User):Promise<any>
    getUserById(userId:string):Promise<any>
    getAllBookings(user_id:string|undefined):Promise<any>
    cancelAppoinment(appoinmentId:string,userId:string,doctorId:string):Promise<any>
    getbookedDoctor(userId:string):Promise<any>
    resetPasswords(user_id:string,currentPassword:string,newPassword:string):Promise<any>
    fetchPrescriptions(user_id:string):Promise<any>
    findBookings(user_id:string,doctor_id:string):Promise<any>
    addReview(reviewComment:any,selectedRating:any,userId:any,doctorId:any):Promise<any>
    reviews(doctor_id:string):Promise<any>
    getNotifications(user_id:any):Promise<any>
    clearNotifications(user_id:any):Promise<any>
    editReview(reviewComment:any,selectedRating:any,userReviewId:any):Promise<any>
    getReivewSummary(doctor_id:string):Promise<any>
    addReport(
    file: Express.Multer.File,
    userData: { userId: string; userName?: string; userEmail?: string,doctorId:string }
  ): Promise<{ cloudinaryUrl: string; documentId: string }>;
  getReportsByUserId(userId:string):Promise<any>
    
 };