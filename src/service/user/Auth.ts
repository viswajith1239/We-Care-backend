import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

//
import { IAuthService } from "../../interface/user/Auth.service.inerface";
import { userType } from "../../interface/userInterface/interface";
import { AuthRepository } from "../../repositories/user/AuthRepository";
import jwt from "jsonwebtoken"
import sendMail from "../../config/emailConfig";
import { IUser, ILoginUser,JwtPayload} from "../../interface/userInterface/interface";
import { response } from "express";


export class AuthService implements IAuthService {
    private authRepository: AuthRepository;
    private userData: userType | null = null;
    private OTP: string | null = null;
    private expiryOTP_time: Date | null = null;
  
    constructor(authRepository: AuthRepository) {
      this.authRepository = authRepository;
    }

   
    
    async signup(userData: {
    
        name: string;
        email: string;
        phone: string;
        password: string;
        confirmpassword: string;
      }): Promise<any>  {
        try {
        console.log("reachedin service",userData)
          const response = await this.authRepository.existUser(userData.email,userData.phone);
          if (response.existEmail) {
            throw new Error("Email already in use");
          }
          if (response.existPhone) {
            throw new Error("Phone already in use");
          }
    
          let saltRounds: number = 10;
    
          const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
          console.log("hashed ",hashedPassword);
          
          
    
          const userId = uuidv4();
          this.userData = {
            userId: userId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: hashedPassword,
            // createdAt: new Date(),
          };
          console.log("------------userData",userData)

         let responses=await this.authRepository.createUser(this.userData)
         console.log("yes respone service response",responses)
        // 
         const Generated_OTP: string = Math.floor(
          1000 + Math.random() * 9000
        ).toString();
        // const hashedOTP: string = await bcrypt.hash(Generated_OTP, saltRounds);
  
        this.OTP = Generated_OTP;
  
        let text = `Your OTP is ${Generated_OTP}`; 
        console.log("otp is OTP is",text)
        let subject = 'OTP Verification';
  
        const sendMailStatus: boolean = await sendMail(
          userData.email,
          subject,text
        );
  
        if (!sendMailStatus) {
          throw new Error("Otp not send");
        }
        const Generated_time = new Date();
  
        this.expiryOTP_time = new Date(Generated_time.getTime() + 60 * 1000);
  
        // const token = jwt.sign(
        //   {
        //     userData: this.userData,
        //     OTP: this.OTP,
        //     expirationTime: this.expiryOTP_time,
        //   },
        //   process.env.JWT_SECRET as string,
        //   {
        //     expiresIn: "1min",
        //   }
        // );
        await this.authRepository.saveOTP(userData.email, this.OTP, this.expiryOTP_time);
      console.log(`OTP will expire at: ${this.expiryOTP_time}`);
  
  
  
       // return { token };
       return responses
        //  
        } catch (error: any) {
          throw error;
        }
      }

      async verifyOTP(userData: IUser, otp: string): Promise<any> {
        console.log("otp verifying");
    
        try {
            const validOtps = await this.authRepository.getOtpsByEmail(userData.email);
            console.log("Fetched OTPs from DB:", validOtps); // Log fetched OTPs
            console.log("Entered OTP:", otp); // Log user-entered OTP
                 
            if (validOtps.length === 0) {
                console.log("No OTP found for this email");
                throw new Error("No OTP found for this email");
            }
    
            const latestOtp = validOtps.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            )[0];
            console.log("Latest OTP from DB:", latestOtp.otp); // Log the latest OTP
                  
            if (latestOtp.otp === otp) {
                if (latestOtp.expiresAt > new Date()) {
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    const newUserData = { ...userData, password: hashedPassword };
                    await this.authRepository.createNewUser(newUserData);
    
                    await this.authRepository.deleteOtpById(latestOtp._id);
                } else {
                    console.log("OTP has expired");
                    await this.authRepository.deleteOtpById(latestOtp._id);
                    throw new Error("OTP has expired");
                }
            } else {
                console.log("Mismatch between entered OTP and DB OTP");
                throw new Error("Invalid OTP");
            }
            return response
        } catch (error) {
            const errorMessage = (error as Error).message || "An unknown error occurred";
            console.error("Error during OTP verification:", errorMessage);
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
        await this.authRepository.saveOTP(email, this.OTP, this.expiryOTP_time);
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

   async login({ email, password }: ILoginUser): Promise<any> {
  try {
    const userData: IUser | null = await this.authRepository.findUser(email);
    if (userData) {
      if (userData.isBlocked) {
        throw new Error("User is blocked");
      }

      const isPasswordMatch = await bcrypt.compare(password, userData.password || "");
      if (isPasswordMatch) {
        if (!userData._id) {
          throw new Error("User ID is missing");
        }

        // Generate JWT tokens
        const accessToken = jwt.sign(
          { id: userData._id.toString(), email: userData.email, role: "user" },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
          { id: userData._id.toString(), email: userData.email, role: "user" },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );

        return {
          accessToken,
          refreshToken,
          user: {
            id: userData._id.toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            isBlocked: userData.isBlocked,
          },
        };
      }
    }
    throw new Error("Invalid email or password");
  } catch (error) {
    throw error;
  }
}
async googleSignUpUser(decodedToken: JwtPayload): Promise<any> {
  const email = decodedToken.email;
  const name = decodedToken.name;
  let existedemail = await this.authRepository.existingUser(email);
  if (!existedemail) {
    try {
      const newUser = { email, name, password: null };
      const createdUser = await this.authRepository.createUsers(newUser);
      return createdUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("User creation failed");
    }
  } else {
    return existedemail;
  }
}

    
}