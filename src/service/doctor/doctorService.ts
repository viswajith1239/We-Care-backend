import DoctorRepository from "../../repositories/doctor/doctorRepository"
import sendMail from "../../config/emailConfig"
import {Interface_Doctor,IAppoinment, IDoctor} from "../../interface/doctor/doctor_interface"
import { response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken"
import { uploadToCloudinary } from "../../config/cloudinary";
import { IDoctorService } from "../../interface/doctor/Doctor.Srevice.interface";
import { IDoctorRepository } from "../../interface/doctor/Doctor.repository.interface";


class Doctorservice implements IDoctorService{
private doctorRepository:IDoctorRepository
private OTP: string | null = null;
    private expiryOTP_time:Date | null=null


constructor(doctorRepository: IDoctorRepository) {
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
    
    console.log("Doctor email is:", doctorData.email)
       const sentEmail=await sendMail(doctorData.email,subject,text)
       if(!sentEmail){throw new Error("Email not sent")}
       const OTP_createdTime=new Date()
       this.expiryOTP_time=new Date(OTP_createdTime.getTime()+1*60*1000)


      await this.doctorRepository.saveOtp(doctorData.email,this.OTP,this.expiryOTP_time)
        
    } catch (error) {
      console.error("Error in service:",error );
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
            return b.createdAt.getTime() - a.createdAt.getTime(); 
        } else {
            return b.expiresAt.getTime() - a.expiresAt.getTime(); 
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
     
      const doctor: Interface_Doctor | null = await this.doctorRepository.findDoctor(email);
  
      
      if (!doctor) {
        console.log("doctor not found");
        throw new Error("Usernotfound"); 
      }
  
     
      const isPasswordMatch = await bcrypt.compare(password, doctor.password);
  
      
      if (!isPasswordMatch) {
        throw new Error("PasswordIncorrect");
      }
  
      
      if (!doctor._id) {
        throw new Error("Doctor ID is missing");
      }
  
    
      const accessToken = jwt.sign(
        { id: doctor._id.toString(), email: doctor.email, role: "doctor" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
     
      const refreshToken = jwt.sign(
        { id: doctor._id.toString(), email: doctor.email, role: "doctor" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
  
      
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
      throw error; 
    }
  }

    async kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }): Promise<any> {
      try {
        console.log("fff",files);
        
        console.log("got....",formData)
        const documents: { [key: string]: string | undefined } = {};
    

        if (files.profileImage?.[0]) {

          const profileImageUrl:any = await uploadToCloudinary(
            files.profileImage[0].buffer,
            "doctor_profileImage"
          );
        
          documents.profileImageUrl = profileImageUrl.secure_url;
        }
    
        if (files.aadhaarFrontSide?.[0]) {
          const aadhaarFrontSideUrl:any = await uploadToCloudinary(
            files.aadhaarFrontSide[0].buffer,
            "doctor_aadhaarFrontSide"
          );
          console.log("**********>>>>",aadhaarFrontSideUrl)
          documents.aadhaarFrontSideUrl = aadhaarFrontSideUrl.secure_url;
        }
    
        if (files.aadhaarBackSide?.[0]) {
          const aadhaarBackSideUrl:any = await uploadToCloudinary(
            files.aadhaarBackSide[0].buffer,
            "doctor_aadhaarBackSide"
          );
          documents.aadhaarBackSideUrl = aadhaarBackSideUrl.secure_url;
        }
    
        if (files.certificate?.[0]) {
          const certificateUrl:any = await uploadToCloudinary(
            files.certificate[0].buffer,
            "doctor_certificate"
          );
          documents.certificateUrl = certificateUrl.secure_url;
        }
    
        
        await this.doctorRepository.saveKyc(formData, documents);
      
    
       
        return await this.doctorRepository.changeKycStatus(
          formData.doctor_id,
          documents.profileImageUrl
        );
      } catch (error) {
        console.error("Error in kycSubmit service:", error);
        throw new Error("Failed to submit KYC data");
      }
    }


    async kycStatus(doctorId: string) {
      console.log("reached in service")
      console.log("doctor id is",doctorId)

      try {
        const kycStatus = await this.doctorRepository.getDoctorStatus(doctorId)
        return kycStatus;
      } catch (error) {
        console.error("Error in kycStatus service:", error);
        throw new Error("Failed to retrieve KYC status");
      }
    }
    async googleSignUpUser(decodedToken: JwtPayload): Promise<any> {
      const email = decodedToken.email;
      const name = decodedToken.name;
      let existedemail = await this.doctorRepository.existingUser(email);
      if (!existedemail) {
        try {
          const newUser = { email, name, password: null };
          const createdUser = await this.doctorRepository.createUsers(newUser);
          console.log("hhhh",createdUser);
          
          return createdUser;
        } catch (error) {
          console.error("Error creating user:", error);
          throw new Error("User creation failed");
        }
      } else {
        return existedemail;
      }
    }

    async getSpecialization(doctorId:string){

      try {
         return await this.doctorRepository.getSpecialization(doctorId)
      } catch (error) {
       console.log("Error in service while specialization fetching",error)
      }
      }


      // async storeAppoinmentData(appoinmentData:IAppoinment){
      //   console.log("yes no problem here")
      //   try{
      //     const startTimeInput = appoinmentData.startTime;
      //     const endTimeInput = appoinmentData.endTime;
  
      //     const startTime = new Date(`1970-01-01T${startTimeInput}`);
      //     const endTime = new Date(`1970-01-01T${endTimeInput}`);
    
      //     if (startTime >= endTime) {
      //       throw new Error("End time must be after start time");
      //     }
  
      //     const MINIMUM_SESSION_DURATION = 30;
      //   const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
      //   if (duration < MINIMUM_SESSION_DURATION) {
      //     throw new Error("appoinment duration must be at least 30 minutes");
      //   }
      //  return  await this.doctorRepository.createNewAppoinment(appoinmentData)
  
      //   }catch(error:any){
      //     if (error.message.includes("Daily appoinment limit")) {
      //       throw new Error(error.message);
      //     } else if (error.message === "Time conflict with an existing appoinment.") {
      //       throw new Error("Time conflict with an existing appoinment.");
      //     } else if (error.message === "End time must be after start time") {
      //       throw new Error("End time must be after start time");
      //     } else if (
      //       error.message === "appoinment duration must be at least 30 minutes"
      //     ) {
      //       throw new Error("appoinment duration must be at least 30 minutes");
      //     } else {
      //       throw new Error("Error creating new appoinment");
      //     }      }
        
  
      //  }

      async storeAppoinmentData(appointmentData: any) {
        console.log("single service");
        
        try {
          
          const validatedAppointment = await this.validateSingleAppointment(appointmentData);
          
       
          const createdAppointment = await this.doctorRepository.createNewAppoinment(validatedAppointment);
          
          return createdAppointment;
        } catch (error) {
          console.error('Error storing single appointment:', error);
          throw error;
        }
      }
    
      async storeMultipleAppointments(appointments: any[]) {
        console.log("multiple service");
        console.log("tttt",appointments);
        
        try {
     
          const validAppointments = await this.validateAppointments(appointments);
          
       
          const createdAppointments = await this.doctorRepository.createMultipleAppointments(validAppointments);
          
          return createdAppointments;
        } catch (error) {
          console.error('Error storing multiple appointments:', error);
          throw error;
        }
      }
    
      private async validateAppointments(appointments: any[]) {
        const validAppointments: any[] = [];
    
        for (const appointment of appointments) {
          try {
           
            await this.validateSingleAppointment(appointment);
            validAppointments.push(appointment);
          } catch (error) {
            console.warn('Skipping appointment due to validation error:', error);
           
          }
        }
    
        return validAppointments;
      }
    
      private async validateSingleAppointment(appointmentData: any) {
        
        const startTimeInput = appointmentData.startTime;
        const endTimeInput = appointmentData.endTime;
    
        const startTime = new Date(`1970-01-01T${startTimeInput}`);
        const endTime = new Date(`1970-01-01T${endTimeInput}`);
    
        if (startTime >= endTime) {
          throw new Error("End time must be after start time");
        }
    
        const MINIMUM_SESSION_DURATION = 30;
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
        if (duration < MINIMUM_SESSION_DURATION) {
          throw new Error("Appointment duration must be at least 30 minutes");
        }
    
        
        const existingAppointments = await this.doctorRepository.findConflictingAppointments(appointmentData);
    
        if (existingAppointments.length > 0) {
          throw new Error("Time conflict with an existing appointment.");
        }
    
        return appointmentData;
      }
    

       async getAppoinmentSchedules(doctor_id: string) {
        try {
          return await this.doctorRepository.fetchAppoinmentData(doctor_id)
        } catch (error) {
          throw new Error("Error getting sessin shedule data");
        }
      }


      async fetchBookingDetails(doctor_id:string){
        try {
          
          const response=await this.doctorRepository.fecthBookingDetails(doctor_id)
          return response
        } catch (error) {
          console.log("Error fect booking details",error)
        }
      }
  
      async fetchusers(doctorId:any){
        try {
          return await this.doctorRepository.fetchusers(doctorId)
        } catch (error) {
          
        }
      }

      async getAllBookings(doctor_id: string) {
        try {
            return await this.doctorRepository.getAllBookings(doctor_id);
        } catch (error) {
            console.log("Error in fetching doctor's bookings:", error);
        }
    }
    async getDoctor(doctor_id: string) {
      try {
        return await this.doctorRepository.getDoctor(doctor_id)
      } catch (error:any) {
        throw Error(error);
      }
    }

    async forgotpassword(UserEmail: string): Promise<any> {
      try {
        console.log("checccc", UserEmail);
    
        const userResponse = await this.doctorRepository.findUserEmail(UserEmail);
        if (!userResponse) {
          console.log("user not already exist", userResponse);
          throw new Error("Invalid email Address");
        }
        const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
        this.OTP = generateOtp;
        console.log("Generated OTP is", this.OTP);
    
        //send otp to the email:
        const isMailSet = await sendMail( UserEmail,"otp", this.OTP);
        
        if (!isMailSet) {
          throw new Error("Email not sent");
        }
    
        const OTP_createdTime = new Date();
        this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
     
    
        console.log("Saving OTP:", {
          email: UserEmail,
          otp: this.OTP,
          expiresAt: this.expiryOTP_time
      });
        await this.doctorRepository.saveOTP(
          UserEmail,
          this.OTP,
          this.expiryOTP_time
        );
        console.log(`OTP will expire at: ${this.expiryOTP_time}`);
    
        return userResponse;
      } catch (error) {
        console.log("Error in userservice forgot password", error);
      }
    }

    async verifyForgotOTP(doctorData: string, otp: string): Promise<void> {
      try {
        const validateOtp = await this.doctorRepository.getOtpsByEmail(doctorData);
        console.log("the validateOtp is..", validateOtp);
        if (validateOtp.length === 0) {
          console.log("there is no otp in email");
          throw new Error("no OTP found for this email");
        }
        const latestOtp = validateOtp.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )[0];
        if (latestOtp.otp === otp) {
          if (latestOtp.expiresAt > new Date()) {
            console.log("otp expiration not working");
    
            console.log("OTP is valid and verified", latestOtp.expiresAt);
    
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

    async resetapassword(doctorData: string, payload: { newPassword: string }) {
      console.log("got pay load", payload, doctorData);
      try {
        const { newPassword }: { newPassword: string } = payload;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("hashed", hashedPassword);
        const response = await this.doctorRepository.saveResetPassword(
          doctorData,
          hashedPassword
        );
        console.log("response check in userservice ", response);
        return response;
      } catch (error) {
        console.log("Error is",error)
      }
    }


    async getWallet(doctor_id: string) {
      return await this.doctorRepository.fetchWalletData(doctor_id)
    }


    async withdraw (doctor_id:string, amount: number)  {
      try {
        return await this.doctorRepository.withdrawMoney(doctor_id, amount)
      } catch (error: any) {
        throw Error(error)
      }
    }

    async fetchDoctor(doctor_id: string) {
      return await this.doctorRepository.getDoctorProfile(doctor_id)
    }

    async updateDoctor(doctor_id: string, doctorData: Partial<IDoctor>) {
      try {
        const {
          profileImage,
          name,
          email,
          phone,
          yearsOfExperience,
          gender,
          language,
          dailySessionLimit,
          about,
          specializations
        } = doctorData;
  
        const existingDoctor = await this.doctorRepository.updateDoctorData(
          doctor_id
        );
        if (!existingDoctor) {
          throw new Error("Doctor not found");
        }
        if (profileImage) existingDoctor.profileImage = profileImage;
        if (name) existingDoctor.name = name;
        if (email) existingDoctor.email = email;
        if (phone) existingDoctor.phone = phone;
        if (yearsOfExperience)
          existingDoctor.yearsOfExperience = yearsOfExperience;
        if (gender) existingDoctor.gender = gender;
        if (language) existingDoctor.language = language;
        if (about) existingDoctor.about = about;
        if (dailySessionLimit)
          existingDoctor.dailySessionLimit = dailySessionLimit;
  
        if(Array.isArray(specializations)) {
          existingDoctor.specializations = specializations
        }
        await existingDoctor.save();
        console.log("nnnn",existingDoctor);
        
        return existingDoctor;
      } catch (error) {
        console.error("Error in service layer:", error);
        throw new Error("Failed to update doctor");
      }
    }

    async savePrescription(data: {
      doctorId: string;
      userId: string;
      prescriptions: { medicineName: string; description: string }[];
    }) {
      return await this.doctorRepository.create(data);
    }

    async fetchPrescriptions(doctor_id: string) {
      return await this.doctorRepository.getPrescriptionsByDoctor(doctor_id);
    }

    async getDashboardData() {
      try {
        return await this.doctorRepository.getAllStatistics()
      } catch (error: any) {
        throw Error(error)
      }
    }
    
  
}

export default Doctorservice