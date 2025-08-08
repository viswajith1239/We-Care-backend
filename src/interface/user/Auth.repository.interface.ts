import { Document } from "mongoose";
import { BookingListResponse, cancelBooking, Doctor, IReportData, IReportDatas, Specialization, User, userType, IDoctors, UpdateResult, userProfileUpdate} from "../userInterface/interface";
import { IUser, IOtp, IBooking, IUsers, IDoctor, INotification } from "../common";
import mongoose, { Types } from "mongoose";
import { Interface_Doctor, IAppoinment, PaginatedWalletResponse } from "../doctor/doctor_interface";

export interface IAuthRepository {
  existUser(email: string, phone: string): Promise<{ existEmail: boolean; existPhone: boolean }>;
  createUser(userData: userType): Promise<Document>;
  existingUser(email: string): Promise<IUser | null>;
  findUserById(userId: string): Promise<IUsers | null>;
  // userCheck(email:string): Promise<UserProfile | null>; 
  saveOTP(email: string, OTP: string, OTPExpirey: Date): Promise<void>
  getOtpsByEmail(email: string): Promise<IOtp[] | []>
  deleteOtpById(otpId?: mongoose.Types.ObjectId): Promise<void>
  createNewUser(userData: IUser): Promise<void>
  findUser(email: string): Promise<IUser | null>
  createUsers(user: { email: string; name: string; password: string | null; }): Promise<any>
  createUser(userData: IUser): Promise<Document>;
  findUserEmail(email: string): Promise<IUser|null>
  saveResetPassword(email: string, hashedPassword: string): Promise<UpdateResult>
  getAllDoctors(): Promise<Interface_Doctor[]|undefined>
  getDoctor(doctorId: string): Promise<Interface_Doctor[] | undefined>
  fetchAllAppoinmentschedules(): Promise<IAppoinment>
  findSessionDetails(appoinmentid: string): Promise<any>
  findExistingBooking(bookingDetails: IBooking): Promise<any>
  createBooking(bookingDetails: IBooking): Promise<IBooking>
  fetchSpecializations(): Promise<Specialization[]|undefined>
  contact(name: string, email: string, subject: string, phone: string, message: string, timestamp: string): Promise<any>//any mattanam
  fetchUserData(userId: string): Promise<User | null>
  getAllUsers(): Promise<any>
  editUserData(userId: string, userData: User): Promise<userProfileUpdate|null>
  getUserById(userId: string): Promise<any>
  fetchBookings(user_id: string, page?: number, limit?: number,search?: string): Promise<BookingListResponse>
  cancelAppoinment(bookId: string, userId: string, doctorId: string): Promise<cancelBooking>
  addToUserWallet(userId: string, amount: number|undefined, bookId: string): Promise<any>
  fetchWalletData(user_id: string, page?: number, limit?: number): Promise<PaginatedWalletResponse | null | undefined>
  getBookedDoctor(userId: string): Promise<IDoctors[]>
  fetchUser(userId: string): Promise<any>
  getPrescriptionById(prescriptionId: string, userId: string): Promise<any>
  getPrescriptionsByUser(user_id: string, page?: number, limit?: number,search?: string): Promise<any>
  findBookings(user_id: string, doctorId: string): Promise<any>
  fetchNotifications(userId: string): Promise<INotification|null>
  deleteUserNotifications(userId: string): Promise<any>
  createNotification(bookingDetails: any): Promise<any>
  createReview(reviewComment: any, selectedRating: any, userId: any, doctorId: any): Promise<any>
  getReview(doctor_id: string): Promise<any>
  editReview(reviewComment: any, selectedRating: any, userReviewId: any): Promise<any>
  getAvgReviewsRating(doctor_id: string): Promise<any>
  saveReport(data: {
    userId: string;
    doctorId: string;
    userName: string;
    userEmail: string;
    imageUrl: string;
  }): Promise<IReportData>;
  getReportsByUserId(userId: string): Promise<IReportData[]>


};