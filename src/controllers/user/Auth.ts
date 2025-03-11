import HTTP_statusCode from "../../enums/HttpStatusCode";
import {IAuthService} from "../../interface/user/Auth.service.inerface"
import { Request, Response ,NextFunction} from "express";
import { AuthService } from "../../service/user/Auth";
import {ILoginUser,JwtPayload} from "../../interface/userInterface/interface"
import {jwtDecode} from "jwt-decode"

interface CustomRequest extends Request {
  authData?: { id: string; email: string; role: string };
}

export class AuthController  {
   private authService: IAuthService;
    // private authService:AuthService
    
  
    constructor(authService: AuthService) {
      this.authService = authService;
    }
  
    async createUser(req: Request, res: Response): Promise<void> {
      try {
          console.log("create user auth");
          
        const data = req.body;
        console.log("hello,",data);
        
        const response = await this.authService.signup(data);
        console.log("yes respone kittiii",response)
  
       
  
        res.status(HTTP_statusCode.OK).json({ status: true, response });
      } catch (error: any) {
        if (error.message === "Email already in use") {

          res.status(HTTP_statusCode.Conflict).json({ message: "Email already in use" });
        } else if (error.message === "Phone already in use") {
          res.status(HTTP_statusCode.Conflict).json({ message: "Phone number already in use" });
        } else if (error.message === "Otp not send") {
          res.status(HTTP_statusCode.InternalServerError).json({ message: "OTP not sent" });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: "Something went wrong, please try again later" });
        }
      }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
      try {
        const { userData, otp } = req.body;
        console.log("the otp from frontend",otp)
       let resp =await this.authService.verifyOTP(userData, otp);
       console.log("--------------",resp)
       
        res
          .status(200)
          .json({ message: "OTP verified successfully", user: userData });
          
      } catch (error) {
        console.error("OTP Verification Controller error:", error);
        if ((error as Error).message === "OTP has expired") {
          res.status(400).json({ message: "OTP has expired" });
        } else if ((error as Error).message === "Invalid OTP") {
          res.status(400).json({ message: "Invalid OTP" });
        } else if ((error as Error).message === "No OTP found for this email") {
          res.status(404).json({ message: "No OTP found for this email" });
        } else {
          next(error);
        }
      }
    }


    async verifyForgotOtp(req: Request, res: Response, next: NextFunction) {
      console.log("verify otp controller");
      try {
         console.log("verify otp controller");
        const { userData, otp } = req.body;
        
        await this.authService.verifyForgotOTP(userData, otp);
  
        res
          .status(HTTP_statusCode.OK)
          .json({ message: "OTP verified successfully", user: userData });
      } catch (error) {
        console.error("OTP Verification Controller error:", error);
        if ((error as Error).message === "OTP has expired") {
          res.status(HTTP_statusCode.BadRequest).json({ message: "OTP has expired" });
        } else if ((error as Error).message === "Invalid OTP") {
          res.status(HTTP_statusCode.BadRequest).json({ message: "Invalid OTP" });
        } else if ((error as Error).message === "No OTP found for this email") {
          res.status(HTTP_statusCode.NotFound).json({ message: "No OTP found for this email" });
        } else {
         next(error)
        }
      }
    }

    async resendOtp(
      req: Request<{ email: string }>,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const { email } = req.body;
        console.log("Email in controller:", email); 
        await this.authService.resendOTP(email);
        res.status(200).json({ message: "OTP resent successfully" });
      } catch (error) {
        console.error("Resend OTP Controller error:", error);
        if ((error as Error).message === "User not found") {
          res.status(404).json({ message: "User not found" });
        } else {
          res;
          next(error);
        }
      }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { email, password }: ILoginUser = req.body;
        const user = await this.authService.login( email, password );
       
        res.cookie("RefreshToken", user.refreshToken, {
          httpOnly: true, 
          secure: true,
          sameSite: "strict", 
          maxAge: 7 * 24 * 60 * 60 * 1000, //21 days
        });
        res.cookie("AccessToken", user.accessToken, {
          httpOnly: true, 
          secure:true, 
          sameSite: "strict",
          maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(HTTP_statusCode.OK).json({ message: "Login successful", user:user.user });
      } catch (error: any) {
        console.log("errrrrr",error);
        
        if (error.message === "userblocked") {

          res.status(403).json({ message: "Your account is blocked." });
        } else if (error.message === "Invalid email or password") {
          res.status(401).json({ message: "Invalid email or password" });
        } else {
          next(error);
        }
      }
    }

    async googleSignUpUser(req:Request,res:Response,next:NextFunction){
      try {
        const token=req.body.token
      
       
        const decodedToken:JwtPayload=jwtDecode(token)
        const response=await this.authService.googleSignUpUser(decodedToken)
         res.status(200).json({message:"user signed successfully"})
         return 
      } catch (error) {
         console.error("Error during Google Sign Up:", error);
        // return res.status(500).json({ message: 'Internal server error' });
      
      }
      }

      async forgotpassword(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
          const {emailData}=req.body
          console.log("got email from body",emailData)
          const response=await this.authService.forgotpassword(emailData)
          console.log("noll",response)
          if(!response){
            return res.status(HTTP_statusCode.BadRequest).json({message:"email not found"})
      
          }
          return res.status(HTTP_statusCode.OK).json({message:"email vrified successfully",statusCode:HTTP_statusCode.OK})
      
        } catch (error) {
          console.log("Error in Forgot password",error)
        }
      }

      async resetPassword(req:Request,res:Response,next:NextFunction):Promise<any>{
        try {
          console.log("Request body:", req.body); 
           const{userData,payload}=req.body
           console.error("Missing required fields:", { userData, payload });
          
           const result=await this.authService.resetapassword(userData,payload)
           console.log("what is the response got?",result)
           if(result?.modifiedCount===1){
            return res.status(HTTP_statusCode.OK).json({ message: "Password reset successfully" });
      
           }else{
            return res.status(HTTP_statusCode.BadRequest).json({ message: "Failed To Reset Password" });
      
           }
      
        } catch (error) {
          console.log("User Controller Error",error)
          return res.status(HTTP_statusCode.InternalServerError).json({ message: "Server Error" });
      
        }
      }

      async fetchAllSpecializations(req: Request, res: Response, next: NextFunction){

        try {
          const response=await this.authService.fetchSpecialization()
          
          res.status(HTTP_statusCode.OK).json(response)
        } catch (error) {
          console.log("Error in fetching specialization data in controller",error)
        }
      }


      async getAllDoctors(req:Request,res:Response,next:NextFunction){
        console.log("ïn controller")
        try {
          const allTrainers=await this.authService.getAllDoctors()
          
          res.status(HTTP_statusCode.OK).json(allTrainers)
          
        } catch (error) {
          console.log("Error fetching Doctors",error)
          
        }
      
      }

      async getDoctor(req: Request, res: Response, next: NextFunction) {

        try {
          
          const doctorId = req.params.doctorId;
      
          if (!doctorId) {
            res.status(HTTP_statusCode.BadRequest).json({ message: "doctor ID is required" });
          }
      
          const doctor = await this.authService.getDoctor(doctorId);
          // console.log(trainer);
      
          if (!doctor) {
            res.status(HTTP_statusCode.NotFound).json({ message: "doctor not found" });
          }
      
          res.status(HTTP_statusCode.OK).json(doctor);
        } catch (error) {
          console.error("Error in getdoctor controller:", error);
         next(error)
        }
      }

      public async getUserStatus(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
          if (!req.authData) {
            res.status(401).json({ message: "Unauthorized access" });
            return;
          }
      
          const userId = req.authData.id;
          const userStatus = await this.authService.getUserStatus(userId);
          
          res.status(200).json(userStatus);
        } catch (error) {
          console.error("Error fetching user status:", error);
          next(error); // Ensure Express handles the error
        }
      }

      async getAppoinmentSchedules(req: Request, res: Response, next: NextFunction) {
        try {
          const sessionSchedules = await this.authService.getAppoinmentSchedules();
          res.status(HTTP_statusCode.OK).json(sessionSchedules);
        } catch (error) {
          next(error)
        }
      }

      async checkoutPayment(req: Request, res: Response, next: NextFunction){
        try {
          const userId=req.body.userData.id
          const appoinmentID=req.params.appoinmentId
          
          const paymentResponse=await this.authService.checkoutPayment( appoinmentID,userId)
          
          res.status(HTTP_statusCode.OK).json({ id: paymentResponse?.id });
        } catch (error) {
          console.log("error while payment in controller",error)
        }
      
      }

      async createBooking(req: Request, res: Response, next: NextFunction){
  
        try {
         
          const { sessionId, userId , stripe_session_id} = req.body;
          
          const bookingDetails = await this.authService.findBookingDetails(
            sessionId,
            userId,
            stripe_session_id
          );
          
          
          res.status(200).json(bookingDetails);
        } catch (error) {
          console.log("Error in create booking in controller",error);
        }
      
      }

      async getUser(req: Request, res: Response, next: NextFunction){
        console.log("bbbbb");
        
        try {
          console.log("rrrr");
          
          const userId=req.params.userId
          console.log("wwww",userId);
          

         const response= await this.authService.fechtUserData(userId)
          res.status(HTTP_statusCode.OK).json({data:response})
        } catch (error) {
          
        }
      
      }

      async updateUserData(req: Request, res: Response, next: NextFunction) {
        try {
          console.log("jjjjj");
          
          const userData = req.body;
          const userId = req.body._id;
          await this.authService.editUserData(userData, userId);
          res.status(200).json({ message: "User Updated Successfully" });
        } catch (error) {
          next(error);
        }
      }

      async getAllBookings(req: Request, res: Response, next: NextFunction) {
        try {
          const user_id = req.params.user_id;
          const bookings = await this.authService.getAllBookings(user_id);
          res.status(200).json(bookings);
        } catch (error) {
          next(error);
        }
      }


      async cancelAppoinment(req: Request, res: Response, next: NextFunction){
  
        try {
             
          const { appoinmentId, userId , doctorId} = req.body;
          
          const cancelAndRefund = await this.authService.cancelAppoinment(appoinmentId,userId,doctorId);
          res.status(HTTP_statusCode.OK).json(cancelAndRefund)
        } catch (error) {
          console.log("Error in cancel appoinment",error)
        }
      
      }
      
      
}


