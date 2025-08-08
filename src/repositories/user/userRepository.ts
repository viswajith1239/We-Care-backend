
import userModel from "../../models/userModel"
import { UserProfile, userType, IOtp, IUser, IBooking, User, IReportData, userProfileUpdate } from "../../interface/userInterface/interface";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";
import { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import OtpModel from "../../models/otpModel";
import DoctorModel from "../../models/doctorModel";
import SpecializationModel from "../../models/specializationModel";
import AppoinmentModel from "../../models/appoinmentModel";
import { ISpecialization, PaginatedWalletResponse } from "../../interface/doctor/doctor_interface"
import BookingModel from "../../models/bookingModel";
import { INotification, INotificationContent, IUsers } from "../../interface/common";
import { ITransaction, ITransactions } from "../../models/walletModel";
import WalletModel from "../../models/walletModel";
import PrescriptionModel from "../../models/prescriptionModel";
import ReviewModel from "../../models/reviewModel";
import NotificationModel from "../../models/notificationModel";
import ReportModel from "../../models/reportModel";
import BaseRepository from "../base/baseRepository";
import ContactModel from "../../models/contactModel";



const ObjectId = mongoose.Types.ObjectId;

export class AuthRepository extends BaseRepository<any> implements IAuthRepository {
  private _otpModel = OtpModel;
  private _userModel = userModel;
  private _doctorModel = DoctorModel
  private _specializationModel = SpecializationModel
  private _appoinmetModel = AppoinmentModel
  private _bookingModel = BookingModel
  private _walletModel = WalletModel
  private _prescriptionModel = PrescriptionModel
  private _reviewModel = ReviewModel
  private _notificationModel = NotificationModel;
  private _reportModel = ReportModel
  private _contactModel = ContactModel


  constructor() {
    super(userModel);
  }
  async existUser(email: string, phone: string): Promise<{ existEmail: boolean; existPhone: boolean }> {
    try {



      let existEmail = true;
      let existPhone = true;

      const emailExist = await userModel.findOne({ email: email });
      if (!emailExist) {
        existEmail = false;
      }

      const phoneExist = await userModel.findOne({ phone: phone });
      if (!phoneExist) {
        existPhone = false;
      }

      return { existEmail, existPhone };
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw new Error("Error checking if user exists");
    }
  }
  async createUser(userData: any): Promise<Document> {

    try {


      const newUser = new userModel(userData);
      return await newUser.save();
    } catch (error: any) {
      console.log("Error in creating new User", error);
      throw new Error(`Error creating user : ${error.message}`);
    }
  }
  async createUsers(user: {
    email: string;
    name: string;
    password: string | null;
  }): Promise<any> {
    const users = new this._userModel(user);
    return await users.save();
  }

  async existingUser(email: string): Promise<IUser | null> {
    try {
      return await this._userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  async saveOTP(email: string, OTP: string, OTPExpiry: Date): Promise<void> {


    try {
      const newOtp = new this._otpModel({
        email,
        otp: OTP,
        expiresAt: OTPExpiry,
      });
      await newOtp.save();
    } catch (error) {
      console.error("Error in saveOTP:", error);
      throw error;
    }
  }


  async getOtpsByEmail(email: string): Promise<IOtp[]> {

    try {
      const otps = await this._otpModel.find({ email: email });
      if (!otps || otps.length === 0) {
        console.log("No OTPs found for the given email.");
      } else {
        console.log("Fetched OTPs:", otps);
      }
      return otps;
    } catch (error) {
      console.error("Error in getOtpsByEmail:", error);
      throw error;
    }
  }


  async deleteOtpById(otpId?: mongoose.Types.ObjectId): Promise<void> {
    try {
      if (!otpId) {
        throw new Error("OTP ID is undefined");
      }
      await this._otpModel.findByIdAndDelete(otpId.toString());

    } catch (error) {
      console.error("Error in deleting OTP:", error);
      throw error;
    }
  }

  async createNewUser(userData: IUser): Promise<void> {
    try {
      await this._userModel.create(userData);

    } catch (error) {
      console.error("Error in creating User:", error);
      throw error;
    }
  }

  async findUser(email: string): Promise<IUser | null> {
    try {
      return await this._userModel.findOne({ email });
    } catch (error) {
      console.log("Error finding user:", error);
      return null;
    }
  }

  async findUserEmail(email: string) {
   
    
    try {
       const hi= await this._userModel.findOne({ email }).lean<IUser>();
     
       

       return hi
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async saveResetPassword(email: string, hashedPassword: string) {

    try {
      const user = await this._userModel.findOne({ email });
      if (!user) {
        console.log("User Not found  for this email", email);
      }
      const result = await this._userModel.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
      if (result.modifiedCount === 0) {

        throw new Error("Password update failed.");
      }
      console.log("re",result);
      


      return result;
    } catch (error) {
      console.log("Error in Resetting password", error);
      throw error;
    }
  }

  async fetchSpecializations() {
    try {

      const response = await this._specializationModel.find({})
    
      return response
    } catch (error) {
      console.log("Error in fetching specialization repository", error)
    }
  }

  async getAllDoctors() {

    try {
      const Doctors = await this._doctorModel.find({}).populate("specializations", "name")
      
      return Doctors
    }
    catch (error) {
      console.log("error fetching doctors in repository", error)
    }
  }

  async getDoctor(doctorId: string) {
    try {
      const doctor = await this._doctorModel
        .find({ _id: doctorId })
        .populate("specializations");


      return doctor;
    } catch (error) { }
  }

  async findUserById(userId: string): Promise<IUsers | null> {
    return await this._userModel.findById(userId);
  }

  async fetchAllAppoinmentschedules(): Promise<any> {
    try {
      const schedules = await this._appoinmetModel.find({}).populate('specializationId')
      return schedules;
    } catch (error) { console.log("Error", error) }
  }

  async findSessionDetails(appoinmentid: string) {

    const response = await this._appoinmetModel.findById(appoinmentid).populate<{ specializationId: ISpecialization }>("specializationId")

    return response
  }


  async findExistingBooking(bookingDetails: IBooking) {
    try {

      const existingBooking = await this._bookingModel.findOne({
        sessionId: bookingDetails.appoinmentId,
        userId: bookingDetails.userId,
      });

      if (existingBooking) {



        if (existingBooking.paymentStatus === "Cancelled") {
          await this._bookingModel.updateOne(
            { _id: existingBooking._id },
            { $set: { paymentStatus: "Confirmed", } }
          );
          await this._appoinmetModel.updateMany({ _id: existingBooking.appoinmentId }, { $set: { isBooked: true } })
          return { ...existingBooking.toObject(), paymentStatus: "Confirmed" };
        }

        return existingBooking;
      }


      await this._appoinmetModel.findByIdAndUpdate(
        bookingDetails.appoinmentId,
        { isBooked: true },
        { new: true }
      );

      return null;
    } catch (error) {
      console.log("Error in existing booking repository", error);
      return null;
    }
  }


  async createBooking(bookingDetails: IBooking) {
    try {

      const bookingnew = await this._bookingModel.create(bookingDetails)



      if (!bookingDetails.amount) {
        console.warn("Booking amount is undefined. Skipping wallet update.");
        return bookingnew

      }
      const transactionAmount = 0.9 * bookingDetails.amount
      const transactionId = "txn_" + Date.now() + Math.floor(Math.random() * 10000);

      let wallet = await this._walletModel.findOne({ doctorId: bookingDetails.doctorId });
      const transaction: ITransaction = {
        amount: transactionAmount,
        transactionId: transactionId,
        transactionType: "credit",
        bookingId: bookingnew._id.toString(),
        date: new Date(),
      };
      if (wallet) {

        wallet.transactions.push(transaction);
        wallet.balance += transactionAmount;
        await wallet.save();
      } else {

        wallet = new WalletModel({
          doctorId: bookingDetails.doctorId,
          balance: transactionAmount,
          transactions: [transaction],
        });
        await wallet.save();
      }


      return bookingnew
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking.");
    }

  }


  async contact(
    name: string,
    email: string,
    subject: string,
    phone: string,
    message: string,
    timestamp: string
  ) {
    try {
      console.log("entered in to contact form repository");


      const contactData = {
        name,
        email,
        subject,
        phone,
        message,
        timestamp: new Date(timestamp),
        createdAt: new Date()
      };


      const savedContact = await this._contactModel.create(contactData);

      return {
        success: true,
        data: savedContact,
        message: 'Contact form submitted successfully'
      };

    } catch (error) {
      console.error('Error saving contact:', error);
      throw new Error('Failed to save contact information');
    }
  }
  async fetchUserData(userId: string): Promise<User | null> {


    try {

      const user = await this._userModel.findById(userId)


      return user as User | null;

    } catch (error) {
      console.log("Error in Fetching User Data in Repository", error)
      return null

    }
  }
  async getAllUsers(): Promise<User[] | null> {
    try {
      const users = await this._userModel.find();
      return users as unknown as User[];
    } catch (error) {
      console.log("error in getall user in repository", error);
      return null;
    }
  }


  async createNotification(bookingDetails: IBooking) {
    try {
      if (!bookingDetails.doctorId || !bookingDetails.userId) {
        throw new Error("Doctor ID or User ID is missing.");
      }
      const doctorNotificationContent: INotificationContent = {
        content: `New booking for  on ${bookingDetails.startDate.toDateString()} at ${bookingDetails.startTime}. Amount: ₹${bookingDetails.amount}.`,
        bookingId: new mongoose.Types.ObjectId(bookingDetails.appoinmentId),
        read: false,
        createdAt: new Date(),
      }
      const userNotificationContent: INotificationContent = {
        content: `Your appointment  on ${bookingDetails.startDate.toDateString()} at ${bookingDetails.startTime} is confirmed. Amount: ₹${bookingDetails.amount}.`,
        bookingId: new mongoose.Types.ObjectId(bookingDetails.appoinmentId),
        read: false,
        createdAt: new Date(),
      };
      const existingDoctorNotification = await this._notificationModel.findOne({
        receiverId: bookingDetails.doctorId,
      });

      if (existingDoctorNotification) {
        existingDoctorNotification.notifications.push(
          doctorNotificationContent
        );
        await existingDoctorNotification.save();
      } else {
        const newDoctorNotification: INotification = {
          receiverId: bookingDetails.doctorId,
          notifications: [doctorNotificationContent],
        };
        await this._notificationModel.create(newDoctorNotification);
      }
      const existingUserNotification = await this._notificationModel.findOne({
        receiverId: bookingDetails.userId,
      });

      if (existingUserNotification) {
        existingUserNotification.notifications.push(userNotificationContent);
        await existingUserNotification.save();
      } else {

        const userId =
          typeof bookingDetails.userId === 'object' &&
            bookingDetails.userId !== null &&
            'name' in bookingDetails.userId
            ? undefined
            : bookingDetails.userId;

        if (!userId) {
          throw new Error("Invalid user ID: cannot extract ObjectId from userId.");
        }
        const newUserNotification: INotification = {
          receiverId: userId,
          notifications: [userNotificationContent],
        };
        await this._notificationModel.create(newUserNotification);
      }
    } catch (error: any) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification.");
    }
  }


  async editUserData(userId: string, userData: User):Promise<userProfileUpdate|null> {
    try {



      const { password, ...updateData } = userData;

      const response = await this._userModel.findByIdAndUpdate(
        userId,
        { $set: { ...updateData } },
        { new: true, runValidators: true }
      ).select('-password').lean<userProfileUpdate>().exec();

   
      
      return response;
    } catch (error) {
      console.log("Error in UserEdit in Repository", error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this._userModel.findById(userId).select('-password');
      
      
      return user;
    } catch (error) {
      console.log("Error in getUserById in Repository", error);
      throw error;
    }
  }

  async fetchNotifications(userId: string) {
    try {
      const notificationsDoc = await this._notificationModel.findOne({
        receiverId: userId,
      });

      if (notificationsDoc?.notifications?.length) {
        notificationsDoc.notifications.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      console.log("noti",notificationsDoc);
      
      return notificationsDoc;
    } catch (error) {
      throw new Error("Failed to find notifications");
    }
  }

  async deleteUserNotifications(userId: string) {
    try {
      await this._notificationModel.deleteOne({ receiverId: userId });
    } catch (error) {
      throw new Error("Failed to delete notifications");
    }
  }
  async fetchBookings(user_id: string, page: number = 1, limit: number = 5, search: string = '') {
  try {
    const skip = (page - 1) * limit;

   
    const bookings = await this._bookingModel
      .find({ userId: user_id })
      .populate("doctorId", "name profileImage")
      .sort({ createdAt: -1 });

    
    const filteredBookings = search
      ? bookings.filter((booking: any) =>
          booking.doctorId?.name?.toLowerCase().includes(search.toLowerCase())
        )
      : bookings;
     
      

    const totalBookings = filteredBookings.length;
    const totalPages = Math.ceil(totalBookings / limit);

 
    const paginatedBookings = filteredBookings.slice(skip, skip + limit);

 
    const response = paginatedBookings.map((booking: any) => ({
      ...booking.toObject(),
      doctorName: booking.doctorId?.name || 'Doctor not found',
      profileImage: booking.doctorId?.profileImage || 'Doctor not found',
    }));

    return {
      bookings: response,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookings,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      }
    };

  } catch (error) {
    console.log("Error in fetching booking details", error);
    throw error;
  }
}



  async cancelAppoinment(bookId: string, userId: string, doctorId: string) {
    try {
      const bookingDetails = await this._bookingModel.findOne({
        _id: bookId,
        doctorId: doctorId,
        userId: userId
      });

      if (!bookingDetails) {
        throw new Error('Booking not found');
      }

      if (bookingDetails?.paymentStatus === "Cancelled") {
        throw new Error('Session is already cancelled');
      }

      if (bookingDetails?.paymentStatus === "Confirmed") {
        bookingDetails.paymentStatus = "Cancelled";
        await bookingDetails.save();

        await this._appoinmetModel.updateOne(
          { _id: bookingDetails.appoinmentId },
          { $set: { status: "Cancelled", isBooked: false } }
        );
      }
console.log("ooo",bookingDetails);

      return bookingDetails;
    } catch (error) {
      console.log("cancel booking details", error);
      throw error;
    }
  }

  async addToUserWallet(userId: string, amount: number, bookingId: string) {
    try {

      let wallet = await this._walletModel.findOne({ userId });

      if (!wallet) {

        wallet = new this._walletModel({
          userId,
          balance: 0,
          transactions: []
        });
      }


      wallet.balance += amount;


      const refundTransaction: ITransactions = {
        amount: amount,
        transactionId: "txn_refund_" + Date.now() + Math.floor(Math.random() * 10000),
        transactionType: "credit",
        bookingId: bookingId,
        date: new Date(),
        description: "Refund for cancelled appointment"
      };




      wallet.transactions.push(refundTransaction);
      await wallet.save();
      console.log("8888",wallet);
      
      return wallet;
    } catch (error) {
      console.log("Error adding to user wallet:", error);
      throw error;
    }
  }


  async fetchWalletData(user_id: string, page: number = 1, limit: number = 5): Promise<PaginatedWalletResponse | null | undefined> {
    try {
      const wallet = await this._walletModel.findOne({ userId: user_id }).exec();

      if (!wallet) return null;

      const totalTransactions = wallet.transactions.length;
      const skip = (page - 1) * limit;

      const paginatedTransactions = wallet.transactions.slice(skip, skip + limit);

      return {
        walletData: {
          ...wallet.toObject(),
          transactions: paginatedTransactions,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          tatalTransctions: totalTransactions,
          hasNextPage: page < Math.ceil(totalTransactions / limit),
          hasPreviousPage: page > 1,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      return null;
    }
  }
  async getBookedDoctor(userId: string) {
    try {


      const bookings = await this._bookingModel
        .find({ userId })
        .populate("doctorId");

      const uniqueDoctors = new Map();

      bookings.forEach((booking) => {
        if (booking.doctorId) {
          uniqueDoctors.set(booking.doctorId._id.toString(), booking.doctorId);
        }
      });
    
      
      return Array.from(uniqueDoctors.values());

    } catch (error) {
      console.error("Error fetching booked doctors:", error);
      throw new Error("Could not fetch booked doctors");
    }
  }

  async fetchUser(userId: string) {
    try {
      const userData = await this._userModel.findById(userId);
      return userData;
    } catch (error) {
      throw new Error("Error fetching user");
    }
  }


  async getPrescriptionById(prescriptionId: string, userId: string) {
  try {
   
    const response = await this._prescriptionModel.findOne({
      _id: prescriptionId,
      userId: userId,
    })
    .populate('bookingId','amount ')
    .populate('doctorId', 'name') 
    .populate('userId', 'name')
   


   
 



    
    return response;
  } catch (error) {
    console.log("Error in getting prescription by id repository", error);
    throw error;
  }
}

 async getPrescriptionsByUser(user_id: string, page: number = 1, limit: number = 5, search: string = '') {
  try {
    const skip = (page - 1) * limit;

    const matchCondition: any = {
      userId: new mongoose.Types.ObjectId(user_id),
    };

    if (search) {
    
      const allPrescriptions = await this._prescriptionModel.aggregate([
        {
          $match: matchCondition,
        },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctorDetails',
          },
        },
        { $unwind: '$doctorDetails' },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'bookingDetails',
          },
        },
        {
          $unwind: {
            path: '$bookingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            bookingId: 1,
            prescriptions: 1,
            createdAt: 1,
            doctorName: '$doctorDetails.name',
            specializationId: '$bookingDetails.specialization',
            bookingAmount: '$bookingDetails.amount',
            bookingStartDate: '$bookingDetails.startDate',
            bookingEndTime: '$bookingDetails.endTime',
            bookingStartTime: '$bookingDetails.startTime',
            bookingDate: '$bookingDetails.bookingDate',
            userName: '$userDetails.name',
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);


      const filteredPrescriptions = allPrescriptions.filter((prescription: any) => {
        const searchTerm = search.toLowerCase();
        

        const doctorNameMatch = prescription.doctorName?.toLowerCase().includes(searchTerm);
   
        const medicineNameMatch = prescription.prescriptions?.some((med: any) => 
          med.medicineName?.toLowerCase().includes(searchTerm)
        );
        
        return doctorNameMatch || medicineNameMatch;
      });

      const totalCount = filteredPrescriptions.length;
      const totalPages = Math.ceil(totalCount / limit);


      const paginatedPrescriptions = filteredPrescriptions.slice(skip, skip + limit);

      return {
        prescriptions: paginatedPrescriptions,
        pagination: {
          currentPage: page,
          totalPages,
          totalPrescriptions: totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit
        }
      };
    } else {
   
      const totalCount = await this._prescriptionModel.countDocuments(matchCondition);

      const prescriptions = await this._prescriptionModel.aggregate([
        {
          $match: matchCondition,
        },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId',
            foreignField: '_id',
            as: 'doctorDetails',
          },
        },
        { $unwind: '$doctorDetails' },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'bookingDetails',
          },
        },
        {
          $unwind: {
            path: '$bookingDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            bookingId: 1,
            prescriptions: 1,
            createdAt: 1,
            doctorName: '$doctorDetails.name',
            specializationId: '$bookingDetails.specialization',
            bookingAmount: '$bookingDetails.amount',
            bookingStartDate: '$bookingDetails.startDate',
            bookingEndTime: '$bookingDetails.endTime',
            bookingStartTime: '$bookingDetails.startTime',
            bookingDate: '$bookingDetails.bookingDate',
            userName: '$userDetails.name',
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      return {
        prescriptions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalPrescriptions: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
          limit
        }
      };
    }

  } catch (error) {
    console.log("Error in fetching prescriptions in repository", error);
    throw error;
  }
}



  async findBookings(user_id: string, doctor_id: string) {
    try {
      const bookingData = await this._bookingModel.findOne({
        userId: user_id,
        doctorId: doctor_id,
        paymentStatus: "Confirmed",
      });

      console.log("pp",bookingData);
      
      return bookingData;
    } catch (error) {
      throw new Error("Failed to find bookings");
    }
  }

  async saveReport(data: {
    userId: string;
    doctorId: string
    userName: string;
    userEmail: string;
    imageUrl: string;
  }): Promise<IReportData> {
    const report = new this._reportModel(data);
    const saved = await report.save();

    return {
      _id: saved._id,
      userId: saved.userId,
      doctorId: saved.doctorId,
      userName: saved.userName,
      userEmail: saved.userEmail,
      imageUrl: saved.imageUrl,
    };
  }


  async getReportsByUserId(userId: string): Promise<IReportData[]> {
    const report= await this._reportModel.find({ userId }).sort({ createdAt: -1 });
  
    
    return report

  }



  async createReview(
    reviewComment: string,
    selectedRating: number,
    userId: string,
    doctorId: string
  ) {

    try {
      const data = {
        userId: new mongoose.Types.ObjectId(userId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        rating: selectedRating,
        comment: reviewComment,
      };
      const addReview = await this._reviewModel.create(data);
      return addReview;
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }

  async getReview(doctor_id: string) {

    try {
      const reviews = await this._reviewModel
        .find({ doctorId: doctor_id })
        .populate({
          path: "userId",
          select: "name image",
        })
        .sort({ createdAt: -1 });

      {
      }




      return reviews;
    } catch (error) {
      throw new Error("Failed to find review");
    }
  }

  async editReview(
    reviewComment: string,
    selectedRating: number,
    userReviewId: string
  ) {
    try {
      const review = await this._reviewModel.findByIdAndUpdate(
        userReviewId,
        { comment: reviewComment, rating: selectedRating },
        { new: true }
      );
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }

  async getAvgReviewsRating(doctor_id: string) {
    try {
      const avgRatingAndReviews = await this._reviewModel.aggregate([
        {
          $match: { doctorId: new mongoose.Types.ObjectId(doctor_id) },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,

            averageRating: 1,
            totalReviews: 1,
          },
        },
      ]);

      return avgRatingAndReviews;
    } catch (error) {
      console.error("Error finding review avg summary:", error);
      throw new Error("Failed to find review avg summary");
    }
  }

}

