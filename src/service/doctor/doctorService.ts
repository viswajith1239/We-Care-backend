import DoctorRepository from "../../repositories/doctor/doctorRepository"
import sendMail from "../../config/emailConfig"
import { Interface_Doctor, IAppoinment, IDoctor, IReportData } from "../../interface/doctor/doctor_interface"
import { response } from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken"
import { uploadToCloudinary } from "../../config/cloudinary";
import { IDoctorService } from "../../interface/doctor/Doctor.Srevice.interface";
import { IDoctorRepository } from "../../interface/doctor/Doctor.repository.interface";
import { toDoctorDTO, toDoctorProfileDTO } from "../../utils/doctorMapper";
import { DoctorProfileDTO } from "../../dtos/doctor.dto";


class Doctorservice implements IDoctorService {
  private _doctorRepository: IDoctorRepository
  private _OTP: string | null = null;
  private _expiryOTP_time: Date | null = null


  constructor(doctorRepository: IDoctorRepository) {
    this._doctorRepository = doctorRepository;
  }
  findAppointmentById(id: string): Promise<IAppoinment | null> {
    throw new Error("Method not implemented.");
  }

  async findAllSpecializations() {
    try {
      return await this._doctorRepository.findAllSpecializations();
    } catch (error) {
      console.error("Error in service while fetching specializations:", error);
      throw error;
    }
  }

