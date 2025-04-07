
import userModel from "../../models/userModel"
import { UserProfile, userType,IOtp,IUser,IBooking, User } from "../../interface/userInterface/interface";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";
import { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import OtpModel from "../../models/otpModel";
import DoctorModel from "../../models/doctorModel";
import SpecializationModel from "../../models/specializationModel";
import AppoinmentModel from "../../models/appoinmentModel";
import { ISpecialization } from "../../interface/doctor/doctor_interface"
import BookingModel from "../../models/bookingModel";
import { IUsers } from "../../interface/common";
import { ITransaction } from "../../models/walletModel";
import WalletModel from "../../models/walletModel";
import PrescriptionModel from "../../models/prescriptionModel";



const ObjectId = mongoose.Types.ObjectId;

export class AuthRepository implements IAuthRepository {
  private otpModel = OtpModel;
  private userModel = userModel;
  private doctorModel=DoctorModel
  private specializationModel=SpecializationModel
  private appoinmetModel=AppoinmentModel
  private bookingModel=BookingModel
  private walletModel=WalletModel
  private prescriptionModel=PrescriptionModel
  async existUser(email: string,phone: string): Promise<{ existEmail: boolean; existPhone: boolean }> {
    try {

      console.log("this is  repo");
      
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
  async createUser(userData:any): Promise<Document> {
    console.log("evie")
    try {
        console.log("user data",userData);
        
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
    const users = new this.userModel(user);
    return await users.save();
  }

  async existingUser(email: string): Promise<IUser | null> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  async saveOTP(email: string, OTP: string, OTPExpiry: Date): Promise<void> {
    console.log("save otp");
    
    try {
      const newOtp = new this.otpModel({
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
    console.log("Getting OTP for email:", email); 
    try {
        const otps = await this.otpModel.find({ email: email }); 
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
      await this.otpModel.findByIdAndDelete(otpId.toString());
      console.log(`OTP with ID ${otpId} deleted successfully.`);
    } catch (error) {
      console.error("Error in deleting OTP:", error);
      throw error;
    }
  }

  async createNewUser(userData: IUser): Promise<void> {
    try {
      await this.userModel.create(userData);
      console.log("User created successfully.");
    } catch (error) {
      console.error("Error in creating User:", error);
      throw error;
    }
  }

  async findUser(email: string): Promise<IUser | null> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      console.log("Error finding user:", error);
      return null;
    }
  }

  async findUserEmail(email: string) {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      console.log("error finding user login:", error);
      return null;
    }
  }

  async saveResetPassword(email: string, hashedPassword: string) {
    console.log("hee", email);
    console.log("reset reached in repos", hashedPassword);
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        console.log("User Not found  for this email", email);
      }
      const result = await this.userModel.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
      if (result.modifiedCount === 0) {
        console.error("Failed to update password for email:", email);
        throw new Error("Password update failed.");
      }

      console.log("Password reset successfully for email:", email);
      return result;
    } catch (error) {
      console.log("Error in Resetting password", error);
      throw error;
    }
  }

  async fetchSpecializations(){
    try {
      
      const response=await this.specializationModel.find({})
    
    return response
    } catch (error) {
      console.log("Error in fetching specialization repository",error)
    }
  }

  async getAllDoctors(){
    console.log("ïn repo")
    try{
    const Doctors=await this.doctorModel.find({}).populate("specializations","name")
    
    
    return Doctors
    }
    catch(error){
   console.log("error fetching doctors in repository",error)
    }
  }

  async getDoctor(doctorId: string) {
    try {
      const doctor = await this.doctorModel
        .find({ _id: doctorId })
        .populate("specializations");
      

      return doctor;
    } catch (error) {}
  }

  async findUserById(userId: string): Promise<IUsers | null>  {
    return await this.userModel.findById(userId);
  }

  async fetchAllAppoinmentschedules():Promise<any> {
    try {
      const schedules = await this.appoinmetModel.find({}).populate('specializationId')
      return schedules;
    } catch (error) {console.log("Error",error)}
  }

  async findSessionDetails(appoinmentid: string) {
    
    const response=await this.appoinmetModel.findById(appoinmentid).populate<{specializationId:ISpecialization}>("specializationId")
    
    return response
  }
  

  async findExistingBooking(bookingDetails: IBooking) {
    try {
      
      const existingBooking = await this.bookingModel.findOne({
        sessionId: bookingDetails.appoinmentId,
        userId: bookingDetails.userId,
      });
  
      if (existingBooking) {
        console.log("Booking already exists.");
  
        
        if (existingBooking.paymentStatus === "Cancelled") {
          await this.bookingModel.updateOne(
            { _id: existingBooking._id },
            { $set: { paymentStatus: "Confirmed" ,} }
          );
          await this.appoinmetModel.updateMany({_id:existingBooking.appoinmentId},{$set:{isBooked:true}})
          return { ...existingBooking.toObject(), paymentStatus: "Confirmed" };
        }
  
        return existingBooking;
      }
  
      
      await this.appoinmetModel.findByIdAndUpdate(
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


  async createBooking(bookingDetails:IBooking){   
    try {
      console.log("booking details is",bookingDetails)
      const bookingnew =await this.bookingModel.create(bookingDetails)
     
      if (!bookingDetails.amount) {
        console.warn("Booking amount is undefined. Skipping wallet update.");
        return bookingnew
  
      }
      const transactionAmount=0.9*bookingDetails.amount
      const transactionId = "txn_" + Date.now() + Math.floor(Math.random() * 10000);
  
      let wallet = await this.walletModel.findOne({ doctorId: bookingDetails.doctorId });
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
  async fetchUserData(userId:string):Promise<User|null>{
    console.log(">>>>>>");
    
    try {
      console.log("sssssss");
     const user= await this.userModel.findById(userId)
     console.log("vvv",user);
     
     return user as User | null; 
  
    } catch (error) {
      console.log("Error in Fetching User Data in Repository",error)
      return null
    
    }
  }


  async editUserData(userId:string,userData:User){
    try {
      console.log("Received userData for update:", userData); 
      const response=await this.userModel.findByIdAndUpdate(userId,{$set:{...userData}},{new:true})
      console.log("updated",response);
      
      return response
    } catch (error) {
      console.log("Error in UserEdit in Repository",error)
    }
  
  }
  async fetchBookings(user_id:string){
    try {
      
  
      const bookings=await this.bookingModel.find({userId:user_id}).populate("doctorId","name profileImage").exec()
      const response = bookings.map((booking: any) => {
        return {
          ...booking.toObject(),  
          doctorName: booking.doctorId ? booking.doctorId.name : 'Doctor not found',
          profileImage:booking.doctorId ? booking.doctorId.profileImage:"Doctor not found"
        };
      });
    
  
      return response
  
    } catch (error) {
      console.log("Error in fetching userData in repository",error)
    }
  }

  async cancelAppoinment(bookId:string,userId:string,doctorId:string){
  

    try {
    const bookingDetails=  await this.bookingModel.findOne({_id:bookId, doctorId:doctorId, userId:userId})
  
    if(bookingDetails?.paymentStatus==="Cancelled"){
      throw new Error('session is already cancelled');
  }
    if(bookingDetails?.paymentStatus==="Confirmed"){
      bookingDetails.paymentStatus="Cancelled"
      await bookingDetails.save()
       await this.appoinmetModel.updateOne(
          { _id: bookingDetails.appoinmentId }, 
          { $set: { status: "Cancelled", isBooked: false } }
        );
        // const wallet = await this._walletModel.findOne({ trainerId });
  
        // if (wallet) {
        //   const refundAmount = 0.9 * (bookingDetails.amount??0); // Deduct the 90% credited amount
  
        //   // Ensure balance is not negative after refund
        //   if (wallet.balance >= refundAmount) {
        //     wallet.balance -= refundAmount;
        //   } else {
        //     wallet.balance = 0;
        //   }
  
        //   // Add transaction record for refund
        //   const refundTransaction: ITransaction = {
        //     amount: -refundAmount,
        //     transactionId: "txn_refund_" + Date.now() + Math.floor(Math.random() * 10000),
        //     transactionType: "debit",
        //     bookingId: bookId,
        //     date: new Date(),
        //   };
  
        //   wallet.transactions.push(refundTransaction);
        //   await wallet.save();
        // }
  
  
      }
          
  return bookingDetails
    
    
    } catch (error) {
      console.log("cancel booking details",error)
      
    }
  }
  async getbookedDoctor(userId: string) {
  try {
    console.log("reached repo", userId);

    const bookings = await this.bookingModel
      .find({ userId })
      .populate("doctorId");

    
    const uniqueDoctors = new Map();

    bookings.forEach((booking) => {
      uniqueDoctors.set(booking.doctorId._id.toString(), booking.doctorId);
    });

    return Array.from(uniqueDoctors.values());
  } catch (error) {
    console.error("Error fetching booked doctors:", error);
    throw new Error("Could not fetch booked doctors");
  }
}

async fetchUser(userId: string) {
  try {
    const userData = await this.userModel.findById(userId);
    return userData;
  } catch (error) {
    throw new Error("Error fetching user");
  }
}

async getPrescriptionsByuser(user_id: string) {
      return await this.prescriptionModel.find({ userId: user_id })
        .populate('doctorId', 'name') 
        .sort({ createdAt: -1 });   
    }

}

