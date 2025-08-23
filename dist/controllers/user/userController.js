"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const HttpStatusCode_1 = __importDefault(require("../../enums/HttpStatusCode"));
const messages_1 = __importDefault(require("../../enums/messages"));
const jwt_decode_1 = require("jwt-decode");
const cloudinary_1 = require("../../config/cloudinary");
class AuthController {
    // private authService:AuthService
    constructor(authService) {
        this.logout = async (req, res) => {
            try {
                res.clearCookie("AccessToken", {
                    httpOnly: true,
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
        };
        this._authService = authService;
    }
    async createUser(req, res) {
        try {
            const data = req.body;
            const response = await this._authService.signUp(data);
            res.status(HttpStatusCode_1.default.OK).json({ status: true, response });
        }
        catch (error) {
            if (error.message === messages_1.default.EMAIL_IN_USE) {
                res.status(HttpStatusCode_1.default.Conflict).json({ message: messages_1.default.EMAIL_IN_USE });
            }
            else if (error.message === messages_1.default.PHONE_IN_USE) {
                res.status(HttpStatusCode_1.default.Conflict).json({ message: messages_1.default.PHONE_IN_USE });
            }
            else if (error.message === messages_1.default.OTP_NOT_SENT) {
                res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.OTP_NOT_SENT });
            }
            else {
                res
                    .status(HttpStatusCode_1.default.InternalServerError)
                    .json({ message: messages_1.default.SERVER_ERROR });
            }
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { userData, otp } = req.body;
            let resp = await this._authService.verifyOTP(userData, otp);
            res
                .status(200)
                .json({ message: messages_1.default.OTP_VERIFIED, user: userData });
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
    async verifyForgotOtp(req, res, next) {
        try {
            const { userData, otp } = req.body;
            await this._authService.verifyForgotOTP(userData, otp);
            res
                .status(HttpStatusCode_1.default.OK)
                .json({ message: messages_1.default.OTP_VERIFIED, user: userData });
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
            await this._authService.resendOTP(email);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.OTP_RESEND });
        }
        catch (error) {
            console.error("Resend OTP Controller error:", error);
            if (error.message === messages_1.default.USER_NOT_FOUND) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.USER_NOT_FOUND });
            }
            else {
                res;
                next(error);
            }
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this._authService.login(email, password);
            res.cookie("RefreshToken", user.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            res.cookie("AccessToken", user.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.LOGIN_SUCCESS, user: user.user });
        }
        catch (error) {
            console.log("errrrrr", error.message);
            if (error.message === messages_1.default.ACCOUNT_BLOCKED) {
                res.status(HttpStatusCode_1.default.NoAccess).json({ message: messages_1.default.ACCOUNT_BLOCKED });
            }
            else if (error.message === messages_1.default.INVALID_CREDENTIALS) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({ message: messages_1.default.INVALID_CREDENTIALS });
            }
            else {
                next(error);
            }
        }
    }
    async googleSignUpUser(req, res, next) {
        try {
            const token = req.body.token;
            const decodedToken = (0, jwt_decode_1.jwtDecode)(token);
            const response = await this._authService.googleSignUpUser(decodedToken);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.SIGNUP_SUCCESS });
            return;
        }
        catch (error) {
            console.error("Error during Google Sign Up:", error);
            // return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { emailData } = req.body;
            console.log("got email from body", emailData);
            const response = await this._authService.forgotPassword(emailData);
            if (!response) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.EMAIL_NOT_FOUND });
            }
            return res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.EMAIL_VERIFIED, statusCode: HttpStatusCode_1.default.OK });
        }
        catch (error) {
            console.log("Error in Forgot password", error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { userData, payload } = req.body;
            const result = await this._authService.resetPassword(userData, payload);
            if (result?.modifiedCount === 1) {
                return res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.PASSWORD_RESET_SUCCESS });
            }
            else {
                return res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.PASSWORD_RESET_FAILED });
            }
        }
        catch (error) {
            console.log("User Controller Error", error);
            return res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.INTERNAL_SERVER_ERROR });
        }
    }
    async fetchAllSpecializations(req, res, next) {
        try {
            const response = await this._authService.fetchSpecialization();
            res.status(HttpStatusCode_1.default.OK).json(response);
        }
        catch (error) {
            console.log("Error in fetching specialization data in controller", error);
        }
    }
    async getAllDoctors(req, res, next) {
        try {
            const allDoctors = await this._authService.getAllDoctors();
            res.status(HttpStatusCode_1.default.OK).json(allDoctors);
        }
        catch (error) {
            console.log("Error fetching Doctors", error);
        }
    }
    async getDoctor(req, res, next) {
        try {
            const doctorId = req.params.doctorId;
            if (!doctorId) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.DOCTOR_ID_REQUIRED });
            }
            const doctor = await this._authService.getDoctor(doctorId);
            if (!doctor) {
                res.status(HttpStatusCode_1.default.NotFound).json({ message: messages_1.default.DOCTOR_NOT_FOUND });
            }
            res.status(HttpStatusCode_1.default.OK).json(doctor);
        }
        catch (error) {
            console.error("Error in getdoctor controller:", error);
            next(error);
        }
    }
    async getUserStatus(req, res, next) {
        try {
            if (!req.authData) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({ message: messages_1.default.UNAUTHORIZED_ACCESS });
                return;
            }
            const userId = req.authData.id;
            const userStatus = await this._authService.getUserStatus(userId);
            res.status(HttpStatusCode_1.default.OK).json(userStatus);
        }
        catch (error) {
            console.error("Error fetching user status:", error);
            next(error);
        }
    }
    async getAppoinmentSchedules(req, res, next) {
        try {
            const sessionSchedules = await this._authService.getAppoinmentSchedules();
            res.status(HttpStatusCode_1.default.OK).json(sessionSchedules);
        }
        catch (error) {
            next(error);
        }
    }
    async checkoutPayment(req, res, next) {
        try {
            const userId = req.body.userData.id;
            const appoinmentID = req.params.appoinmentId;
            const paymentResponse = await this._authService.checkoutPayment(appoinmentID, userId);
            res.status(HttpStatusCode_1.default.OK).json({ id: paymentResponse?.id });
        }
        catch (error) {
            console.log("error while payment in controller", error);
        }
    }
    async createBooking(req, res, next) {
        try {
            const { sessionId, userId, stripe_session_id } = req.body;
            const bookingDetails = await this._authService.findBookingDetails(sessionId, userId, stripe_session_id);
            res.status(HttpStatusCode_1.default.OK).json(bookingDetails);
        }
        catch (error) {
            console.log("Error in create booking in controller", error);
        }
    }
    async contact(req, res, next) {
        try {
            const { name, email, subject, phone, message, timestamp } = req.body;
            const response = await this._authService.contact(name, email, subject, phone, message, timestamp);
            res.status(HttpStatusCode_1.default.OK).json(response);
        }
        catch (error) {
            console.log("error in contact form", error);
        }
    }
    async getUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const response = await this._authService.fechtUserData(userId);
            res.status(HttpStatusCode_1.default.OK).json({ response });
        }
        catch (error) {
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const response = await this._authService.getAllUsers();
            res.status(HttpStatusCode_1.default.OK).json({ response });
        }
        catch (error) {
            console.log("error in controler", error);
        }
    }
    async getNotifications(req, res, next) {
        try {
            const { user_id } = req.params;
            const notifications = await this._authService.getNotifications(user_id);
            res.status(HttpStatusCode_1.default.OK).json(notifications);
        }
        catch (error) {
            next(error);
        }
    }
    async clearNotifications(req, res, next) {
        try {
            const { user_id } = req.params;
            await this._authService.clearNotifications(user_id);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.NOTIFICATIONS_CLEAR_SUCCESS });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUserData(req, res, next) {
        try {
            const userData = req.body;
            const userId = req.body._id || req.body.id;
            if (req.file) {
                try {
                    const currentUser = await this._authService.getUserById(userId);
                    const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'user_profiles');
                    if (currentUser.profileImage) {
                        await (0, cloudinary_1.deleteFromCloudinary)(currentUser.profileImage);
                    }
                    userData.profileImage = uploadResult.secure_url;
                }
                catch (uploadError) {
                    console.error('Error uploading image to Cloudinary:', uploadError);
                    res.status(HttpStatusCode_1.default.BadRequest).json({
                        message: 'Failed to upload profile image'
                    });
                    return;
                }
            }
            const updatedUser = await this._authService.editUserData(userId, userData);
            res.status(HttpStatusCode_1.default.OK).json({
                message: messages_1.default.USER_UPDATED,
                user: updatedUser
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllBookings(req, res, next) {
        try {
            const user_id = req.params.user_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            const result = await this._authService.getAllBookings(user_id, page, limit, search);
            console.log("nnn", result);
            res.status(HttpStatusCode_1.default.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async cancelAppoinment(req, res, next) {
        try {
            const { appoinmentId, userId, doctorId } = req.body;
            const cancelAndRefund = await this._authService.cancelAppoinment(appoinmentId, userId, doctorId);
            res.status(HttpStatusCode_1.default.OK).json(cancelAndRefund);
        }
        catch (error) {
            console.log("Error in cancel appoinment", error);
        }
    }
    async getBookedDoctor(req, res, next) {
        try {
            const { userId } = req.params;
            const doctors = await this._authService.getBookedDoctor(userId);
            return res.status(HttpStatusCode_1.default.OK).json(doctors);
        }
        catch (error) {
            console.error("Error fetching booked doctors:", error);
            return res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.SERVER_ERRORS });
        }
    }
    async getWalletData(req, res, next) {
        try {
            const userId = req.params.user_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const walletData = await this._authService.getWallet(userId, page, limit);
            res.status(HttpStatusCode_1.default.OK).json(walletData);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPasswords(req, res, next) {
        try {
            const { user_id } = req.params;
            const { currentPassword, newPassword } = req.body;
            await this._authService.resetPasswords(user_id, currentPassword, newPassword);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.PASSWORD_CHANGED });
        }
        catch (error) {
            next(error);
        }
    }
    async downloadPrescriptionPDF(req, res, next) {
        try {
            const { prescriptionId, userId } = req.params;
            if (!prescriptionId || !userId) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({
                    message: 'Prescription ID and User ID are required'
                });
            }
            const response = await this._authService.downloadPrescriptionPDF(prescriptionId, userId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${response.filename}`);
            res.setHeader('Content-Length', response.buffer.length);
            res.send(response.buffer);
        }
        catch (error) {
            console.log("Error in downloading prescription PDF in controller", error);
            res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: 'Error generating PDF'
            });
        }
    }
    async getPrescription(req, res, next) {
        try {
            const { user_id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            if (!user_id) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.DOCTOR_ID_REQUIRED });
                return;
            }
            const prescriptions = await this._authService.fetchPrescriptions(user_id, page, limit, search);
            res.status(HttpStatusCode_1.default.OK).json(prescriptions);
        }
        catch (error) {
            console.error("Error fetching prescriptions:", error);
            next(error);
        }
    }
    async findBookings(req, res, next) {
        try {
            const { user_id, doctor_id } = req.params;
            const bookingStatus = await this._authService.findBookings(user_id, doctor_id);
            res.status(HttpStatusCode_1.default.OK).json(bookingStatus);
        }
        catch (error) {
            next(error);
        }
    }
    async addReport(req, res) {
        try {
            const { userId, userName, userEmail, doctorId } = req.body;
            console.log("docotr", doctorId);
            const file = req.file;
            const result = await this._authService.addReport(file, { userId, userName, userEmail, doctorId });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: messages_1.default.REPORT_UPLOAD_SUCCESS,
                ...result,
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            return res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.REPORT_UPLOAD_FAILED });
        }
    }
    async getReports(req, res) {
        try {
            const userId = req.params.userId;
            const reports = await this._authService.getReportsByUserId(userId);
            res.status(HttpStatusCode_1.default.OK).json({
                message: messages_1.default.REPORT_FETCH_SUCCESS,
                reports,
            });
        }
        catch (error) {
            console.error('Fetch error:', error);
            res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.REPORT_FETCH_FAILED });
        }
    }
    async addReview(req, res, next) {
        try {
            const { reviewComment, selectedRating, userId, doctorId } = req.body;
            const response = await this._authService.addReview(reviewComment, selectedRating, userId, doctorId);
            let reviewId = response._id;
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.REVIEW_ADD_SUCCESS, reviewId });
        }
        catch (error) {
            next(error);
        }
    }
    async getReivew(req, res, next) {
        try {
            const { doctor_id } = req.params;
            const reviews = await this._authService.reviews(doctor_id);
            res.status(HttpStatusCode_1.default.OK).json(reviews);
        }
        catch (error) {
            next(error);
        }
    }
    async editReview(req, res, next) {
        try {
            const { reviewComment, selectedRating, reviewId } = req.body;
            const response = await this._authService.editReview(reviewComment, selectedRating, reviewId);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.REVIEW_EDIT_SUCCESS, response });
        }
        catch (error) {
            next(error);
        }
    }
    async getReivewSummary(req, res, next) {
        try {
            const { doctor_id } = req.params;
            const reviewsAndAvgRating = await this._authService.getReivewSummary(doctor_id);
            res.status(HttpStatusCode_1.default.OK).json(reviewsAndAvgRating);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
