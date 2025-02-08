import HTTP_statusCode from "../../enums/HttpStatusCode";
import {IAuthService} from "../../interface/user/Auth.service.inerface"
import { Request, Response ,NextFunction} from "express";
import { AuthService } from "../../service/user/Auth";
import {ILoginUser,JwtPayload} from "../../interface/userInterface/interface"
import {jwtDecode} from "jwt-decode"



export class AuthController  {
   // private authService: IAuthService;
    private authService:AuthService
    
  
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
        const user = await this.authService.login({ email, password });
       
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
          console.log("Error fetching Trainers",error)
          
        }
      
      }
}


