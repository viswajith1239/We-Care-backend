import { NextFunction, Request, Response } from "express";
import { ILoginUser } from "../../interface/userInterface/interface"
import DoctorService from "../../service/doctor/doctorService"
import { Interface_Doctor } from "../../interface/doctor/doctor_interface"
import HTTP_statusCode from "../../enums/HttpStatusCode";
import RESPONSE_MESSAGES from "../../enums/messages";
import { jwtDecode, JwtPayload } from "jwt-decode"
import { IDoctorService } from "../../interface/doctor/Doctor.Srevice.interface";
import { JwtPayloads } from "../../interface/common";
import { RRule, RRuleSet, rrulestr } from 'rrule';
import { deleteFromCloudinary, uploadToCloudinary } from "../../config/cloudinary";
import moment from 'moment';




class DoctorController {
  private _doctorService: IDoctorService

  constructor(doctorService: IDoctorService) {
    this._doctorService = doctorService;
  }


  async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    try {

      const specializationsData = await this._doctorService.findAllSpecializations();
      res.status(HTTP_statusCode.OK).json({ success: true, data: specializationsData });
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
      const doctor = await this._doctorService.registerDoctor(doctorData);

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.OTP_SEND });

    } catch (error) {
      console.error("Error in registerDoctor:", error);
      if ((error as Error).message === RESPONSE_MESSAGES.EMAIL_EXISTS) {
        res.status(HTTP_statusCode.Conflict).json({ message: RESPONSE_MESSAGES.EMAIL_EXISTS });
        return;
      } else {

        next(error)
      }
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      let { doctorData, otp } = req.body
      await this._doctorService.verifyOtp(doctorData, otp)
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.OTP_VERIFIED, doctor: doctorData })
    } catch (error) {
      console.error("OTP Verification Controller error:", error);
      if ((error as Error).message === RESPONSE_MESSAGES.OTP_EXPIRED) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.OTP_EXPIRED });
      } else if ((error as Error).message === RESPONSE_MESSAGES.INVALID_OTP) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.INVALID_OTP });
      } else if ((error as Error).message === RESPONSE_MESSAGES.NO_OTP_FOUND) {
        res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.NO_OTP_FOUND });
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


      await this._doctorService.resendOTP(email);
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.OTP_RESEND });
    } catch (error) {
      console.error("Resend OTP Controller error:", error);
      if ((error as Error).message === RESPONSE_MESSAGES.USER_NOT_FOUND) {
        res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND });
      } else {
        next(error)
      }
    }
  }

  async loginDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: ILoginUser = req.body;


      const user = await this._doctorService.LoginDoctor(email, password);

      if (user) {
        const { accessToken, refreshToken } = user;

        res.cookie("RefreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        });


        res.cookie("AccessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        });


        res.status(HTTP_statusCode.OK).json({
          message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
          doctor: user.user,
        });
      }
    } catch (error: any) {
      console.error("Error in loginDoctor:", error.message);
      if (error.message === RESPONSE_MESSAGES.ACCOUNT_BLOCKED) {

        res.status(HTTP_statusCode.NoAccess).json({ message: RESPONSE_MESSAGES.ACCOUNT_BLOCKED });

      }else if (error.message === RESPONSE_MESSAGES.USER_NOT_FOUND) {
        res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND });
      } else if (error.message === "PasswordIncorrect") {
        res.status(HTTP_statusCode.Unauthorized).json({ message: RESPONSE_MESSAGES.INVALID_CREDENTIALSS });
      } else {
        next(error);
      }
    }
  }


  async kycSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctor_id, name, email, phone } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const formData = {


        name,
        email,
        phone,
        doctor_id
      };


      const kycStatus = await this._doctorService.kycSubmit(formData, files);


      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.KYC_SUBMIT_SUCCESS, kycStatus });
    } catch (error) {
      console.error("Error in KYC submission:", error);
      next(error);
    }
  }


  async doctorKycStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId;
      const kycStatus = await this._doctorService.kycStatus(doctorId);

      res.status(HTTP_statusCode.OK).json({ kycStatus });
    } catch (error) {
      console.error("Error fetching doctor KYC status:", error);
      next(error)
    }
  }

  async googleSignUpUser(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.token


      const decodedToken: JwtPayloads = jwtDecode(token)
      const response = await this._doctorService.googleSignUpUser(decodedToken)
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.SIGNUP_SUCCESS })
      res.status(HTTP_statusCode.OK).json({
        message: RESPONSE_MESSAGES.SIGNUP_SUCCESS,
        user: response,
        token: token,
      })
    } catch (error) {
      console.error("Error during Google Sign Up:", error);
      // return res.status(500).json({ message: 'Internal server error' });

    }
  }


  async getSpecialization(req: Request, res: Response, next: NextFunction) {

    try {
      const doctorId = req.params.doctorId
      const specialisations = await this._doctorService.getSpecialization(doctorId)

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_FETCH_SUCCESS, data: specialisations })

    } catch (error) {
      console.log("Error in contoller", error)
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





  async storeAppoinmentData(req: Request, res: Response, next: NextFunction): Promise<any> {
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



        const apponmentscreated = await this._doctorService.storeMultipleAppointments(appointments);

        return res
          .status(201)
          .json({
            message: "Recurring appointments created successfully.",
            apponmentscreated
          });
      } else {

        const appoinmentData: any = {
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

        const apponmentscreated = await this._doctorService.storeAppoinmentData(appoinmentData);

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

    let rruleOptions: any = {
      dtstart: new Date(selectedDate),
      until: new Date(recurrenceEnd),
      interval: recurrenceInterval
    };


    switch (recurrenceType) {
      case 'Daily':
        rruleOptions.freq = RRule.DAILY;
        break;
      case 'Weekly':
        rruleOptions.freq = RRule.WEEKLY;
        if (daysOfWeek && daysOfWeek.length > 0) {
          rruleOptions.byweekday = daysOfWeek;
        } else {
          rruleOptions.byweekday = [0, 1, 2, 3, 4];
        }
        break;
      case 'Monthly':
        rruleOptions.freq = RRule.MONTHLY;
        break;
      default:
        throw new Error('Invalid recurrence type');
    }


    const rule = new RRule(rruleOptions);
    const dates = rule.all();


    const appoinments = dates.map(date => ({
      selectedDate: moment(date).format('YYYY-MM-DD'),
      startTime,
      endTime,
      specialization,
      price,
      doctorId,
      status: status || 'Pending'
    }));

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


      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;


      const sheduleData = await this._doctorService.getAppoinmentSchedules(
        doctor_id, page, limit
      );


      res
        .status(HTTP_statusCode.OK)
        .json({ message: RESPONSE_MESSAGES.SESSION_FETCH_SUCCESS, sheduleData });
    } catch (error) {
      console.error("Error saving session data:", error);
      next(error)
    }
  }

  async fetchBookingDetails(req: Request, res: Response, next: NextFunction) {
    try {

      const doctor_id = req.params.doctorId;
      const bookingDetails = await this._doctorService.fetchBookingDetails(doctor_id)

      res.status(HTTP_statusCode.OK).json({ data: bookingDetails })
    } catch (error) {
      console.error("Error fetching booking details:", error);

      res.status(HTTP_statusCode.InternalServerError).json({ error: "Failed to fetch booking details." });


    }
  }

  async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { doctorId } = req.params

      const users = await this._doctorService.fetchUsers(doctorId)

      return res.status(HTTP_statusCode.OK).json(users);
    } catch (error) {

    }

  }

  async getAllBookings(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const doctor_id = req.params.doctor_id;
       const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string || '';
      console.log("sea",search);
      
      const bookings = await this._doctorService.getAllBookings(doctor_id,page,limit,search);
      res.status(HTTP_statusCode.OK).json(bookings);
    } catch (error) {
      next(error);
    }
  }


  async getDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor_id = req.params.doctor_id;
      const DoctorData = await this._doctorService.getDoctor(doctor_id);
      res.status(HTTP_statusCode.OK).json({
        DoctorData: DoctorData,
      });
    } catch (error: any) {
      next(error)
    }
  }


  async getWalletData(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctor_id
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const walletData = await this._doctorService.getWallet(doctorId, page, limit)
      res.status(HTTP_statusCode.OK).json(walletData)
    } catch (error) {
      next(error)
    }
  }

  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctor_id } = req.params
      const { amount } = req.body

      const withdrawed = await this._doctorService.withdraw(doctor_id, amount)
      res.status(HTTP_statusCode.OK).json(withdrawed)
    } catch (error) {
      next(error)
    }
  }

  async updateDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor_id = req.params.doctor_id;
      const doctorData = req.body;
      const existingDoctorProfile = await this._doctorService.fetchDoctor(doctor_id)
      if (existingDoctorProfile) {
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
      const updatedDoctor = await this._doctorService.updateDoctor(
        doctor_id,
        updatedDoctorData
      );
      res.status(HTTP_statusCode.updated).json({
        message: RESPONSE_MESSAGES.DOCTOR_UPDATED_SUCCESS,
        updatedDoctor,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { emailData } = req.body

      const response = await this._doctorService.forgotPassword(emailData)

      if (!response) {
        return res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.EMAIL_NOT_FOUND })

      }
      return res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.EMAIL_VERIFIED, statusCode: HTTP_statusCode.OK })

    } catch (error) {
      console.log("Error in Forgot password", error)
    }
  }

  async verifyForgotOtp(req: Request, res: Response, next: NextFunction) {

    try {

      const { doctorData, otp } = req.body;

      await this._doctorService.verifyForgotOTP(doctorData, otp);

      res
        .status(HTTP_statusCode.OK)
        .json({ message: RESPONSE_MESSAGES.OTP_VERIFIED, doctor: doctorData });
    } catch (error) {
      console.error("OTP Verification Controller error:", error);
      if ((error as Error).message === RESPONSE_MESSAGES.OTP_EXPIRED) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.OTP_EXPIRED });
      } else if ((error as Error).message === RESPONSE_MESSAGES.INVALID_OTP) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.INVALID_OTP });
      } else if ((error as Error).message === RESPONSE_MESSAGES.NO_OTP_FOUND) {
        res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.NO_OTP_FOUND });
      } else {
        next(error)
      }
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {

      const { doctorData, payload } = req.body
      // console.error("Missing required fields:", { doctorData, payload });

      const result = await this._doctorService.resetPassword(doctorData, payload)

      if (result?.modifiedCount === 1) {
        return res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS });

      } else {
        return res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.PASSWORD_RESET_FAILED });

      }

    } catch (error) {

      return res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });

    }
  }

  async logoutDoctor(req: Request, res: Response) {
    try {
      res.cookie("AccessToken", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
      });
      res.clearCookie("RefreshToken", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.LOGOUT_FAILED, error });
    }
  }




  async createPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {

    try {
      const { doctor_id, user_id } = req.params;
      const { prescriptions, patientDetails, doctorDetails } = req.body;



      if (!doctor_id || !user_id || !prescriptions || prescriptions.length === 0) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.MISSING_REQUIRED_FIELDS });
        return;
      }

      
      // userId kittunint athil ninn booking id kand pikanm aa kittunna booking id athin appointmentId replace booking id aakenmath aakiya therrunna prshnm ollu 

      console.log('Pateincede Deatailssssssss:',patientDetails)

      const formData = {
        doctorId: doctor_id,
        userId: user_id,
        bookingId: patientDetails?.bookingIds,
        specializationId: doctorDetails?.specializationId,
        prescriptions: prescriptions,
        patientDetails,
        doctorDetails
      };

      console.log("oo",formData);
      
      const result = await this._doctorService.savePrescription(formData);

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.PRESCRIPTION_SUBMIT_SUCCESS, result });
    } catch (error) {
      console.error("Error submitting prescription:", error);
      next(error);
    }
  }


  async getReports(req: Request, res: Response): Promise<any> {
    try {
      const doctorId = req.params.doctorId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string || '';

      const reports = await this._doctorService.getReportsByUserId(doctorId,page,limit,search);

      res.status(HTTP_statusCode.OK).json({
        message: RESPONSE_MESSAGES.REPORT_FETCH_SUCCESS,
        reports,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.REPORT_FETCH_FAILED });
    }
  }


  async getPatientBookingForDoctor(req: Request, res: Response): Promise<any> {
    const { doctorId, userId } = req.params;



    try {
      const bookings = await this._doctorService.getBookingsByDoctorAndUser(doctorId, userId);
      res.status(HTTP_statusCode.OK).json(bookings);
    } catch (error) {
      console.error("Error in controller:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.SERVER_ERRORS });
    }
  };

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {

      const { doctor_id } = req.params;
      const notifications = await this._doctorService.getNotifications(doctor_id);
      res.status(HTTP_statusCode.OK).json(notifications);
    } catch (error) {
      next(error);
    }
  }
  async clearNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctor_id } = req.params
      await this._doctorService.clearNotifications(doctor_id)
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.NOTIFICATIONS_CLEAR_SUCCESS })
    } catch (error) {
      next(error)
    }
  }


  async getPrescriptionsByDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctor_id } = req.params;

       const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string || '';


      if (!doctor_id) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.DOCTOR_ID_REQUIRED });
        return;
      }

      const prescriptions = await this._doctorService.fetchPrescriptions(doctor_id,page,limit,search);

      res.status(HTTP_statusCode.OK).json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      next(error);
    }
  }


  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this._doctorService.getDashboardData()

      res.status(HTTP_statusCode.OK).json({ data: response })
    } catch (error) {
      next(error)
    }


  }

  async cancelAppoinment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appoinmentId } = req.params

      const result = await this._doctorService.cancelAppoinment(appoinmentId)

      res.status(HTTP_statusCode.OK).json({ success: true, appoinment: result })
    } catch (error) {
      next(error)
    }
  }

  async rescheduleAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { rescheduleAppointmentId } = req.params;
      const updatedData = req.body;

      const result = await this._doctorService.rescheduleAppointment(rescheduleAppointmentId, updatedData);

      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.APPOINTMENT_RESCHEDULED_SUCCESS,
        appointment: result
      });
    } catch (error) {
      next(error);
    }
  }



}

export { DoctorController}