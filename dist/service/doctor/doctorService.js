"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("../../config/cloudinary");
const doctorMapper_1 = require("../../utils/doctorMapper");
class Doctorservice {
    constructor(doctorRepository) {
        this._OTP = null;
        this._expiryOTP_time = null;
        this._doctorRepository = doctorRepository;
    }
    findAppointmentById(id) {
        throw new Error("Method not implemented.");
    }
    async findAllSpecializations() {
        try {
            return await this._doctorRepository.findAllSpecializations();
        }
        catch (error) {
            console.error("Error in service while fetching specializations:", error);
            throw error;
        }
    }
    async registerDoctor(doctorData) {
        try {
            const existingDoctor = await this._doctorRepository.existsDoctor(doctorData);
            if (existingDoctor) {
                throw new Error("Email already exist");
            }
            const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
            this._OTP = generateOtp;
            let text = `Your OTP is ${generateOtp}`;
            console.log(text);
            let subject = 'OTP Verification';
            const sentEmail = await (0, emailConfig_1.default)(doctorData.email, subject, text);
            if (!sentEmail) {
                throw new Error("Email not sent");
            }
            const OTP_createdTime = new Date();
            this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
            await this._doctorRepository.saveOtp(doctorData.email, this._OTP, this._expiryOTP_time);
        }
        catch (error) {
            console.error("Error in service:", error);
            throw new Error("Error in Doctor service");
        }
    }
    async verifyOtp(doctorData, otp) {
        try {
            const validateOtp = await this._doctorRepository.getOtpByEmail(doctorData.email);
            if (validateOtp.length === 0) {
                throw new Error("no OTP found for this email");
            }
            const sortedOtp = validateOtp.sort((a, b) => {
                if (b.createdAt.getTime() !== a.createdAt.getTime()) {
                    return b.createdAt.getTime() - a.createdAt.getTime();
                }
                else {
                    return b.expiresAt.getTime() - a.expiresAt.getTime();
                }
            });
            const latestOtp = sortedOtp[0];
            if (latestOtp.otp === otp) {
                if (latestOtp.expiresAt > new Date()) {
                    const hashedPassword = await bcrypt_1.default.hash(doctorData.password, 10);
                    const newUserData = { ...doctorData, password: hashedPassword };
                    await this._doctorRepository.createNewUser(newUserData);
                    await this._doctorRepository.deleteOtpById(latestOtp._id);
                }
                else {
                    await this._doctorRepository.deleteOtpById(latestOtp._id);
                    throw new Error("OTP has expired");
                }
            }
            else {
                throw new Error("Invalid OTP");
            }
        }
        catch (error) {
            const errorMessage = error.message || "An unknown error occurred";
            console.error("Error in OTP verification:", errorMessage);
            throw error;
        }
    }
    async resendOTP(email) {
        try {
            const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
            this._OTP = generatedOTP;
            const OTP_createdTime = new Date();
            this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
            await this._doctorRepository.saveOtp(email, this._OTP, this._expiryOTP_time);
            const isMailSent = await (0, emailConfig_1.default)(email, 'Resend OTP', `Your OTP is ${this._OTP}`);
            if (!isMailSent) {
                throw new Error("Failed to resend OTP email.");
            }
        }
        catch (error) {
            console.error("Error in resendOTP:", error.message);
            throw error;
        }
    }
    async LoginDoctor(email, password) {
        try {
            const doctor = await this._doctorRepository.findDoctor(email);
            if (doctor) {
                if (doctor.isBlocked) {
                    throw new Error("Your account is blocked.");
                }
                if (!doctor) {
                    console.log("doctor not found");
                    throw new Error("Usernotfound");
                }
                const isPasswordMatch = await bcrypt_1.default.compare(password, doctor.password);
                if (!isPasswordMatch) {
                    throw new Error("PasswordIncorrect");
                }
                if (!doctor._id) {
                    throw new Error("Doctor ID is missing");
                }
                const accessToken = jsonwebtoken_1.default.sign({ id: doctor._id.toString(), email: doctor.email, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "1h" });
                const refreshToken = jsonwebtoken_1.default.sign({ id: doctor._id.toString(), email: doctor.email, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
        }
        catch (error) {
            console.log("Error in login:", error);
            throw error;
        }
    }
    async kycSubmit(formData, files) {
        try {
            const documents = {};
            if (files.profileImage?.[0]) {
                const profileImageUrl = await (0, cloudinary_1.uploadToCloudinary)(files.profileImage[0].buffer, "doctor_profileImage");
                documents.profileImageUrl = profileImageUrl.secure_url;
            }
            if (files.aadhaarFrontSide?.[0]) {
                const aadhaarFrontSideUrl = await (0, cloudinary_1.uploadToCloudinary)(files.aadhaarFrontSide[0].buffer, "doctor_aadhaarFrontSide");
                console.log("**********>>>>", aadhaarFrontSideUrl);
                documents.aadhaarFrontSideUrl = aadhaarFrontSideUrl.secure_url;
            }
            if (files.aadhaarBackSide?.[0]) {
                const aadhaarBackSideUrl = await (0, cloudinary_1.uploadToCloudinary)(files.aadhaarBackSide[0].buffer, "doctor_aadhaarBackSide");
                documents.aadhaarBackSideUrl = aadhaarBackSideUrl.secure_url;
            }
            if (files.certificate?.[0]) {
                const certificateUrl = await (0, cloudinary_1.uploadToCloudinary)(files.certificate[0].buffer, "doctor_certificate");
                documents.certificateUrl = certificateUrl.secure_url;
            }
            await this._doctorRepository.saveKyc(formData, documents);
            return await this._doctorRepository.changeKycStatus(formData.doctor_id, documents.profileImageUrl);
        }
        catch (error) {
            console.error("Error in kycSubmit service:", error);
            throw new Error("Failed to submit KYC data");
        }
    }
    async kycStatus(doctorId) {
        try {
            const kycStatus = await this._doctorRepository.getDoctorStatus(doctorId);
            return kycStatus;
        }
        catch (error) {
            console.error("Error in kycStatus service:", error);
            throw new Error("Failed to retrieve KYC status");
        }
    }
    async googleSignUpUser(decodedToken) {
        const email = decodedToken.email;
        const name = decodedToken.name;
        let existedemail = await this._doctorRepository.existingUser(email);
        if (!existedemail) {
            try {
                const newUser = { email, name, password: null };
                const createdUser = await this._doctorRepository.createUsers(newUser);
                return createdUser;
            }
            catch (error) {
                console.error("Error creating user:", error);
                throw new Error("User creation failed");
            }
        }
        else {
            return existedemail;
        }
    }
    async getSpecialization(doctorId) {
        try {
            return await this._doctorRepository.getSpecialization(doctorId);
        }
        catch (error) {
            console.log("Error in service while specialization fetching", error);
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
    async storeAppoinmentData(appointmentData) {
        try {
            const validatedAppointment = await this.validateSingleAppointment(appointmentData);
            const createdAppointment = await this._doctorRepository.createNewAppoinment(validatedAppointment);
            return createdAppointment;
        }
        catch (error) {
            console.error('Error storing single appointment:', error);
            throw error;
        }
    }
    async storeMultipleAppointments(appointments) {
        try {
            const validAppointments = await this.validateAppointments(appointments);
            const createdAppointments = await this._doctorRepository.createMultipleAppointments(validAppointments);
            return createdAppointments;
        }
        catch (error) {
            console.error('Error storing multiple appointments:', error);
            throw error;
        }
    }
    async validateAppointments(appointments) {
        const validAppointments = [];
        for (const appointment of appointments) {
            try {
                await this.validateSingleAppointment(appointment);
                validAppointments.push(appointment);
            }
            catch (error) {
                console.warn('Skipping appointment due to validation error:', error);
            }
        }
        return validAppointments;
    }
    async validateSingleAppointment(appointmentData) {
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
    async getAppoinmentSchedules(doctor_id, page = 1, limit = 5, search = '') {
        try {
            return await this._doctorRepository.fetchAppoinmentData(doctor_id, page, limit, search);
        }
        catch (error) {
            throw new Error("Error getting sessin shedule data");
        }
    }
    async fetchBookingDetails(doctor_id) {
        try {
            const response = await this._doctorRepository.fecthBookingDetails(doctor_id);
            return response;
        }
        catch (error) {
            console.log("Error fect booking details", error);
        }
    }
    async fetchUsers(doctorId) {
        try {
            return await this._doctorRepository.fetchUsers(doctorId);
        }
        catch (error) {
        }
    }
    async getAllBookings(doctor_id, page = 1, limit = 5, search = '') {
        try {
            return await this._doctorRepository.getAllBookings(doctor_id, page, limit, search);
        }
        catch (error) {
            console.log("Error in fetching doctor's bookings:", error);
        }
    }
    async getDoctor(doctor_id) {
        try {
            const doctorData = await this._doctorRepository.getDoctor(doctor_id);
            if (!doctorData || doctorData.length === 0)
                return null;
            return (0, doctorMapper_1.toDoctorProfileDTO)(doctorData[0]);
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async forgotPassword(UserEmail) {
        try {
            const userResponse = await this._doctorRepository.findUserEmail(UserEmail);
            if (!userResponse) {
                throw new Error("Invalid email Address");
            }
            const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
            this._OTP = generateOtp;
            const isMailSet = await (0, emailConfig_1.default)(UserEmail, "otp", this._OTP);
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
            await this._doctorRepository.saveOTP(UserEmail, this._OTP, this._expiryOTP_time);
            return userResponse;
        }
        catch (error) {
            console.log("Error in userservice forgot password", error);
        }
    }
    async verifyForgotOTP(doctorData, otp) {
        try {
            const validateOtp = await this._doctorRepository.getOtpsByEmail(doctorData);
            if (validateOtp.length === 0) {
                throw new Error("no OTP found for this email");
            }
            const latestOtp = validateOtp.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
            if (latestOtp.otp === otp) {
                if (latestOtp.expiresAt > new Date()) {
                    await this._doctorRepository.deleteOtpById(latestOtp._id);
                }
                else {
                    await this._doctorRepository.deleteOtpById(latestOtp._id);
                    throw new Error("OTP has expired");
                }
            }
            else {
                throw new Error("Invalid OTP");
            }
        }
        catch (error) {
            const errorMessage = error.message || "An unknown error occurred";
            console.error("Error in OTP verification:", errorMessage);
            throw error;
        }
    }
    async resetPassword(doctorData, payload) {
        try {
            const { newPassword } = payload;
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            const response = await this._doctorRepository.saveResetPassword(doctorData, hashedPassword);
            return response;
        }
        catch (error) {
            console.log("Error is", error);
        }
    }
    async getWallet(doctor_id, page = 1, limit = 5) {
        return await this._doctorRepository.fetchWalletData(doctor_id, page, limit);
    }
    async withdraw(doctor_id, amount) {
        try {
            return await this._doctorRepository.withdrawMoney(doctor_id, amount);
        }
        catch (error) {
            throw Error(error);
        }
    }
    async fetchDoctor(doctor_id) {
        return await this._doctorRepository.getDoctorProfile(doctor_id);
    }
    async updateDoctor(doctor_id, doctorData) {
        try {
            const { profileImage, name, email, phone, yearsOfExperience, gender, language, dailySessionLimit, about, specializations } = doctorData;
            const existingDoctor = await this._doctorRepository.updateDoctorData(doctor_id);
            if (!existingDoctor) {
                throw new Error("Doctor not found");
            }
            if (profileImage)
                existingDoctor.profileImage = profileImage;
            if (name)
                existingDoctor.name = name;
            if (email)
                existingDoctor.email = email;
            if (phone)
                existingDoctor.phone = phone;
            if (yearsOfExperience)
                existingDoctor.yearsOfExperience = yearsOfExperience;
            if (gender)
                existingDoctor.gender = gender;
            if (language)
                existingDoctor.language = language;
            if (about)
                existingDoctor.about = about;
            if (dailySessionLimit)
                existingDoctor.dailySessionLimit = dailySessionLimit;
            if (Array.isArray(specializations)) {
                existingDoctor.specializations = specializations;
            }
            await existingDoctor.save();
            return existingDoctor;
        }
        catch (error) {
            console.error("Error in service layer:", error);
            throw new Error("Failed to update doctor");
        }
    }
    async savePrescription(data) {
        return await this._doctorRepository.create(data);
    }
    async fetchPrescriptions(doctor_id, page = 1, limit = 5, search = '') {
        return await this._doctorRepository.getPrescriptionsByDoctor(doctor_id, page, limit, search);
    }
    async getReportsByUserId(doctorId, page = 1, limit = 5, search = '') {
        return await this._doctorRepository.getReportsByUserId(doctorId, page, limit, search);
    }
    async getBookingsByDoctorAndUser(doctorId, userId) {
        return await this._doctorRepository.findByDoctorAndUser(doctorId, userId);
    }
    ;
    async getNotifications(doctorId) {
        try {
            return await this._doctorRepository.fetchNotifications(doctorId);
        }
        catch (error) {
            throw new Error('failed to find notifications');
        }
    }
    async clearNotifications(doctorId) {
        try {
            return await this._doctorRepository.deleteDoctorNotifications(doctorId);
        }
        catch (error) {
            throw new Error('failed to delete notifications');
        }
    }
    async getDashboardData() {
        try {
            return await this._doctorRepository.getAllStatistics();
        }
        catch (error) {
            throw Error(error);
        }
    }
    async cancelAppoinment(id) {
        try {
            const appoinment = await this._doctorRepository.cancelAppoinment(id);
            if (!appoinment) {
                throw new Error('Appoinment not found');
            }
            return appoinment;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async rescheduleAppointment(id, updatedData) {
        try {
            const existingAppointment = await this._doctorRepository.findAppointmentById(id);
            if (!existingAppointment) {
                throw new Error('Appointment not found');
            }
            if (existingAppointment.status !== "Confirmed") {
                throw new Error('Only confirmed appointments can be rescheduled');
            }
            const conflicts = await this._doctorRepository.checkSchedulingConflicts(existingAppointment.doctorId, id, updatedData.selectedDate, updatedData.startTime, updatedData.endTime);
            if (conflicts && conflicts.length > 0) {
                throw new Error('There is a scheduling conflict with another appointment');
            }
            const appointment = await this._doctorRepository.rescheduleAppointment(id, updatedData);
            return appointment;
        }
        catch (error) {
            throw new Error(error.message || 'Failed to reschedule appointment');
        }
    }
}
exports.default = Doctorservice;
