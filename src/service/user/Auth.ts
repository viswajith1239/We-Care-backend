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
  }): Promise<any> {
      try {
          console.log("Reached in signup service with data:", userData);
  
          // Check if the user already exists by email or phone
          const response = await this.authRepository.existUser(userData.email, userData.phone);
          if (response.existEmail) {
              throw new Error("Email already in use");
          }
          if (response.existPhone) {
              throw new Error("Phone already in use");
          }
  
          // Hash the user's password for secure storage
          const saltRounds: number = 10;
          const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
          console.log("Password hashed:", hashedPassword);
  
          // Generate a unique user ID
          const userId = uuidv4();
  
          // Create a user object for temporary storage
          this.userData = {
              userId: userId,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              password: hashedPassword,
          };
  
          console.log("Prepared user data:", this.userData);
  
          // Generate a random OTP for verification
          const Generated_OTP: string = Math.floor(1000 + Math.random() * 9000).toString();
          this.OTP = Generated_OTP;
  
          // Prepare the email content
          const text = `Your OTP is ${Generated_OTP}`;
           console.log(text);
          
          const subject = 'OTP Verification';
  
          // Send the OTP email
          const sendMailStatus: boolean = await sendMail(userData.email, subject, text);
          console.log("OTP sent status:", sendMailStatus);
  
          if (!sendMailStatus) {
              throw new Error("Failed to send OTP");
          }
  
          // Calculate OTP expiry time
          const Generated_time = new Date();
          this.expiryOTP_time = new Date(Generated_time.getTime() + 60 * 1000);
  
          console.log(`OTP will expire at: ${this.expiryOTP_time}`);
  
          // Save the OTP and its expiry time in the database
          await this.authRepository.saveOTP(userData.email, this.OTP, this.expiryOTP_time);
  
          // Respond to the frontend
          return {
              success: true,
              message: "Signup successful, OTP sent to email",
          };
      } catch (error: any) {
          console.error("Error in signup service:", error.message);
          throw error;
      }
  }
  

  async verifyOTP(userData: IUser, otp: string): Promise<any> {
    console.log("Verifying OTP...");
    try {
        // Fetch all OTPs associated with the email
        const validOtps = await this.authRepository.getOtpsByEmail(userData.email);
        console.log("Fetched OTPs from DB:", validOtps);

        if (validOtps.length === 0) {
            console.log("No OTP found for this email");
            throw new Error("No OTP found for this email");
        }

        // Get the latest OTP by sorting based on creation time
        const latestOtp = validOtps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        console.log("Latest OTP from DB:", latestOtp.otp);

        // Check if the entered OTP matches and is not expired
        if (latestOtp.otp === otp) {
            if (latestOtp.expiresAt > new Date()) {
                console.log("OTP verified successfully");

                // Hash the password
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                console.log("Password hashed");

                // Create a new user object with the hashed password
                const newUserData = {
                    userId: uuidv4(),
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    password: hashedPassword,
                    isBlocked: false,
                };

                // Save the new user to the database
                const userCreationResponse = await this.authRepository.createNewUser(newUserData);
                console.log("User created successfully in DB:", userCreationResponse);

                // Delete the used OTP from the database
                await this.authRepository.deleteOtpById(latestOtp._id);
                console.log("Used OTP deleted from DB");

                // Return the created user or a success response
                return { success: true, message: "User created successfully", user: userCreationResponse };
            } else {
                console.log("OTP has expired");
                await this.authRepository.deleteOtpById(latestOtp._id);
                throw new Error("OTP has expired");
            }
        } else {
            console.log("Mismatch between entered OTP and DB OTP");
            throw new Error("Invalid OTP");
        }
    } catch (error) {
        const errorMessage = (error as Error).message || "An unknown error occurred";
        console.error("Error during OTP verification:", errorMessage);
        throw new Error(errorMessage);
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
        throw new Error("userblocked");
      }

      const isPasswordMatch = await bcrypt.compare(password, userData.password || "");
      if (isPasswordMatch) {
        if (!userData._id) {
          throw new Error("User ID is missing");
        }

       
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
    console.log(error);
    
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

async fetchSpecialization(){
    
  try {
    const response=this.authRepository.fetchSpecializations()
    return response
  } catch (error) {
    console.log("Error in fetchingspecializations userservice",error)
  }
}

async getAllDoctors(){
  console.log("In service");
  try {
    const doctors = await this.authRepository.getAllDoctors() // Convert to plain objects
    const validDoctors = doctors?.filter((doctor) => 
      (doctor as any).isBlocked === false && (doctor as any).kycStatus === "approved"
    ) || [];
      
    return validDoctors
  } catch (error) {
    console.log("Fetching doctors error in service", error);
  }
}


    
}