import { NextFunction, Request, Response } from "express";
import {ILoginUser} from "../../interface/userInterface/interface"
import DoctorService from "../../service/doctor/doctorService"
import {Interface_Doctor} from "../../interface/doctor/doctor_interface"




class DoctorController{
private doctorService:DoctorService

constructor(doctorService: DoctorService) {
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
      // console.log(email,'trainer cont');

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
  
      // Assuming this.trainerService.LoginTrainer handles the authentication
      const user = await this.doctorService.LoginDoctor(email, password);
  
      if (user) {
        const { accessToken, refreshToken } = user;
  
        res.cookie("refreshTokendoctor", refreshToken, {
          httpOnly: true,  
          secure: true,    
          sameSite: "strict",  
          maxAge: 7 * 24 * 60 * 60 * 1000,  //  7 days
        });
  
       
        res.cookie("accessTokendoctor", accessToken, {
          httpOnly: true, 
          secure: true,   
          sameSite: "strict", 
          maxAge: 1 * 24 * 60 * 60 * 1000,  //  in 1 day
        });
  
       
        res.status(200).json({
          message: "Login successful",
          trainer: user.user, 
        });
      }
    } catch (error: any) {
      console.error("Error in loginTrainer:", error.message);
  
      if (error.message === "Usernotfound") {
        res.status(404).json({ message: "User not found" });
      } else if (error.message === "PasswordIncorrect") {
        res.status(401).json({ message: "Invalid credentials" });
      } else {
        next(error);  
      }
    }
  }
  
}

export default DoctorController