  async registerDoctor(doctorData: Interface_Doctor) {

    try {

      const existingDoctor = await this._doctorRepository.existsDoctor(doctorData);

      if (existingDoctor) {
        throw new Error("Email already exist")
      }
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString()
      this._OTP = generateOtp

      let text = `Your OTP is ${generateOtp}`;
      console.log(text);
      
      let subject = 'OTP Verification';


      const sentEmail = await sendMail(doctorData.email, subject, text)
      if (!sentEmail) { throw new Error("Email not sent") }
      const OTP_createdTime = new Date()
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000)


      await this._doctorRepository.saveOtp(doctorData.email, this._OTP, this._expiryOTP_time)

    } catch (error) {
      console.error("Error in service:", error);
      throw new Error("Error in Doctor service");
    }
  }


  async verifyOtp(doctorData: Interface_Doctor, otp: string) {


    try {
      const validateOtp = await this._doctorRepository.getOtpByEmail(doctorData.email)

      if (validateOtp.length === 0) {

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





          const hashedPassword = await bcrypt.hash(doctorData.password, 10);

          const newUserData = { ...doctorData, password: hashedPassword };
          await this._doctorRepository.createNewUser(newUserData);

          await this._doctorRepository.deleteOtpById(latestOtp._id);
        } else {

          await this._doctorRepository.deleteOtpById(latestOtp._id);
          throw new Error("OTP has expired");
        }
      } else {
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
      const generatedOTP: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this._OTP = generatedOTP;
      const OTP_createdTime = new Date();
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
      await this._doctorRepository.saveOtp(email, this._OTP, this._expiryOTP_time);
      const isMailSent = await sendMail(email, 'Resend OTP', `Your OTP is ${this._OTP}`);


      if (!isMailSent) {
        throw new Error("Failed to resend OTP email.");
      }
    } catch (error) {
      console.error("Error in resendOTP:", (error as Error).message);
      throw error;
    }
  }

  async LoginDoctor(email: string, password: string): Promise<any> {
    try {

      const doctor: Interface_Doctor | null = await this._doctorRepository.findDoctor(email);
       if (doctor) {
        if (doctor.isBlocked) {
          throw new Error("Your account is blocked.");
        }


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
    }
    } catch (error: any) {
      console.log("Error in login:", error);
      throw error;
    }
  }

  async kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }): Promise<any> {
    try {



      const documents: { [key: string]: string | undefined } = {};


      if (files.profileImage?.[0]) {

        const profileImageUrl: any = await uploadToCloudinary(
          files.profileImage[0].buffer,
          "doctor_profileImage"
        );

        documents.profileImageUrl = profileImageUrl.secure_url;
      }

      if (files.aadhaarFrontSide?.[0]) {
        const aadhaarFrontSideUrl: any = await uploadToCloudinary(
          files.aadhaarFrontSide[0].buffer,
          "doctor_aadhaarFrontSide"
        );
        console.log("**********>>>>", aadhaarFrontSideUrl)
        documents.aadhaarFrontSideUrl = aadhaarFrontSideUrl.secure_url;
      }

      if (files.aadhaarBackSide?.[0]) {
        const aadhaarBackSideUrl: any = await uploadToCloudinary(
          files.aadhaarBackSide[0].buffer,
          "doctor_aadhaarBackSide"
        );
        documents.aadhaarBackSideUrl = aadhaarBackSideUrl.secure_url;
      }

      if (files.certificate?.[0]) {
        const certificateUrl: any = await uploadToCloudinary(
          files.certificate[0].buffer,
          "doctor_certificate"
        );
        documents.certificateUrl = certificateUrl.secure_url;
      }


      await this._doctorRepository.saveKyc(formData, documents);



      return await this._doctorRepository.changeKycStatus(
        formData.doctor_id,
        documents.profileImageUrl
      );
    } catch (error) {
      console.error("Error in kycSubmit service:", error);
      throw new Error("Failed to submit KYC data");
    }
  }


  async kycStatus(doctorId: string) {


    try {
      const kycStatus = await this._doctorRepository.getDoctorStatus(doctorId)
      return kycStatus;
    } catch (error) {
      console.error("Error in kycStatus service:", error);
      throw new Error("Failed to retrieve KYC status");
    }
  }
  async googleSignUpUser(decodedToken: JwtPayload): Promise<any> {
    const email = decodedToken.email;
    const name = decodedToken.name;
    let existedemail = await this._doctorRepository.existingUser(email);
    if (!existedemail) {
      try {
        const newUser = { email, name, password: null };
        const createdUser = await this._doctorRepository.createUsers(newUser);


        return createdUser;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("User creation failed");
      }
    } else {
      return existedemail;
    }
  }

  async getSpecialization(doctorId: string) {

    try {
      return await this._doctorRepository.getSpecialization(doctorId)
    } catch (error) {
      console.log("Error in service while specialization fetching", error)
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


    try {

      const validatedAppointment = await this.validateSingleAppointment(appointmentData);


      const createdAppointment = await this._doctorRepository.createNewAppoinment(validatedAppointment);

      return createdAppointment;
    } catch (error) {
      console.error('Error storing single appointment:', error);
      throw error;
    }
  }

  async storeMultipleAppointments(appointments: any[]) {


    try {

      const validAppointments = await this.validateAppointments(appointments);


      const createdAppointments = await this._doctorRepository.createMultipleAppointments(validAppointments);

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


    const existingAppointments = await this._doctorRepository.findConflictingAppointments(appointmentData);

    if (existingAppointments.length > 0) {
      throw new Error("Time conflict with an existing appointment.");
    }

    return appointmentData;
  }


  async getAppoinmentSchedules(doctor_id: string, page: number = 1, limit: number = 5) {
    try {


      return await this._doctorRepository.fetchAppoinmentData(doctor_id, page, limit)
    } catch (error) {
      throw new Error("Error getting sessin shedule data");
    }
  }


  async fetchBookingDetails(doctor_id: string) {
    try {

      const response = await this._doctorRepository.fecthBookingDetails(doctor_id)
      return response
    } catch (error) {
      console.log("Error fect booking details", error)
    }
  }

  async fetchUsers(doctorId: any) {
    try {
      return await this._doctorRepository.fetchUsers(doctorId)
    } catch (error) {

    }
  }

  async getAllBookings(doctor_id: string, page: number = 1, limit: number = 5, search: string = '') {
    try {
      return await this._doctorRepository.getAllBookings(doctor_id,page,limit,search);
    } catch (error) {
      console.log("Error in fetching doctor's bookings:", error);
    }
  }
  async getDoctor(doctor_id: string): Promise<DoctorProfileDTO | null> {
    try {
      const doctorData = await this._doctorRepository.getDoctor(doctor_id);
      if (!doctorData || doctorData.length === 0) return null;

      return toDoctorProfileDTO(doctorData[0]);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async forgotPassword(UserEmail: string): Promise<any> {
    try {


      const userResponse = await this._doctorRepository.findUserEmail(UserEmail);
      if (!userResponse) {

        throw new Error("Invalid email Address");
      }
      const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
      this._OTP = generateOtp;



      const isMailSet = await sendMail(UserEmail, "otp", this._OTP);

      if (!isMailSet) {
        throw new Error("Email not sent");
      }

      const OTP_createdTime = new Date();
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);


      // console.log("Saving OTP:", {
      //   email: UserEmail,
      //   otp: this._OTP,
      //   expiresAt: this._expiryOTP_time
      // });
      await this._doctorRepository.saveOTP(
        UserEmail,
        this._OTP,
        this._expiryOTP_time
      );


      return userResponse;
    } catch (error) {
      console.log("Error in userservice forgot password", error);
    }
  }

  async verifyForgotOTP(doctorData: string, otp: string): Promise<void> {
    try {
      const validateOtp = await this._doctorRepository.getOtpsByEmail(doctorData);

      if (validateOtp.length === 0) {

        throw new Error("no OTP found for this email");
      }
      const latestOtp = validateOtp.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];
      if (latestOtp.otp === otp) {
        if (latestOtp.expiresAt > new Date()) {




          await this._doctorRepository.deleteOtpById(latestOtp._id);
        } else {

          await this._doctorRepository.deleteOtpById(latestOtp._id);
          throw new Error("OTP has expired");
        }
      } else {

        throw new Error("Invalid OTP");
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || "An unknown error occurred";
      console.error("Error in OTP verification:", errorMessage);
      throw error;
    }
  }

  async resetPassword(doctorData: string, payload: { newPassword: string }) {

    try {
      const { newPassword }: { newPassword: string } = payload;
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const response = await this._doctorRepository.saveResetPassword(
        doctorData,
        hashedPassword
      );

      return response;
    } catch (error) {
      console.log("Error is", error)
    }
  }


  async getWallet(doctor_id: string, page: number = 1, limit: number = 5) {
    return await this._doctorRepository.fetchWalletData(doctor_id, page, limit)
  }


  async withdraw(doctor_id: string, amount: number) {
    try {
      return await this._doctorRepository.withdrawMoney(doctor_id, amount)
    } catch (error: any) {
      throw Error(error)
    }
  }

  async fetchDoctor(doctor_id: string) {
    return await this._doctorRepository.getDoctorProfile(doctor_id)
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

      const existingDoctor = await this._doctorRepository.updateDoctorData(
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

      if (Array.isArray(specializations)) {
        existingDoctor.specializations = specializations
      }
      await existingDoctor.save();


      return existingDoctor;
    } catch (error) {
      console.error("Error in service layer:", error);
      throw new Error("Failed to update doctor");
    }
  }

  async savePrescription(data: {
    doctorId: string;
    userId: string;
    bookingId?: string;
    specializationId?: string;
    prescriptions: {
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instruction: string;
    }[];
    patientDetails?: {
      patientId: string;
      patientName: string;
      patientEmail?: string;
      patientAddress?: string;
      appointmentId: string;
      bookingAmount?: number;
    };
    doctorDetails?: {
      doctorId: string;
      doctorName?: string;
      doctorImage?: string;
    };
  }) {
    return await this._doctorRepository.create(data);
  }

  async fetchPrescriptions(doctor_id: string, page: number = 1, limit: number = 5,search: string = '') {
    return await this._doctorRepository.getPrescriptionsByDoctor(doctor_id,page,limit,search);
  }

  async getReportsByUserId(doctorId: string, page: number = 1, limit: number = 5, search: string = ''): Promise<IReportData[]> {
    return await this._doctorRepository.getReportsByUserId(doctorId,page,limit,search);
  }


  async getBookingsByDoctorAndUser(
    doctorId: string,
    userId: string
  ): Promise<any> {
    return await this._doctorRepository.findByDoctorAndUser(doctorId, userId);
  };


  async getNotifications(doctorId: string) {

    try {

      return await this._doctorRepository.fetchNotifications(doctorId)
    } catch (error) {
      throw new Error('failed to find notifications')
    }
  }

  async clearNotifications(doctorId: string) {
    try {
      return await this._doctorRepository.deleteDoctorNotifications(doctorId)
    } catch (error) {
      throw new Error('failed to delete notifications')
    }
  }

  async getDashboardData() {
    try {
      return await this._doctorRepository.getAllStatistics()
    } catch (error: any) {
      throw Error(error)
    }
  }

  async cancelAppoinment(id: string) {
    try {
      const appoinment = await this._doctorRepository.cancelAppoinment(id)

      if (!appoinment) {
        throw new Error('Appoinment not found')
      }

      return appoinment
    } catch (error: any) {
      throw new Error(error)
    }
  }



  async rescheduleAppointment(id: string, updatedData: any): Promise<IAppoinment | null> {
    try {



      const existingAppointment = await this._doctorRepository.findAppointmentById(id);

      if (!existingAppointment) {
        throw new Error('Appointment not found');
      }

      if (existingAppointment.status !== "Confirmed") {
        throw new Error('Only confirmed appointments can be rescheduled');
      }


      const conflicts = await this._doctorRepository.checkSchedulingConflicts(
        existingAppointment.doctorId,
        id,
        updatedData.selectedDate,
        updatedData.startTime,
        updatedData.endTime
      );

      if (conflicts && conflicts.length > 0) {
        throw new Error('There is a scheduling conflict with another appointment');
      }


      const appointment = await this._doctorRepository.rescheduleAppointment(id, updatedData);

      return appointment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reschedule appointment');
    }
  }

}

export default Doctorservice