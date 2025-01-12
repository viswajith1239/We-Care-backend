import DoctorRepository from "../../repositories/doctor/doctorRepository"
import sendMail from "../../config/emailConfig"
import {Interface_Doctor} from "../../interface/doctor/doctor_interface"
import { response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Types } from "mongoose";
import jwt from "jsonwebtoken"


class Doctorservice{
private doctorRepository:DoctorRepository
private OTP: string | null = null;
    private expiryOTP_time:Date | null=null


constructor(doctorRepository: DoctorRepository) {
    this.doctorRepository = doctorRepository;
  }

  async findAllSpecializations() {
    try {
      return await this.doctorRepository.findAllSpecializations();
    } catch (error) {
      console.error("Error in service while fetching specializations:", error);
      throw error;
    }
  }

  async registerDoctor(doctorData: Interface_Doctor) {
    console.log("doctor data is",doctorData)
    try {

      const existingDoctor = await this.doctorRepository.existsDoctor(doctorData);
      console.log("existingdoctor",existingDoctor)
      if(existingDoctor){
        throw new Error("Email already exist")
      }
      const generateOtp=Math.floor(1000+ Math.random()*9000).toString()
       this.OTP=generateOtp
       console.log("the otp is:...",this.OTP)
       let text = `Your OTP is ${generateOtp}`; 
       let subject = 'OTP Verification';
    //    const email_Ht=otpEmailTemplate(this.OTP,trainerData.name||"user")
    console.log("Doctor email is:", doctorData.email)
       const sentEmail=await sendMail(doctorData.email,subject,text)
       if(!sentEmail){throw new Error("Email not sent")}
       const OTP_createdTime=new Date()
       this.expiryOTP_time=new Date(OTP_createdTime.getTime()+1*60*1000)


      await this.doctorRepository.saveOtp(doctorData.email,this.OTP,this.expiryOTP_time)
        
    } catch (error) {
      console.error("Error in service:", );
      throw new Error("Error in Doctor service");
    }
  }


  async verifyOtp(doctorData:Interface_Doctor,otp:string){
    console.log("11111111111111",doctorData)

    try {
      const validateOtp=await this.doctorRepository.getOtpByEmail(doctorData.email)
      console.log("the validateOtp is..",validateOtp)
      if(validateOtp.length===0){
        console.log("there is no otp in email")
        throw new Error("no OTP found for this email")
      }
      const sortedOtp = validateOtp.sort((a: { createdAt: { getTime: () => number; }; expiresAt: { getTime: () => number; }; }, b: { createdAt: { getTime: () => number; }; expiresAt: { getTime: () => number; }; }) => {
        if (b.createdAt.getTime() !== a.createdAt.getTime()) {
            return b.createdAt.getTime() - a.createdAt.getTime(); // Sort by createdAt in descending order
        } else {
            return b.expiresAt.getTime() - a.expiresAt.getTime(); // If createdAt is the same, sort by expiresAt
        }
    });


      const latestOtp = sortedOtp[0];



            if (latestOtp.otp === otp) {
              if (latestOtp.expiresAt > new Date()) {
                console.log("otp expiration not working");
      
                console.log("OTP is valid and verified", latestOtp.expiresAt);
               
                
                const hashedPassword = await bcrypt.hash(doctorData.password, 10);
                
                const newUserData = { ...doctorData, password: hashedPassword };
                await this.doctorRepository.createNewUser(newUserData);
                console.log("User successfully stored.");
                await this.doctorRepository.deleteOtpById(latestOtp._id);
              } else {
                console.log("OTP has expired");
                await this.doctorRepository.deleteOtpById(latestOtp._id);
                throw new Error("OTP has expired");
              }
            } else {
              console.log("Invalid OTP");
              throw new Error("Invalid OTP");
            }
      
      
    } catch (error) {
      const errorMessage =
    (error as Error).message || "An unknown error occurred";
  console.error("Error in OTP verification:", errorMessage);
  throw error;
    }

  }

  async resendOTP(email: string): Promise<void> {
    try {
      console.log("Email received for resendOTP:", email); 
      const generatedOTP: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this.OTP = generatedOTP;
      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      await this.doctorRepository.saveOtp(email, this.OTP, this.expiryOTP_time);
      const isMailSent = await sendMail(email, 'Resend OTP', `Your OTP is ${this.OTP}`);


      if (!isMailSent) {
        throw new Error("Failed to resend OTP email.");
      }
      console.log(`Resent OTP ${this.OTP} to ${email}`);
    } catch (error) {
      console.error("Error in resendOTP:", (error as Error).message);
      throw error;
    }
  }

  async LoginDoctor( email:string, password:string): Promise<any> {
    try {
      // Find the doctor by email
      const doctor: Interface_Doctor | null = await this.doctorRepository.findDoctor(email);
  
      // If doctor is not found, throw an error
      if (!doctor) {
        console.log("doctor not found");
        throw new Error("Usernotfound"); // Custom error for trainer not found
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordMatch = await bcrypt.compare(password, doctor.password);
  
      // If password doesn't match, throw an error
      if (!isPasswordMatch) {
        throw new Error("PasswordIncorrect");
      }
  
      // Ensure trainer ID exists
      if (!doctor._id) {
        throw new Error("Doctor ID is missing");
      }
  
      // Generate Access Token
      const accessToken = jwt.sign(
        { id: doctor._id.toString(), email: doctor.email, role: "doctor" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { id: doctor._id.toString(), email: doctor.email, role: "doctor" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
  
      // Return access token, refresh token, and trainer data
      return {
        accessToken,
        refreshToken,
        user: {
          id: doctor._id.toString(),
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
        },
      };
    } catch (error: any) {
      console.log("Error in login:", error);
      throw error; // Re-throw the error to be handled by the calling function
    }
  }
  
}

export default Doctorservice