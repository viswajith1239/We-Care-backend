"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const HttpStatusCode_1 = __importDefault(require("../../enums/HttpStatusCode"));
const messages_1 = __importDefault(require("../../enums/messages"));
const jwt_decode_1 = require("jwt-decode");
const rrule_1 = require("rrule");
const cloudinary_1 = require("../../config/cloudinary");
const moment_1 = __importDefault(require("moment"));
class DoctorController {
    constructor(doctorService) {
        this._doctorService = doctorService;
    }
    async getAllSpecializations(req, res, next) {
        try {
            const specializationsData = await this._doctorService.findAllSpecializations();
            res.status(HttpStatusCode_1.default.OK).json({ success: true, data: specializationsData });
        }
        catch (error) {
            console.error("Error in controller while fetching specializations:", error);
            res;
            next(error);
        }
    }
    async registerDoctor(req, res, next) {
        try {
            const doctorData = req.body;
            const doctor = await this._doctorService.registerDoctor(doctorData);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.OTP_SEND });
        }
        catch (error) {
            console.error("Error in registerDoctor:", error);
            if (error.message === messages_1.default.EMAIL_EXISTS) {
                res.status(HttpStatusCode_1.default.Conflict).json({ message: messages_1.default.EMAIL_EXISTS });
                return;
            }
            else {
                next(error);
            }
        }
    }
    async verifyOtp(req, res, next) {
        try {
            let { doctorData, otp } = req.body;
            await this._doctorService.verifyOtp(doctorData, otp);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.OTP_VERIFIED, doctor: doctorData });
        }
        catch (error) {
            console.error("OTP Verification Controller error:", error);
            if (error.message === messages_1.default.OTP_EXPIRED) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.OTP_EXPIRED });
            }
            else if (error.message === messages_1.default.INVALID_OTP) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.INVALID_OTP });
            }
            else if (error.message === messages_1.default.NO_OTP_FOUND) {
                res.status(HttpStatusCode_1.default.NotFound).json({ message: messages_1.default.NO_OTP_FOUND });
            }
            else {
                next(error);
            }
        }
    }
    async resendOtp(req, res, next) {
        try {
            const { email } = req.body;
            await this._doctorService.resendOTP(email);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.OTP_RESEND });
        }
        catch (error) {
            console.error("Resend OTP Controller error:", error);
            if (error.message === messages_1.default.USER_NOT_FOUND) {
                res.status(HttpStatusCode_1.default.NotFound).json({ message: messages_1.default.USER_NOT_FOUND });
            }
            else {
                next(error);
            }
        }
    }
    async loginDoctor(req, res, next) {
        try {
            const { email, password } = req.body;
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
                res.status(HttpStatusCode_1.default.OK).json({
                    message: messages_1.default.LOGIN_SUCCESS,
                    doctor: user.user,
                });
            }
        }
        catch (error) {
            console.error("Error in loginDoctor:", error.message);
            if (error.message === messages_1.default.ACCOUNT_BLOCKED) {
                res.status(HttpStatusCode_1.default.NoAccess).json({ message: messages_1.default.ACCOUNT_BLOCKED });
            }
            else if (error.message === messages_1.default.USER_NOT_FOUND) {
                res.status(HttpStatusCode_1.default.NotFound).json({ message: messages_1.default.USER_NOT_FOUND });
            }
            else if (error.message === "PasswordIncorrect") {
                res.status(HttpStatusCode_1.default.Unauthorized).json({ message: messages_1.default.INVALID_CREDENTIALSS });
            }
            else {
                next(error);
            }
        }
    }
    async kycSubmission(req, res, next) {
        try {
            const { doctor_id, name, email, phone } = req.body;
            const files = req.files;
            const formData = {
                name,
                email,
                phone,
                doctor_id
            };
            const kycStatus = await this._doctorService.kycSubmit(formData, files);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.KYC_SUBMIT_SUCCESS, kycStatus });
        }
        catch (error) {
            console.error("Error in KYC submission:", error);
            next(error);
        }
    }
    async doctorKycStatus(req, res, next) {
        try {
            const doctorId = req.params.doctorId;
            const kycStatus = await this._doctorService.kycStatus(doctorId);
            res.status(HttpStatusCode_1.default.OK).json({ kycStatus });
        }
        catch (error) {
            console.error("Error fetching doctor KYC status:", error);
            next(error);
        }
    }
    async googleSignUpUser(req, res, next) {
        try {
            const token = req.body.token;
            const decodedToken = (0, jwt_decode_1.jwtDecode)(token);
            const response = await this._doctorService.googleSignUpUser(decodedToken);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.SIGNUP_SUCCESS });
            res.status(HttpStatusCode_1.default.OK).json({
                message: messages_1.default.SIGNUP_SUCCESS,
                user: response,
                token: token,
            });
        }
        catch (error) {
            console.error("Error during Google Sign Up:", error);
            // return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getSpecialization(req, res, next) {
        try {
            const doctorId = req.params.doctorId;
            const specialisations = await this._doctorService.getSpecialization(doctorId);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.SPECIALIZATION_FETCH_SUCCESS, data: specialisations });
        }
        catch (error) {
            console.log("Error in contoller", error);
            next(error);
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
    async storeAppoinmentData(req, res, next) {
        try {
            const { selectedDate, startTime, endTime, specialization, price, status, isRecurring, recurrenceType, recurrenceInterval, recurrenceEnd, daysOfWeek } = req.body;
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
            }
            else {
                const appoinmentData = {
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
                };
                const apponmentscreated = await this._doctorService.storeAppoinmentData(appoinmentData);
                return res
                    .status(201)
                    .json({
                    message: "Appointment created successfully.",
                    apponmentscreated
                });
            }
        }
        catch (error) {
            this.handleAppointmentErrors(error, res, next);
        }
    }
    generateRecurringAppointments(config) {
        const { doctorId, selectedDate, startTime, endTime, specialization, price, status, recurrenceType, recurrenceInterval, recurrenceEnd, daysOfWeek } = config;
        let rruleOptions = {
            dtstart: new Date(selectedDate),
            until: new Date(recurrenceEnd),
            interval: recurrenceInterval
        };
        switch (recurrenceType) {
            case 'Daily':
                rruleOptions.freq = rrule_1.RRule.DAILY;
                break;
            case 'Weekly':
                rruleOptions.freq = rrule_1.RRule.WEEKLY;
                if (daysOfWeek && daysOfWeek.length > 0) {
                    rruleOptions.byweekday = daysOfWeek;
                }
                else {
                    rruleOptions.byweekday = [0, 1, 2, 3, 4];
                }
                break;
            case 'Monthly':
                rruleOptions.freq = rrule_1.RRule.MONTHLY;
                break;
            default:
                throw new Error('Invalid recurrence type');
        }
        const rule = new rrule_1.RRule(rruleOptions);
        const dates = rule.all();
        const appoinments = dates.map(date => ({
            selectedDate: (0, moment_1.default)(date).format('YYYY-MM-DD'),
            startTime,
            endTime,
            specialization,
            price,
            doctorId,
            status: status || 'Pending'
        }));
        return appoinments;
    }
    handleAppointmentErrors(error, res, next) {
        if (error.message === "Time conflict with an existing appointment.") {
            return res
                .status(400)
                .json({ message: "Time conflict with an existing session." });
        }
        else if (error.message === "End time must be after start time") {
            return res
                .status(400)
                .json({ message: "End time must be after start time" });
        }
        else if (error.message === "Appointment duration must be at least 30 minutes") {
            return res
                .status(400)
                .json({ message: "Appointment duration must be at least 30 minutes" });
        }
        else {
            console.error("Detailed server error:", error);
            next(error);
        }
    }
    async getAppoinmentSchedules(req, res, next) {
        try {
            const doctor_id = req.params.doctorId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const sheduleData = await this._doctorService.getAppoinmentSchedules(doctor_id, page, limit);
            res
                .status(HttpStatusCode_1.default.OK)
                .json({ message: messages_1.default.SESSION_FETCH_SUCCESS, sheduleData });
        }
        catch (error) {
            console.error("Error saving session data:", error);
            next(error);
        }
    }
    async fetchBookingDetails(req, res, next) {
        try {
            const doctor_id = req.params.doctorId;
            const bookingDetails = await this._doctorService.fetchBookingDetails(doctor_id);
            res.status(HttpStatusCode_1.default.OK).json({ data: bookingDetails });
        }
        catch (error) {
            console.error("Error fetching booking details:", error);
            res.status(HttpStatusCode_1.default.InternalServerError).json({ error: "Failed to fetch booking details." });
        }
    }
    async fetchUsers(req, res, next) {
        try {
            const { doctorId } = req.params;
            const users = await this._doctorService.fetchUsers(doctorId);
            return res.status(HttpStatusCode_1.default.OK).json(users);
        }
        catch (error) {
        }
    }
    async getAllBookings(req, res, next) {
        try {
            const doctor_id = req.params.doctor_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            console.log("sea", search);
            const bookings = await this._doctorService.getAllBookings(doctor_id, page, limit, search);
            res.status(HttpStatusCode_1.default.OK).json(bookings);
        }
        catch (error) {
            next(error);
        }
    }
    async getDoctor(req, res, next) {
        try {
            const doctor_id = req.params.doctor_id;
            const DoctorData = await this._doctorService.getDoctor(doctor_id);
            res.status(HttpStatusCode_1.default.OK).json({
                DoctorData: DoctorData,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getWalletData(req, res, next) {
        try {
            const doctorId = req.params.doctor_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const walletData = await this._doctorService.getWallet(doctorId, page, limit);
            res.status(HttpStatusCode_1.default.OK).json(walletData);
        }
        catch (error) {
            next(error);
        }
    }
    async withdraw(req, res, next) {
        try {
            const { doctor_id } = req.params;
            const { amount } = req.body;
            const withdrawed = await this._doctorService.withdraw(doctor_id, amount);
            res.status(HttpStatusCode_1.default.OK).json(withdrawed);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDoctor(req, res, next) {
        try {
            const doctor_id = req.params.doctor_id;
            const doctorData = req.body;
            const existingDoctorProfile = await this._doctorService.fetchDoctor(doctor_id);
            if (existingDoctorProfile) {
                await (0, cloudinary_1.deleteFromCloudinary)(existingDoctorProfile);
            }
            const documents = {};
            if (req.file) {
                const profileImageUrl = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, "doctor_profileImage");
                documents.profileImage = profileImageUrl.secure_url;
            }
            const updatedDoctorData = { ...doctorData, ...documents };
            const updatedDoctor = await this._doctorService.updateDoctor(doctor_id, updatedDoctorData);
            res.status(HttpStatusCode_1.default.updated).json({
                message: messages_1.default.DOCTOR_UPDATED_SUCCESS,
                updatedDoctor,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { emailData } = req.body;
            const response = await this._doctorService.forgotPassword(emailData);
            if (!response) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.EMAIL_NOT_FOUND });
            }
            return res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.EMAIL_VERIFIED, statusCode: HttpStatusCode_1.default.OK });
        }
        catch (error) {
            console.log("Error in Forgot password", error);
        }
    }
    async verifyForgotOtp(req, res, next) {
        try {
            const { doctorData, otp } = req.body;
            await this._doctorService.verifyForgotOTP(doctorData, otp);
            res
                .status(HttpStatusCode_1.default.OK)
                .json({ message: messages_1.default.OTP_VERIFIED, doctor: doctorData });
        }
        catch (error) {
            console.error("OTP Verification Controller error:", error);
            if (error.message === messages_1.default.OTP_EXPIRED) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.OTP_EXPIRED });
            }
            else if (error.message === messages_1.default.INVALID_OTP) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.INVALID_OTP });
            }
            else if (error.message === messages_1.default.NO_OTP_FOUND) {
                res.status(HttpStatusCode_1.default.NotFound).json({ message: messages_1.default.NO_OTP_FOUND });
            }
            else {
                next(error);
            }
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { doctorData, payload } = req.body;
            // console.error("Missing required fields:", { doctorData, payload });
            const result = await this._doctorService.resetPassword(doctorData, payload);
            if (result?.modifiedCount === 1) {
                return res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.PASSWORD_RESET_SUCCESS });
            }
            else {
                return res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.PASSWORD_RESET_FAILED });
            }
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.INTERNAL_SERVER_ERROR });
        }
    }
    async logoutDoctor(req, res) {
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
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.LOGOUT_SUCCESS });
        }
        catch (error) {
            res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.LOGOUT_FAILED, error });
        }
    }
    async createPrescription(req, res, next) {
        try {
            const { doctor_id, user_id } = req.params;
            const { prescriptions, patientDetails, doctorDetails } = req.body;
            if (!doctor_id || !user_id || !prescriptions || prescriptions.length === 0) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.MISSING_REQUIRED_FIELDS });
                return;
            }
            // userId kittunint athil ninn booking id kand pikanm aa kittunna booking id athin appointmentId replace booking id aakenmath aakiya therrunna prshnm ollu 
            console.log('Pateincede Deatailssssssss:', patientDetails);
            const formData = {
                doctorId: doctor_id,
                userId: user_id,
                bookingId: patientDetails?.bookingIds,
                specializationId: doctorDetails?.specializationId,
                prescriptions: prescriptions,
                patientDetails,
                doctorDetails
            };
            console.log("oo", formData);
            const result = await this._doctorService.savePrescription(formData);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.PRESCRIPTION_SUBMIT_SUCCESS, result });
        }
        catch (error) {
            console.error("Error submitting prescription:", error);
            next(error);
        }
    }
    async getReports(req, res) {
        try {
            const doctorId = req.params.doctorId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            const reports = await this._doctorService.getReportsByUserId(doctorId, page, limit, search);
            res.status(HttpStatusCode_1.default.OK).json({
                message: messages_1.default.REPORT_FETCH_SUCCESS,
                reports,
            });
        }
        catch (error) {
            console.error('Fetch error:', error);
            res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.REPORT_FETCH_FAILED });
        }
    }
    async getPatientBookingForDoctor(req, res) {
        const { doctorId, userId } = req.params;
        try {
            const bookings = await this._doctorService.getBookingsByDoctorAndUser(doctorId, userId);
            res.status(HttpStatusCode_1.default.OK).json(bookings);
        }
        catch (error) {
            console.error("Error in controller:", error);
            res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.SERVER_ERRORS });
        }
    }
    ;
    async getNotifications(req, res, next) {
        try {
            const { doctor_id } = req.params;
            const notifications = await this._doctorService.getNotifications(doctor_id);
            res.status(HttpStatusCode_1.default.OK).json(notifications);
        }
        catch (error) {
            next(error);
        }
    }
    async clearNotifications(req, res, next) {
        try {
            const { doctor_id } = req.params;
            await this._doctorService.clearNotifications(doctor_id);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.NOTIFICATIONS_CLEAR_SUCCESS });
        }
        catch (error) {
            next(error);
        }
    }
    async getPrescriptionsByDoctor(req, res, next) {
        try {
            const { doctor_id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            if (!doctor_id) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.DOCTOR_ID_REQUIRED });
                return;
            }
            const prescriptions = await this._doctorService.fetchPrescriptions(doctor_id, page, limit, search);
            res.status(HttpStatusCode_1.default.OK).json(prescriptions);
        }
        catch (error) {
            console.error("Error fetching prescriptions:", error);
            next(error);
        }
    }
    async getDashboardData(req, res, next) {
        try {
            const response = await this._doctorService.getDashboardData();
            res.status(HttpStatusCode_1.default.OK).json({ data: response });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelAppoinment(req, res, next) {
        try {
            const { appoinmentId } = req.params;
            const result = await this._doctorService.cancelAppoinment(appoinmentId);
            res.status(HttpStatusCode_1.default.OK).json({ success: true, appoinment: result });
        }
        catch (error) {
            next(error);
        }
    }
    async rescheduleAppointment(req, res, next) {
        try {
            const { rescheduleAppointmentId } = req.params;
            const updatedData = req.body;
            const result = await this._doctorService.rescheduleAppointment(rescheduleAppointmentId, updatedData);
            res.status(HttpStatusCode_1.default.OK).json({
                success: true,
                message: messages_1.default.APPOINTMENT_RESCHEDULED_SUCCESS,
                appointment: result
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DoctorController = DoctorController;
