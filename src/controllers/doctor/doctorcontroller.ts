import { NextFunction, Request, Response } from "express";
import {ILoginUser} from "../../interface/userInterface/interface"
import DoctorService from "../../service/doctor/doctorService"
import {Interface_Doctor} from "../../interface/doctor/doctor_interface"
import HTTP_statusCode from "../../enums/HttpStatusCode";
import {jwtDecode, JwtPayload} from "jwt-decode"
import { IDoctorService } from "../../interface/doctor/Doctor.Srevice.interface";
import { JwtPayloads } from "../../interface/common";
import { RRule, RRuleSet, rrulestr } from 'rrule';
import { deleteFromCloudinary, uploadToCloudinary } from "../../config/cloudinary";
import moment from 'moment';




class DoctorController{
private doctorService:IDoctorService

constructor(doctorService: IDoctorService) {
    this.doctorService = doctorService;
  }


  async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
  
        const specializationsData =  await this.doctorService.findAllSpecializations();
        console.log("specialisationdaTA",specializationsData)
        res.status(200).json({ success: true, data: specializationsData });
      } catch (error) {
        console.error(
          "Error in controller while fetching specializations:",
          error
        );
        res
          next(error)
      }
}

async registerDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorData: Interface_Doctor = req.body;
       console.log("datass",doctorData)
      const doctor = await this.doctorService.registerDoctor(doctorData);

      res.status(200).json({ message: "OTP sent to email" });
      
    } catch (error) {
      console.error("Error in registerTrainer:", error);
      if ((error as Error).message === "Email already exists") {
        res.status(409).json({ message: "Email already exists" });
        return;
      } else {
       
        next(error)
      }
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction){
    try{
   let {doctorData,otp}=req.body
   console.log("the otp entered from frontend",otp)
   await this.doctorService.verifyOtp(doctorData,otp)
   res.status(200).json({message:"OTP Veified Successfully",doctor:doctorData})
    }catch(error){
      console.error("OTP Verification Controller error:", error);
      if ((error as Error).message === "OTP has expired") {
        res.status(400).json({ message: "OTP has expired" });
      } else if ((error as Error).message === "Invalid OTP") {
        res.status(400).json({ message: "Invalid OTP" });
      } else if ((error as Error).message === "No OTP found for this email") {
        res.status(404).json({ message: "No OTP found for this email" });
      } else {
       next(error)
      }
    }
  }
  async resendOtp(
    req: Request<{ email: string }>,
    res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      

      await this.doctorService.resendOTP(email);
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      console.error("Resend OTP Controller error:", error);
      if ((error as Error).message === "User not found") {
        res.status(404).json({ message: "User not found" });
      } else {
       next(error)
      }
    }
  }

  async loginDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: ILoginUser = req.body;
  
      
      const user = await this.doctorService.LoginDoctor(email, password);
  
      if (user) {
        const { accessToken, refreshToken } = user;
  
        res.cookie("RefreshToken", refreshToken, {
          httpOnly: true,  
          secure: true,    
          sameSite: "strict",  
          maxAge: 7 * 24 * 60 * 60 * 1000,  
        });
  
       
        res.cookie("AccessToken", accessToken, {
          httpOnly: true, 
          secure: true,   
          sameSite: "strict", 
          maxAge: 1 * 24 * 60 * 60 * 1000, 
        });
  
       
        res.status(200).json({
          message: "Login successful",
          doctor: user.user, 
        });
      }
    } catch (error: any) {
      console.error("Error in loginDoctor:", error.message);
  
      if (error.message === "Usernotfound") {
        res.status(404).json({ message: "User not found" });
      } else if (error.message === "PasswordIncorrect") {
        res.status(401).json({ message: "Invalid credentials" });
      } else {
        next(error);  
      }
    }
  }


  async kycSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {  doctor_id,name, email, phone } = req.body;
  
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
      const formData = {
        
       
        name,
        email,
        phone,
        doctor_id
      };
       console.log("------------>>>>",formData)
       console.log("---->>>-------->>>>",files)


      const kycStatus = await this.doctorService.kycSubmit(formData, files);
  
      
      res.status(HTTP_statusCode.OK).json({ message: "KYC submitted successfully", kycStatus });
    } catch (error) {
      console.error("Error in KYC submission:", error);
      next(error);
    }
  }


  async doctorKycStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId;
      const kycStatus = await this.doctorService.kycStatus(doctorId);

      res.status(HTTP_statusCode.OK).json({ kycStatus });
    } catch (error) {
      console.error("Error fetching trainer KYC status:", error);
      next(error)
    }
  }

  async googleSignUpUser(req:Request,res:Response,next:NextFunction){
        try {
          const token=req.body.token
        
         
          const decodedToken:JwtPayloads=jwtDecode(token)
          const response=await this.doctorService.googleSignUpUser(decodedToken)
           res.status(200).json({message:"user signed successfully"})
           res.status(200).json({
  message: "User signed up successfully",
  user: response,
  token: token,
})
        } catch (error) {
           console.error("Error during Google Sign Up:", error);
          // return res.status(500).json({ message: 'Internal server error' });
        
        }
        }


        async getSpecialization(req:Request,res:Response,next:NextFunction){
        
          try {
            const doctorId=req.params.doctorId
            console.log("doctor id for specialization",doctorId)
            const specialisations=await this.doctorService.getSpecialization(doctorId)
            
             res.status(HTTP_statusCode.OK).json({message:"specialisation fetched successfully",data:specialisations})
            
          } catch (error) {
            console.log("Error in contoller",error)
            next(error)
            
          }
        }


      //   async storeAppoinmentData(req:Request,res:Response,next:NextFunction){
      //     console.log("reached in appoinmnet place")
      //     try{

      //       const {selectedDate,startTime,endTime,specialization,price,status} =req.body

          
      //       const doctorId=req.params.doctorId
      //       const appoinmentData:any={}
           

      //         appoinmentData.selectedDate=selectedDate,
      //         appoinmentData.startTime=startTime,
      //         appoinmentData.endTime=endTime,
      //         appoinmentData.specialization=specialization
      //         appoinmentData.price=price
      //         appoinmentData.doctorId=doctorId
           
      //     const apponmentscreated=await this.doctorService.storeAppoinmentData(appoinmentData)
      //     res
      //     .status(HTTP_statusCode.updated)
      //     .json({ message: "Appoinment created successfully.", apponmentscreated });

      //     }catch(error:any){
      //       if (error.message === "Time conflict with an existing appoinment.") {
      //         res
      //           .status(HTTP_statusCode.BadRequest)
      //           .json({ message: "Time conflict with an existing session." });
      //       }  else if (error.message === "End time must be after start time") {
      //         res.status(HTTP_statusCode.BadRequest).json({ message: "End time must be after start time" });
      //       } else if (
      //         error.message === "Appoinment duration must be at least 30 minutes"
      //       ) {
      //         res
      //           .status(HTTP_statusCode.BadRequest)
      //           .json({ message: " Appoinment duration must be at least 30 minutes" });
      //       } else {
      //         console.error("Detailed server error:", error);
      //         next(error)
      //       }
      //     }
          


      // }

     



  async storeAppoinmentData(req: Request, res: Response, next: NextFunction): Promise<any>  {

    console.log("ssss")
    try {
      const {
        selectedDate,
        startTime,
        endTime,
        specialization,
        price,
        status,
        isRecurring,
        recurrenceType,
        recurrenceInterval,
        recurrenceEnd,
        daysOfWeek
      } = req.body;

      const doctorId = req.params.doctorId;
      
      if (isRecurring) {
        
        const appointments = this.generateRecurringAppointments({
          doctorId,
          selectedDate,
          startTime,
          endTime,
          specialization,
          price,
          status,
          recurrenceType,
          recurrenceInterval,
          recurrenceEnd,
          daysOfWeek
        });

        console.log("nnnn",appointments);
        
        const apponmentscreated = await this.doctorService.storeMultipleAppointments(appointments);

        return res
          .status(201)
          .json({ 
            message: "Recurring appointments created successfully.", 
            apponmentscreated 
          });
      } else {
       
        const appoinmentData:any={
          selectedDate,
        startTime,
        endTime,
        specialization,
        price,
        doctorId,
        status: status || 'Pending',
        isRecurring: false,
        recurrenceType: 'None',
        recurrenceInterval: 1,
        daysOfWeek: []
        }

        const apponmentscreated = await this.doctorService.storeAppoinmentData(appoinmentData);
        
        return res
          .status(201)
          .json({ 
            message: "Appointment created successfully.", 
            apponmentscreated 
          });
      }
    } catch (error: any) {
      this.handleAppointmentErrors(error, res, next);
    }
  }

  private generateRecurringAppointments(config: {
    doctorId: string,
    selectedDate: string,
    startTime: string,
    endTime: string,
    specialization: string,
    price: number,
    status: string,
    recurrenceType: string,
    recurrenceInterval: number,
    recurrenceEnd: string,
    daysOfWeek?: number[]
  }): any[] {
    const {
      doctorId,
      selectedDate,
      startTime,
      endTime,
      specialization,
      price,
      status,
      recurrenceType,
      recurrenceInterval,
      recurrenceEnd,
      daysOfWeek
    } = config;

    console.log('Input Configuration:');
    console.log('Start Date:', selectedDate);
    console.log('Recurrence End Date:', recurrenceEnd);
    console.log('Recurrence Type:', recurrenceType);
    console.log('Days of Week:', daysOfWeek);
  
    let rruleOptions: any = {
      dtstart: new Date(selectedDate),
      until: new Date(recurrenceEnd),
      interval: recurrenceInterval
    };
    console.log('RRule Options Before:', rruleOptions);

    switch (recurrenceType) {
      case 'Daily':
        rruleOptions.freq = RRule.DAILY;
        break;
      case 'Weekly':
        rruleOptions.freq = RRule.WEEKLY;
        if (daysOfWeek && daysOfWeek.length > 0) {
          rruleOptions.byweekday = daysOfWeek;
        }else {
          rruleOptions.byweekday = [0, 1, 2, 3, 4]; 
        }
        break;
      case 'Monthly':
        rruleOptions.freq = RRule.MONTHLY;
        break;
      default:
        throw new Error('Invalid recurrence type');
    }
    console.log('RRule Options After:', rruleOptions);

    const rule = new RRule(rruleOptions);
    const dates = rule.all();
    console.log('Generated Dates:', dates);

    const  appoinments=dates.map(date => ({
      selectedDate: moment(date).format('YYYY-MM-DD'),
      startTime,
      endTime,
      specialization,
      price,
      doctorId,
      status: status || 'Pending'
    }));
    console.log('Generated Appointments:', appoinments);
return appoinments
  }

  private handleAppointmentErrors(error: any, res: Response, next: NextFunction) {
    if (error.message === "Time conflict with an existing appointment.") {
      return res
        .status(400)
        .json({ message: "Time conflict with an existing session." });
    } else if (error.message === "End time must be after start time") {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    } else if (error.message === "Appointment duration must be at least 30 minutes") {
      return res
        .status(400)
        .json({ message: "Appointment duration must be at least 30 minutes" });
    } else {
      console.error("Detailed server error:", error);
      next(error);
    }
  }





      async getAppoinmentSchedules(req: Request, res: Response, next: NextFunction) {
        try {
          const doctor_id = req.params.doctorId;
          const sheduleData = await this.doctorService.getAppoinmentSchedules(
            doctor_id
          );
          console.log('sheduleData',sheduleData);
    
          res
            .status(HTTP_statusCode.OK)
            .json({ message: "Session data feched sucessfully", sheduleData });
        } catch (error) {
          console.error("Error saving session data:", error);
         next(error)
        }
      }

      async fetchbookingDetails(req: Request, res: Response, next: NextFunction){
        try {
          
          const doctor_id = req.params.doctorId;
          const bookingDetails=await this.doctorService.fetchBookingDetails(doctor_id)
          
          res.status(HTTP_statusCode.OK).json({data:bookingDetails})
        } catch (error) {
          console.error("Error fetching booking details:", error);

          res.status(500).json({ error: "Failed to fetch booking details." });

          
        }
      }

      async fetchusers(req: Request, res: Response, next: NextFunction):Promise<any>{
      try {
        const {doctorId}=req.params
        console.log("hh",doctorId);
        const users=await this.doctorService.fetchusers(doctorId)
        console.log("cccccccccccc",users)
        return res.status(200).json(users);
      } catch (error) {
        
      }
        
      }

      async getAllBookings(req: Request, res: Response, next: NextFunction):Promise<any>{
        try {
            const doctor_id = req.params.doctor_id; // Get doctorId from request params
            const bookings = await this.doctorService.getAllBookings(doctor_id);
            res.status(200).json(bookings);
        } catch (error) {
            next(error);
        }
    }


    async getDoctor(req: Request, res: Response, next: NextFunction) {
      try {
        const doctor_id = req.params.doctor_id;
        const DoctorData = await this.doctorService.getDoctor(doctor_id);
        res.status(200).json({
          DoctorData: DoctorData,
        });
      } catch (error: any) {
        next(error)
      }
    }


    async getWalletData(req: Request, res: Response, next: NextFunction) {
      try {
        const doctorId = req.params.doctor_id
        const walletData = await this.doctorService.getWallet(doctorId)
        res.status(200).json(walletData)
      } catch (error) {
        next(error)
      }
    }

    async withdraw(req: Request, res: Response, next: NextFunction) {
      try {
       const {doctor_id} = req.params
       const {amount} = req.body
   
       const withdrawed = await this.doctorService.withdraw(doctor_id, amount)
       res.status(200).json(withdrawed)
      } catch (error) {
       next(error)
      }
     }

     async updateDoctor(req: Request, res: Response, next: NextFunction) {
      try {
        const doctor_id = req.params.doctor_id;
        const doctorData = req.body;
        const existingDoctorProfile = await this.doctorService.fetchDoctor(doctor_id)
        if(existingDoctorProfile) {
           await deleteFromCloudinary(existingDoctorProfile)
        }
        const documents: { [key: string]: string | undefined } = {};
        if (req.file) {
          const profileImageUrl = await uploadToCloudinary(
            req.file.buffer,
            "doctor_profileImage"
          );
          documents.profileImage = profileImageUrl.secure_url;
        }
        const updatedDoctorData = { ...doctorData, ...documents };
        const updatedDoctor = await this.doctorService.updateDoctor(
          doctor_id,
          updatedDoctorData
        );
        res.status(200).json({
          message: "Doctor updated successfully",
          updatedDoctor,
        });
      } catch (error) {
        next(error);
      }
    }
    
    async logoutDoctor(req: Request, res: Response) {
      try {
        res.clearCookie("RefreshToken", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(200).json({ message: "Logged out successfully" });
      } catch (error) {
        res.status(500).json({ message: "Logout failed", error });
      }
    }
  
}

export default DoctorController