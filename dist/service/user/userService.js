"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jspdf_1 = __importDefault(require("jspdf"));
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const stripeClients_1 = __importDefault(require("../../config/stripeClients"));
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("../../config/cloudinary");
const userMapper_1 = require("../../utils/userMapper");
class AuthService {
    constructor(authRepository) {
        this._userData = null;
        this._OTP = null;
        this._expiryOTP_time = null;
        this._authRepository = authRepository;
    }
    async signUp(userData) {
        try {
            const response = await this._authRepository.existUser(userData.email, userData.phone);
            if (response.existEmail) {
                throw new Error("Email already in use");
            }
            if (response.existPhone) {
                throw new Error("Phone already in use");
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
            const userId = (0, uuid_1.v4)();
            this._userData = {
                userId: userId,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: hashedPassword,
            };
            const Generated_OTP = Math.floor(1000 + Math.random() * 9000).toString();
            this._OTP = Generated_OTP;
            const text = `Your OTP is ${Generated_OTP}`;
            console.log(text);
            const subject = 'OTP Verification';
            const sendMailStatus = await (0, emailConfig_1.default)(userData.email, subject, text);
            console.log("OTP sent status:", sendMailStatus);
            if (!sendMailStatus) {
                throw new Error("Failed to send OTP");
            }
            const Generated_time = new Date();
            this._expiryOTP_time = new Date(Generated_time.getTime() + 60 * 1000);
            await this._authRepository.saveOTP(userData.email, this._OTP, this._expiryOTP_time);
            return {
                success: true,
                message: "Signup successful, OTP sent to email",
            };
        }
        catch (error) {
            console.error("Error in signup service:", error.message);
            throw error;
        }
    }
    async verifyOTP(userData, otp) {
        try {
            const validOtps = await this._authRepository.getOtpsByEmail(userData.email);
            if (validOtps.length === 0) {
                throw new Error("No OTP found for this email");
            }
            const latestOtp = validOtps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
            if (latestOtp.otp === otp) {
                if (latestOtp.expiresAt > new Date()) {
                    const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
                    const newUserData = {
                        userId: (0, uuid_1.v4)(),
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        password: hashedPassword,
                        isBlocked: false,
                    };
                    const userCreationResponse = await this._authRepository.createNewUser(newUserData);
                    await this._authRepository.deleteOtpById(latestOtp._id);
                    return { success: true, message: "User created successfully", user: userCreationResponse };
                }
                else {
                    await this._authRepository.deleteOtpById(latestOtp._id);
                    throw new Error("OTP has expired");
                }
            }
            else {
                throw new Error("Invalid OTP");
            }
        }
        catch (error) {
            const errorMessage = error.message || "An unknown error occurred";
            console.error("Error during OTP verification:", errorMessage);
            throw new Error(errorMessage);
        }
    }
    async resendOTP(email) {
        try {
            const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
            this._OTP = generatedOTP;
            const OTP_createdTime = new Date();
            this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
            await this._authRepository.saveOTP(email, this._OTP, this._expiryOTP_time);
            const isMailSent = await (0, emailConfig_1.default)(email, 'Resend OTP', `Your OTP is ${this._OTP}`);
            if (!isMailSent) {
                throw new Error("Failed to resend OTP email.");
            }
            console.log(`Resent OTP ${this._OTP} to ${email}`);
        }
        catch (error) {
            console.error("Error in resendOTP:", error.message);
            throw error;
        }
    }
    async login(email, password) {
        try {
            const userData = await this._authRepository.findUser(email);
            if (userData) {
                if (userData.isBlocked) {
                    throw new Error("Your account is blocked.");
                }
                const isPasswordMatch = await bcrypt_1.default.compare(password, userData.password || "");
                if (isPasswordMatch) {
                    if (!userData._id) {
                        throw new Error("User ID is missing");
                    }
                    const accessToken = jsonwebtoken_1.default.sign({ id: userData._id.toString(), email: userData.email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
                    const refreshToken = jsonwebtoken_1.default.sign({ id: userData._id.toString(), email: userData.email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async googleSignUpUser(decodedToken) {
        const email = decodedToken.email;
        const name = decodedToken.name;
        let existedemail = await this._authRepository.existingUser(email);
        if (!existedemail) {
            try {
                const newUser = { email, name, password: null };
                const createdUser = await this._authRepository.createUsers(newUser);
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
    async forgotPassword(UserEmail) {
        try {
            const userResponse = await this._authRepository.findUserEmail(UserEmail);
            if (!userResponse) {
                throw new Error("Invalid email Address");
            }
            const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
            this._OTP = generateOtp;
            console.log("Generated OTP is", this._OTP);
            const isMailSet = await (0, emailConfig_1.default)(UserEmail, "otp", this._OTP);
            if (!isMailSet) {
                throw new Error("Email not sent");
            }
            const OTP_createdTime = new Date();
            this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 1 * 60 * 1000);
            //   console.log("Saving OTP:", {
            //     email: UserEmail,
            //     otp: this._OTP,
            //     expiresAt: this._expiryOTP_time
            // });
            await this._authRepository.saveOTP(UserEmail, this._OTP, this._expiryOTP_time);
            return userResponse;
        }
        catch (error) {
            console.log("Error in userservice forgot password", error);
        }
    }
    async verifyForgotOTP(userData, otp) {
        try {
            const validateOtp = await this._authRepository.getOtpsByEmail(userData);
            if (validateOtp.length === 0) {
                console.log("there is no otp in email");
                throw new Error("no OTP found for this email");
            }
            const latestOtp = validateOtp.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
            if (latestOtp.otp === otp) {
                if (latestOtp.expiresAt > new Date()) {
                    await this._authRepository.deleteOtpById(latestOtp._id);
                }
                else {
                    await this._authRepository.deleteOtpById(latestOtp._id);
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
    async resetPassword(userData, payload) {
        try {
            const { newPassword } = payload;
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            const response = await this._authRepository.saveResetPassword(userData, hashedPassword);
            return response;
        }
        catch (error) {
            console.log("Error is", error);
        }
    }
    async fetchSpecialization() {
        try {
            const response = this._authRepository.fetchSpecializations();
            return response;
        }
        catch (error) {
            console.log("Error in fetchingspecializations userservice", error);
        }
    }
    async getAllDoctors() {
        try {
            const doctors = await this._authRepository.getAllDoctors();
            const validDoctors = doctors?.filter((doctor) => doctor.isBlocked === false && doctor.kycStatus === "approved") || [];
            return validDoctors;
        }
        catch (error) {
            console.log("Fetching doctors error in service", error);
        }
    }
    async getDoctor(doctorId) {
        try {
            return await this._authRepository.getDoctor(doctorId);
        }
        catch (error) {
            console.log("error is", error);
        }
    }
    async getUserStatus(userId) {
        const user = await this._authRepository.findUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return { isBlocked: user.isBlocked };
    }
    async getAppoinmentSchedules() {
        try {
            return await this._authRepository.fetchAllAppoinmentschedules();
        }
        catch (error) {
            console.log("Error is", error);
        }
    }
    async checkoutPayment(appoinmentid, userId) {
        try {
            const appoinmentData = await this._authRepository.findSessionDetails(appoinmentid);
            if (!appoinmentData || !appoinmentData.doctorId || !appoinmentData.price) {
                throw new Error("Missing session data, doctor ID, or price");
            }
            // const doctorid = appoinmentData.doctorId.toString();
            // const doctorData = await this._authRepository.findDoctorDetails(doctorid);
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
            const session = await stripeClients_1.default.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `https://www.viswajith.site/paymentSuccess?session_id=${appoinmentData._id}&user_id=${userId}&stripe_session_id={CHECKOUT_SESSION_ID}`,
                // cancel_url: `http://localhost:5173/paymentFailed`,
                //  success_url: `http://localhost:5173/paymentSuccess?session_id=${appoinmentData._id}&user_id=${userId}&stripe_session_id={CHECKOUT_SESSION_ID}`,
                // cancel_url: `http://localhost:5173/paymentFailed`,
            });
            return session;
        }
        catch (error) {
            console.error("Error creating Stripe session:", error);
            throw error;
        }
    }
    async findBookingDetails(session_id, user_id, stripe_session_id) {
        try {
            const session = await this._authRepository.findSessionDetails(session_id);
            if (session) {
                session.status = "Confirmed";
                await session.save();
            }
            const doctorId = session?.doctorId;
            if (!doctorId) {
                throw new Error("Doctor ID is not available in the session.");
            }
            const Doctor = await this.getDoctor(doctorId.toString());
            const sessionData = await stripeClients_1.default.checkout.sessions.retrieve(stripe_session_id);
            if (!Doctor || Doctor.length === 0) {
                throw new Error("Doctor not found.");
            }
            const bookingDetails = {
                appoinmentId: new mongoose_1.default.Types.ObjectId(session._id),
                doctorId: new mongoose_1.default.Types.ObjectId(Doctor[0]._id),
                userId: new mongoose_1.default.Types.ObjectId(user_id),
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
            const existingBooking = await this._authRepository.findExistingBooking(bookingDetails);
            if (existingBooking) {
                return existingBooking;
                // throw new Error("Booking already exists.");
            }
            const bookingData = await this._authRepository.createBooking(bookingDetails);
            await this._authRepository.createNotification(bookingData);
            return bookingData;
        }
        catch (error) {
            console.log("error in fetching userservice", error);
        }
    }
    async contact(name, email, subject, phone, message, timestamp) {
        try {
            return await this._authRepository.contact(name, email, subject, phone, message, timestamp);
        }
        catch (error) {
            console.log("error in contact form service", error);
        }
    }
    async fechtUserData(userId) {
        try {
            const user = await this._authRepository.fetchUserData(userId);
            if (!user)
                return null;
            return (0, userMapper_1.toUserDTO)(user);
        }
        catch (error) {
            console.log("Error in fetch Data", error);
            return null;
        }
    }
    async getAllUsers() {
        try {
            return await this._authRepository.getAllUsers();
        }
        catch (error) {
            return null;
        }
    }
    async getNotifications(userId) {
        try {
            return await this._authRepository.fetchNotifications(userId);
        }
        catch (error) {
            throw new Error('failed to find notifications');
        }
    }
    async clearNotifications(userId) {
        try {
            return await this._authRepository.deleteUserNotifications(userId);
        }
        catch (error) {
            throw new Error('failed to delete notifications');
        }
    }
    async editUserData(userId, userData) {
        try {
            return await this._authRepository.editUserData(userId, userData);
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async getUserById(userId) {
        try {
            return await this._authRepository.getUserById(userId);
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async getAllBookings(user_id, page = 1, limit = 5, search = '') {
        try {
            return await this._authRepository.fetchBookings(user_id, page, limit, search);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async cancelAppoinment(bookId, userId, doctorId) {
        try {
            const bookedsession = await this._authRepository.cancelAppoinment(bookId, userId, doctorId);
            if (bookedsession && bookedsession.paymentStatus === "Cancelled" && bookedsession.payment_intent) {
                try {
                    const refund = await stripeClients_1.default.refunds.create({
                        payment_intent: bookedsession.payment_intent,
                        amount: bookedsession.amount
                    });
                    if (refund.status === 'succeeded') {
                        await this._authRepository.addToUserWallet(userId, bookedsession.amount, bookId);
                        return {
                            success: true,
                            message: 'Appointment cancelled and refund processed successfully',
                            booking: bookedsession,
                            refund: refund
                        };
                    }
                    else {
                        throw new Error('Refund processing failed');
                    }
                }
                catch (refundError) {
                    console.log("Refund error:", refundError);
                    // Still return the cancelled booking even if refund fails
                    return {
                        success: false,
                        message: 'Appointment cancelled but refund failed. Please contact support.',
                        booking: bookedsession,
                        error: refundError
                    };
                }
            }
            console.log("@@@", bookedsession);
            return bookedsession;
        }
        catch (error) {
            console.log("Error cancel and refund", error);
            throw error;
        }
    }
    async getBookedDoctor(userId) {
        try {
            return await this._authRepository.getBookedDoctor(userId);
        }
        catch (error) {
        }
    }
    async getWallet(user_id, page = 1, limit = 5) {
        return await this._authRepository.fetchWalletData(user_id, page, limit);
    }
    async resetPasswords(userId, currentPassword, newPassword) {
        try {
            const userData = await this._authRepository.fetchUser(userId);
            if (!userData?.password) {
                throw new Error('User password is null');
            }
            const isPasswordMatch = await bcrypt_1.default.compare(currentPassword, userData.password);
            if (!isPasswordMatch) {
                throw new Error('Old password is not correct');
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            userData.password = hashedPassword;
            await userData.save();
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            console.error('Failed to reset password:', error);
            throw new Error('Failed to reset password');
        }
    }
    async downloadPrescriptionPDF(prescriptionId, userId) {
        try {
            const prescriptionData = await this._authRepository.getPrescriptionById(prescriptionId, userId);
            if (!prescriptionData) {
                throw new Error('Prescription not found or access denied');
            }
            const pdfBuffer = await this.generatePrescriptionPDF(prescriptionData);
            const filename = `Prescription_${prescriptionId}_${new Date().toISOString().split('T')[0]}.pdf`;
            return {
                buffer: pdfBuffer,
                filename: filename
            };
        }
        catch (error) {
            console.log("Error in downloading prescription PDF userservice", error);
            throw error;
        }
    }
    async generatePrescriptionPDF(prescriptionData) {
        const pdf = new jspdf_1.default({
            unit: 'mm',
            format: [250, 297],
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const textColor = [51, 51, 51];
        const lightGray = [240, 240, 240];
        const borderColor = [200, 200, 200];
        pdf.setFillColor(0, 137, 123);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(36);
        pdf.setFont('helvetica', 'bold');
        const centerX = pageWidth / 2;
        pdf.text('WeCare', centerX, 25, { align: 'center' });
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        pdf.text(`Date: ${currentDate}`, pageWidth - 20, 25, { align: 'right' });
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        let yPosition = 60;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Dr. ${prescriptionData.doctorId?.name || prescriptionData.doctorName || 'Unknown Doctor'}`, 20, yPosition);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Consultation Fee: ${prescriptionData.bookingId?.amount || 'N/A'}`, 20, yPosition + 24);
        pdf.text(`Prescription ID: ${prescriptionData._id}`, pageWidth - 20, yPosition, { align: 'right' });
        pdf.text(`Booking ID: ${prescriptionData.bookingId._id || 'N/A'}`, pageWidth - 20, yPosition + 8, { align: 'right' });
        yPosition += 40;
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 20;
        pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PRESCRIPTION', 20, yPosition + 5);
        yPosition += 20;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Patient ID: ${prescriptionData.userId?._id || prescriptionData.userId || 'N/A'}`, 20, yPosition);
        pdf.text(`Patient Name: ${prescriptionData.userId?.name || prescriptionData.userName || 'N/A'}`, 20, yPosition + 8);
        const consultationDate = prescriptionData.bookingDate ? new Date(prescriptionData.bookingDate).toLocaleDateString() : 'N/A';
        const prescribedDate = prescriptionData.createdAt ? new Date(prescriptionData.createdAt).toLocaleDateString() : consultationDate;
        pdf.text(`Consultation Date: ${prescribedDate}`, 20, yPosition + 16);
        pdf.text(`Prescribed on: ${prescribedDate}`, 20, yPosition + 24);
        yPosition += 35;
        pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MEDICATIONS', 20, yPosition + 5);
        yPosition += 20;
        const instructionsX = 180;
        const instructionsWidth = pageWidth - instructionsX - 20;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Medicine', 20, yPosition);
        pdf.text('Dosage', 60, yPosition);
        pdf.text('Frequency', 100, yPosition);
        pdf.text('Duration', 140, yPosition);
        pdf.text('Instructions', instructionsX, yPosition);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
        if (prescriptionData.prescriptions && prescriptionData.prescriptions.length > 0) {
            prescriptionData.prescriptions.forEach((med, index) => {
                if (index % 2 === 0) {
                    pdf.setFillColor(250, 250, 250);
                    pdf.rect(15, yPosition - 4, pageWidth - 30, 12, 'F');
                }
                pdf.text(med.medicineName || 'N/A', 20, yPosition);
                pdf.text(med.dosage || 'N/A', 60, yPosition);
                pdf.text(med.frequency?.toString() || 'N/A', 100, yPosition);
                pdf.text(med.duration || 'N/A', 140, yPosition);
                const instructions = pdf.splitTextToSize(med.instruction || 'As directed', instructionsWidth);
                pdf.text(instructions, instructionsX, yPosition);
                yPosition += 15 + (instructions.length - 1) * 6;
            });
        }
        else {
            pdf.text('No medications prescribed', 20, yPosition);
            yPosition += 15;
        }
        if (prescriptionData.patientAdvice) {
            yPosition += 10;
            pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            pdf.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PATIENT ADVICE', 20, yPosition + 5);
            yPosition += 20;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const adviceLines = pdf.splitTextToSize(prescriptionData.patientAdvice, pageWidth - 40);
            pdf.text(adviceLines, 20, yPosition);
            yPosition += adviceLines.length * 5;
        }
        yPosition = pageHeight - 60;
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        pdf.setFontSize(10);
        pdf.text("Doctor's Signature", pageWidth - 80, yPosition + 8);
        yPosition += 25;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Important: Take medications as prescribed. Contact your doctor if you experience any adverse effects.', 20, yPosition);
        pdf.text('This prescription is valid for 30 days from the date of issue.', 20, yPosition + 8);
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
        return pdfBuffer;
    }
    async fetchPrescriptions(user_id, page = 1, limit = 5, search = '') {
        const prescibed = await this._authRepository.getPrescriptionsByUser(user_id, page, limit, search);
        return prescibed;
    }
    async findBookings(user_id, doctorId) {
        try {
            const bookingData = await this._authRepository.findBookings(user_id, doctorId);
            return bookingData?.paymentStatus;
        }
        catch (error) {
            throw new Error('failed to find booking');
        }
    }
    async addReview(reviewComment, selectedRating, userId, doctorId) {
        try {
            return await this._authRepository.createReview(reviewComment, selectedRating, userId, doctorId);
        }
        catch (error) {
            throw new Error('Failed to create review');
        }
    }
    async addReport(file, userData) {
        if (!file)
            throw new Error('No file provided');
        const result = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'medical_reports');
        const savedReport = await this._authRepository.saveReport({
            userId: userData.userId,
            doctorId: userData.doctorId,
            userName: userData.userName || '',
            userEmail: userData.userEmail || '',
            imageUrl: result.secure_url,
        });
        return {
            cloudinaryUrl: result.secure_url,
            documentId: savedReport._id,
        };
    }
    async getReportsByUserId(userId) {
        return await this._authRepository.getReportsByUserId(userId);
    }
    async reviews(doctor_id) {
        try {
            return await this._authRepository.getReview(doctor_id);
        }
        catch (error) {
            throw new Error('failed to find review');
        }
    }
    async editReview(reviewComment, selectedRating, userReviewId) {
        try {
            return await this._authRepository.editReview(reviewComment, selectedRating, userReviewId);
        }
        catch (error) {
            throw new Error('Failed to create review');
        }
    }
    async getReivewSummary(doctor_id) {
        try {
            const avgReviewsRating = await this._authRepository.getAvgReviewsRating(doctor_id);
            return avgReviewsRating;
        }
        catch (error) {
            throw new Error('failed to find review summary');
        }
    }
}
exports.AuthService = AuthService;
