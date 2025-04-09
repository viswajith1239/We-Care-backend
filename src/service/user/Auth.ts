import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { IAuthService } from "../../interface/user/Auth.service.inerface";
import { User, userType } from "../../interface/userInterface/interface";
import { AuthRepository } from "../../repositories/user/AuthRepository";
import jwt from "jsonwebtoken"
import sendMail from "../../config/emailConfig";
import { IUser, ILoginUser,JwtPayload,IBooking} from "../../interface/userInterface/interface";
import { response } from "express";
import stripeClient from "../../config/stripeClients";
import mongoose from "mongoose";
import { IAuthRepository } from "../../interface/user/Auth.repository.interface";


export class AuthService implements IAuthService {
    private authRepository: IAuthRepository;
    private userData: userType | null = null;
    private OTP: string | null = null;
    private expiryOTP_time: Date | null = null;
  
    constructor(authRepository: IAuthRepository) {
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
  
        
          const response = await this.authRepository.existUser(userData.email, userData.phone);
          if (response.existEmail) {
              throw new Error("Email already in use");
          }
          if (response.existPhone) {
              throw new Error("Phone already in use");
          }
  
          const saltRounds: number = 10;
          const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
          console.log("Password hashed:", hashedPassword);
  
          
          const userId = uuidv4();
  
         
          this.userData = {
              userId: userId,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              password: hashedPassword,
          };
  
          console.log("Prepared user data:", this.userData);
  
         
          const Generated_OTP: string = Math.floor(1000 + Math.random() * 9000).toString();
          this.OTP = Generated_OTP;
  
        
          const text = `Your OTP is ${Generated_OTP}`;
           console.log(text);
          
          const subject = 'OTP Verification';
  
          
          const sendMailStatus: boolean = await sendMail(userData.email, subject, text);
          console.log("OTP sent status:", sendMailStatus);
  
          if (!sendMailStatus) {
              throw new Error("Failed to send OTP");
          }
  
          
          const Generated_time = new Date();
          this.expiryOTP_time = new Date(Generated_time.getTime() + 60 * 1000);
  
          console.log(`OTP will expire at: ${this.expiryOTP_time}`);
  
         
          await this.authRepository.saveOTP(userData.email, this.OTP, this.expiryOTP_time);
  
         
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
        
        const validOtps = await this.authRepository.getOtpsByEmail(userData.email);
        console.log("Fetched OTPs from DB:", validOtps);

        if (validOtps.length === 0) {
            console.log("No OTP found for this email");
            throw new Error("No OTP found for this email");
        }

        
        const latestOtp = validOtps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        console.log("Latest OTP from DB:", latestOtp.otp);

        
        if (latestOtp.otp === otp) {
            if (latestOtp.expiresAt > new Date()) {
                console.log("OTP verified successfully");

               
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                console.log("Password hashed");

                
                const newUserData = {
                    userId: uuidv4(),
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    password: hashedPassword,
                    isBlocked: false,
                };

          
                const userCreationResponse = await this.authRepository.createNewUser(newUserData);
                console.log("User created successfully in DB:", userCreationResponse);

          
                await this.authRepository.deleteOtpById(latestOtp._id);
                console.log("Used OTP deleted from DB");

              
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

   async login( email:string, password:string ): Promise<any> {
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
   console.log(">>>>>>>>>>.email",email)

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

async forgotpassword(UserEmail: string): Promise<any> {
  try {
    console.log("checccc", UserEmail);

    const userResponse = await this.authRepository.findUserEmail(UserEmail);
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
    await this.authRepository.saveOTP(
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
async verifyForgotOTP(userData: string, otp: string): Promise<void> {
  try {
    const validateOtp = await this.authRepository.getOtpsByEmail(userData);
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

        await this.authRepository.deleteOtpById(latestOtp._id);
      } else {
        console.log("OTP has expired");
        await this.authRepository.deleteOtpById(latestOtp._id);
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

async resetapassword(userData: string, payload: { newPassword: string }) {
  console.log("got pay load", payload, userData);
  try {
    const { newPassword }: { newPassword: string } = payload;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("hashed", hashedPassword);
    const response = await this.authRepository.saveResetPassword(
      userData,
      hashedPassword
    );
    console.log("response check in userservice ", response);
    return response;
  } catch (error) {
    console.log("Error is",error)
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
    const doctors = await this.authRepository.getAllDoctors() 
    const validDoctors = doctors?.filter((doctor: any) => 
      (doctor as any).isBlocked === false && (doctor as any).kycStatus === "approved"
    ) || [];
      
    return validDoctors
  } catch (error) {
    console.log("Fetching doctors error in service", error);
  }
}

async getDoctor(doctorId: string) {
  try {
    return await this.authRepository.getDoctor(doctorId);
  } catch (error) {
    console.log("error is",error)
  }
}

async getUserStatus(userId: string) {
  const user = await this.authRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return { isBlocked: user.isBlocked };
}

async getAppoinmentSchedules() {
  try {
    return await this.authRepository.fetchAllAppoinmentschedules();
  } catch (error) {
    console.log("Error is",error)
  }
}

async checkoutPayment(appoinmentid: string, userId: string) {
  try {
    console.log("hello checkout ");
    
    const appoinmentData = await this.authRepository.findSessionDetails(appoinmentid);
    if (!appoinmentData || !appoinmentData.doctorId || !appoinmentData.price) {
      throw new Error("Missing session data, doctor ID, or price");
    }
    // const doctorid = appoinmentData.doctorId.toString();
    // const doctorData = await this.authRepository.findDoctorDetails(doctorid);

    // if (!doctorData) {
    //   throw new Error("Doctor data not found");
    // }
    const lineItems = [
      {
        price_data: {
          currency: "INR",
          unit_amount: appoinmentData.price * 100,
          product_data: {
            name: appoinmentData.type || "Appointment Booking", 
            description: appoinmentData.startTime && appoinmentData.endTime 
              ? `Description: Appointment from ${appoinmentData.startTime} to ${appoinmentData.endTime}`
              : "Description: Appointment booking", 
          },
        },
        quantity: 1,
      },
    ];
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:5173/paymentSuccess?session_id=${appoinmentData._id}&user_id=${userId}&stripe_session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `http://localhost:5173/paymentFailed`,
    });
    return session;  
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    throw error;
  }
}

async findBookingDetails(session_id: string, user_id: string, stripe_session_id: string) {
    
  try {
    const session = await this.authRepository.findSessionDetails(session_id);


    if (session) {
      session.status = "Confirmed";
      await session.save();
    }
    const doctorId = session?.doctorId;
    if (!doctorId) {
      throw new Error("Doctor ID is not available in the session.");
    }
    
    
    const Doctor = await this.getDoctor(doctorId.toString());
    const sessionData = await stripeClient.checkout.sessions.retrieve(stripe_session_id)

      if (!Doctor || Doctor.length === 0) {
      throw new Error("Doctor not found.");
    }
     const bookingDetails: IBooking = {
      appoinmentId: new mongoose.Types.ObjectId(session._id),
       doctorId: new mongoose.Types.ObjectId(Doctor[0]._id),
       userId: new mongoose.Types.ObjectId(user_id),
      //  sessionType: session.type,
       bookingDate: new Date(),
       startDate: session.selectedDate || session.startDate,
      //  endDate: session.endDate,
       startTime: session.startTime,
       endTime: session.endTime,
       amount: session.price,
       paymentStatus: "Confirmed",
       createdAt: new Date(),
       updatedAt: new Date(),
       payment_intent: sessionData.payment_intent ? sessionData.payment_intent.toString() : undefined,
       
     };
    const existingBooking = await this.authRepository.findExistingBooking(bookingDetails);
    if (existingBooking) {
      console.log("Booking already exists.");
      return existingBooking
     // throw new Error("Booking already exists.");
    }
    const bookingData=await this.authRepository.createBooking(bookingDetails)
    // await this._userRepository.createNotification(bookingData)

    
    return bookingData

    
  } catch (error) {
    console.log("error in fetching userservice",error)
  }
}


async fechtUserData(userId:string):Promise<User|null>{
  console.log("nnnn");
  
  try {
    console.log("gggg");
   return  await this.authRepository.fetchUserData(userId) 
  } catch (error) {
    console.log("Error in fetch Data",error)
    return null
  }
}


async editUserData( userId: string,userData: User,) {
  try {
    return await this.authRepository.editUserData(userId,userData);
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}
async getAllBookings(user_id: string) {
  try {
    return await this.authRepository.fetchBookings(user_id);
  } catch (error) {
    console.log(error);
  }
}
async cancelAppoinment(bookId:string,userId:string,doctorId:string){
    
  try {
    const bookedsession=await this.authRepository.cancelAppoinment(bookId,userId,doctorId)
    

    //refund all amount into user account
    // const refund = await stripeClient.refunds.create({
    //   payment_intent:   bookedsession.payment_intent,
    //   amount: bookedsession.Amount
    // });
    // if (refund.status === 'succeeded') {
    //   return {
    //     success: true,
    //     message: 'Refund processed successfully',
    //   };
    // } else {
    //   throw new Error('Refund processing failed');
    // }
    console.log("hhh",bookedsession);
    
 
    return bookedsession

  } catch (error) {
    console.log("Error cancel and refund",error)
  }

 }
 async getbookedDoctor(userId:any){
  try {
    return await this.authRepository.getbookedDoctor(userId)
  } catch (error) {
    
  }
 }

 async resetPasswords(userId: string, currentPassword: string, newPassword: string) {
  try {
    const userData = await this.authRepository.fetchUser(userId);
    if (!userData?.password) {
      throw new Error('User password is null');
    }
    const isPasswordMatch = await bcrypt.compare(currentPassword, userData.password);

    if (!isPasswordMatch) {
      throw new Error('Old password is not correct');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
    await userData.save();
    return { message: 'Password reset successfully' };
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw new Error('Failed to reset password');
  }
}

async fetchPrescriptions(user_id: string) {
  return await this.authRepository.getPrescriptionsByuser(user_id);
}

async findBookings(user_id: string, doctorId: string) {
  try {
    const bookingData = await this.authRepository.findBookings(user_id, doctorId)
    
    return bookingData?.paymentStatus
  } catch (error) {
    throw new Error('failed to find booking') 
  }
 }

 async addReview(reviewComment: string, selectedRating: number, userId: string, doctorId: string) {
  try {
    return await this.authRepository.createReview(reviewComment, selectedRating, userId, doctorId)
  } catch (error) {
    throw new Error('Failed to create review');
  }
}

async reviews(doctor_id: string) {
  try {
    return await this.authRepository.getReview(doctor_id)
  } catch (error) {
    throw new Error('failed to find review')    
  }
}

async editReview(reviewComment: string, selectedRating: number,userReviewId: string) {
  try {
    return await this.authRepository.editReview(reviewComment, selectedRating, userReviewId)
  } catch (error) {
    throw new Error('Failed to create review');
  }
}

async getReivewSummary(doctor_id: string) {
  try {      
    const avgReviewsRating = await this.authRepository.getAvgReviewsRating(doctor_id)
    return avgReviewsRating
  } catch (error) {
    throw new Error('failed to find review summary')   
  }
}



    
}