
import userModel from "../../models/userModel"
import { UserProfile, userType,IOtp,IUser } from "../../interface/userInterface/interface";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";
import { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import OtpModel from "../../models/otpModel";



const ObjectId = mongoose.Types.ObjectId;

export class AuthRepository implements IAuthRepository {
  private otpModel = OtpModel;
  private userModel = userModel;
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
  
}

