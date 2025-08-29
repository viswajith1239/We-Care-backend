"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const specializationModel_1 = __importDefault(require("../../models/specializationModel"));
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
const otpModel_1 = __importDefault(require("../../models/otpModel"));
const kycModel_1 = __importDefault(require("../../models/kycModel"));
const mongoose_1 = __importStar(require("mongoose"));
const appoinmentModel_1 = __importDefault(require("../../models/appoinmentModel"));
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const walletModel_1 = __importDefault(require("../../models/walletModel"));
const prescriptionModel_1 = __importDefault(require("../../models/prescriptionModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const notificationModel_1 = __importDefault(require("../../models/notificationModel"));
const reportModel_1 = __importDefault(require("../../models/reportModel"));
const baseRepository_1 = __importDefault(require("../base/baseRepository"));
class DoctorRepository extends baseRepository_1.default {
    constructor() {
        super(doctorModel_1.default);
        this._specializationModel = specializationModel_1.default;
        this._doctorModel = doctorModel_1.default;
        this._otpModel = otpModel_1.default;
        this._kycModel = kycModel_1.default;
        this._appoinmentModel = appoinmentModel_1.default;
        this._bookingModel = bookingModel_1.default;
        this._walletModel = walletModel_1.default;
        this._prescriptionModel = prescriptionModel_1.default;
        this._userModel = userModel_1.default;
        this._notificationModel = notificationModel_1.default;
        this._reportModel = reportModel_1.default;
    }
    async findAllSpecializations() {
        try {
            return await this._specializationModel.find({});
        }
        catch (error) {
            console.error("Error fetching specializations:", error);
            throw error;
        }
    }
    async existsDoctor(doctorData) {
        try {
            let email = doctorData.email;
            return await this._doctorModel.findOne({ email });
        }
        catch (error) {
            console.log("error ", error);
            throw error;
        }
    }
    async saveOtp(email, OTP, OTPExpirey) {
        try {
            const saveotp = await new this._otpModel({
                email,
                otp: OTP,
                expiresAt: OTPExpirey,
            });
            await saveotp.save();
        }
        catch (error) {
            console.log("Error in Saving The Otp", error);
            throw error;
        }
    }
    async getOtpByEmail(email) {
        try {
            return await this._otpModel.find({ email });
        }
        catch (error) {
            console.error("error in otp getting:", error);
            throw error;
        }
    }
    async createNewUser(doctorData) {
        try {
            const userexisted = await this.existsDoctor(doctorData);
            if (userexisted) {
                throw new Error("Email already exists");
            }
            let specializationIds = [];
            if (doctorData.specializations && doctorData.specializations.length > 0) {
                specializationIds = await Promise.all(doctorData.specializations.map(async (specName) => {
                    const specialization = await specializationModel_1.default.findOne({ name: specName });
                    if (!specialization) {
                        throw new Error(`Specialization '${specName}' not found`);
                    }
                    return specialization._id;
                }));
            }
            const doctor = new this._doctorModel({
                ...doctorData,
                specializations: specializationIds,
            });
            await doctor.save();
        }
        catch (error) {
            console.log("Error in creating user", error);
            throw error;
        }
    }
    async deleteOtpById(otpId) {
        try {
            if (!otpId) {
                throw new Error("OTP ID is undefined");
            }
            await this._otpModel.findByIdAndDelete(otpId.toString());
        }
        catch (error) {
            console.error("Error in deleting OTP:", error);
            throw error;
        }
    }
    async findDoctor(email) {
        try {
            return await this._doctorModel.findOne({ email });
        }
        catch (error) {
            console.log("error finding user login:", error);
            return null;
        }
    }
    async saveKyc(formData, documents) {
        try {
            let doctor = await this._doctorModel.findOne({ _id: formData.doctor_id }).select('specializations');
            if (!doctor) {
                throw new Error("Doctor not found for the given doctor ID");
            }
            const kycData = {
                doctorId: new mongoose_1.Types.ObjectId(formData.doctor_id),
                specializationId: doctor.specializations,
                profileImage: documents.profileImageUrl,
                aadhaarFrontSide: documents.aadhaarFrontSideUrl,
                aadhaarBackSide: documents.aadhaarBackSideUrl,
                certificate: documents.certificateUrl,
                kycStatus: "pending",
                kycSubmissionDate: new Date(),
            };
            const savedKyc = await this._kycModel.create(kycData);
            return savedKyc;
        }
        catch (error) {
            throw new Error("Failed to save KYC data");
        }
    }
    async changeKycStatus(doctorId, profileImage) {
        try {
            const doctorUpdate = await this._doctorModel.findByIdAndUpdate(doctorId, {
                kycStatus: "submitted",
                profileImage: profileImage,
            }, { new: true, runValidators: true });
            if (!doctorUpdate) {
                throw new Error("Doctor not found");
            }
            await this._kycModel.findOneAndUpdate({ doctorId: doctorId }, { kycStatus: "submitted" }, { new: true, runValidators: true });
            return;
        }
        catch (error) {
            console.error("Error changing doctor KYC status:", error);
            throw new Error("Failed to change doctor KYC status");
        }
    }
    async getDoctorStatus(doctorId) {
        try {
            const doctor = await this._doctorModel.findById(doctorId).select("kycStatus");
            if (!doctor) {
                throw new Error(`Doctor with ID ${doctor} not found`);
            }
            return doctor.kycStatus;
        }
        catch (error) {
            console.error("Error fetching doctor KYC status:", error);
            throw new Error("Failed to fetch doctor KYC status");
        }
    }
    async createUsers(user) {
        const users = new this._doctorModel({ ...user, isKycApproved: false });
        return await users.save();
    }
    async existingUser(email) {
        try {
            return await this._doctorModel.findOne({ email });
        }
        catch (error) {
            throw error;
        }
    }
    async getSpecialization(doctorid) {
        try {
            if (!doctorid) {
                console.log("doctor id is not found");
                return;
            }
            const specialisations = await this._doctorModel.findById(doctorid).populate("specializations");
            return specialisations;
        }
        catch (error) {
            console.log("Error in Repository specialisation fetch", error);
        }
    }
    // async createNewAppoinment(appoinmentData: IAppoinment) {
    //   try {
    //     const findDoctor = await this.doctorModel.findById(appoinmentData.doctorId);
    //     console.log("Checking doctor ID:", appoinmentData.doctorId);
    //     console.log("Doctor found:", findDoctor);
    //     if (!findDoctor) {
    //       throw new Error("Doctor not found");
    //     }
    //     const existingAppointments = await this.appoinmentModel.find({
    //       doctorId: appoinmentData.doctorId,
    //       selectedDate: appoinmentData.selectedDate, 
    //       $or: [
    //         { startTime: { $lt: appoinmentData.endTime }, endTime: { $gt: appoinmentData.startTime } }
    //       ],
    //     });
    //     const hasConflict = existingAppointments.some((existingApp) => {
    //       const existingStartTime = moment(existingApp.startTime, "HH:mm");
    //       const existingEndTime = moment(existingApp.endTime, "HH:mm");
    //       const newStartTime = moment(appoinmentData.startTime, "HH:mm");
    //       const newEndTime = moment(appoinmentData.endTime, "HH:mm");
    //       return newStartTime.isBefore(existingEndTime) && newEndTime.isAfter(existingStartTime);
    //     });
    //     if (hasConflict) {
    //       throw new Error("Time conflict with an existing session.");
    //     }
    //     appoinmentData.price = Number(appoinmentData.price);
    //     const createdSessionData = await this.appoinmentModel.create(appoinmentData);
    //     return createdSessionData.populate("specializationId");
    //   } catch (error) {
    //     console.log("Error in Repository", error);
    //     throw error;
    //   }
    // }
    async createNewAppoinment(appointmentData) {
        try {
            const findDoctor = await this._doctorModel.findById(appointmentData.doctorId);
            if (!findDoctor) {
                throw new Error("Doctor not found");
            }
            appointmentData.price = Number(appointmentData.price);
            const createdAppointment = await this._appoinmentModel.create(appointmentData);
            return await this._appoinmentModel.populate(createdAppointment, 'specializationId');
        }
        catch (error) {
            console.error('Error in creating single appointment:', error);
            throw error;
        }
    }
    async createMultipleAppointments(appointments) {
        if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
            throw new Error("Invalid appointments data: empty or not an array");
        }
        try {
            const doctorId = appointments[0]?.doctorId;
            if (!doctorId) {
                throw new Error("No doctor ID provided in the first appointment");
            }
            const findDoctor = await this._doctorModel.findById(doctorId);
            if (!findDoctor) {
                throw new Error("Doctor not found");
            }
            const processedAppointments = appointments.map(appointment => {
                if (!appointment.doctorId) {
                    throw new Error("Each appointment must have a doctorId");
                }
                return {
                    ...appointment,
                    price: Number(appointment.price)
                };
            });
            const createdAppointments = await this._appoinmentModel.create(processedAppointments);
            return await this._appoinmentModel.populate(createdAppointments, 'specializationId');
        }
        catch (error) {
            console.error('Error in creating multiple appointments:', error);
            throw error;
        }
    }
    async findConflictingAppointments(appointmentData) {
        return this._appoinmentModel.find({
            doctorId: appointmentData.doctorId,
            selectedDate: appointmentData.selectedDate,
            $or: [
                {
                    startTime: { $lt: appointmentData.endTime },
                    endTime: { $gt: appointmentData.startTime }
                }
            ]
        });
    }
    async fetchAppoinmentData(doctor_id, page = 1, limit = 5, search = '') {
        try {
            const skip = (page - 1) * limit;
            // Base query
            const searchQuery = { doctorId: doctor_id };
            console.log("ss", searchQuery);
            if (search && search.trim()) {
                const regex = new RegExp(search.trim(), "i");
                // Try to parse search as a date
                const searchDate = new Date(search);
                let dateQuery = null;
                if (!isNaN(searchDate.getTime())) {
                    // If valid date → match the whole day
                    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
                    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
                    dateQuery = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
                }
                // Combine conditions
                searchQuery.$or = [
                    { patientName: regex },
                    { patientEmail: regex },
                    { appointmentReason: regex },
                    { status: regex },
                    ...(dateQuery ? [dateQuery] : []), // add date filter if valid
                ];
            }
            const totalSchedules = await this._appoinmentModel.countDocuments(searchQuery);
            const appoinmentData = await this._appoinmentModel
                .find(searchQuery)
                .populate("specializationId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            console.log("00000", appoinmentData);
            return {
                appoinmentData,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalSchedules / limit),
                    totalSchedules,
                    hasNextPage: page < Math.ceil(totalSchedules / limit),
                    hasPreviousPage: page > 1,
                    limit,
                },
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async fecthBookingDetails(doctorId) {
        try {
            const bookingDetails = await this._bookingModel.find({ doctorId }).sort({ createdAt: -1 }).populate("userId", "name").exec();
            const response = bookingDetails.map((booking) => {
                return {
                    ...booking.toObject(),
                    userName: booking.userId ? booking.userId.name : 'user not found',
                };
            });
            return response;
        }
        catch (error) {
            console.log("ërror in fetching booking dewtails", error);
        }
    }
    async fetchUsers(doctorId) {
        try {
            const bookedUsers = await this._bookingModel.find({ doctorId }).populate("userId");
            const uniqueUsersMap = new Map();
            bookedUsers.forEach((booking) => {
                const user = booking.userId;
                if (user && user._id) {
                    uniqueUsersMap.set(user._id.toString(), {
                        _id: user._id,
                        id: user.userId,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profileImage || "",
                        appoinmentId: booking.appoinmentId,
                        bookingDate: booking.bookingDate,
                        startDate: booking.startDate,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        amount: booking.amount,
                        paymentStatus: booking.paymentStatus,
                        bookingId: booking._id
                    });
                }
            });
            return Array.from(uniqueUsersMap.values());
        }
        catch (error) {
            console.error("Error fetching booked users:", error);
            return [];
        }
    }
    async getAllBookings(doctor_id, page = 1, limit = 5, search = '') {
        try {
            const skip = (page - 1) * limit;
            const bookings = await this._bookingModel.find({ doctorId: doctor_id })
                .populate("userId", "name email profileImage").sort({ createdAt: -1 })
                .exec();
            const filteredBookings = search
                ? bookings.filter((booking) => booking.userId?.name?.toLowerCase().includes(search.toLowerCase()))
                : bookings;
            const totalBookings = filteredBookings.length;
            const totalPages = Math.ceil(totalBookings / limit);
            const paginatedBookings = filteredBookings.slice(skip, skip + limit);
            const response = paginatedBookings.map((booking) => {
                return {
                    ...booking.toObject(),
                    userName: booking.userId ? booking.userId.name : "User not found",
                    userEmail: booking.userId ? booking.userId.email : "User not found",
                    userProfileImage: booking.userId ? booking.userId.profileImage : "User not found"
                };
            });
            return {
                bookings: response,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBookings,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    limit,
                }
            };
        }
        catch (error) {
            console.log("Error in fetching doctor bookings:", error);
        }
    }
    async findByDoctorAndUser(doctorId, userId) {
        return await this._bookingModel.find({ doctorId, userId });
    }
    ;
    async fetchNotifications(doctorId) {
        try {
            const notificationsDoc = await this._notificationModel.findOne({ receiverId: doctorId });
            if (notificationsDoc && notificationsDoc.notifications) {
                notificationsDoc.notifications.sort((a, b) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
            }
            return notificationsDoc;
        }
        catch (error) {
            console.error('Error finding notifications');
            throw new Error('Failed to find notifications');
        }
    }
    async deleteDoctorNotifications(doctorId) {
        try {
            await this._notificationModel.deleteOne({ receiverId: doctorId });
        }
        catch (error) {
            console.error('Error delete notifications');
            throw new Error('Failed to delete notifications');
        }
    }
    async getDoctor(doctor_id) {
        try {
            const doctorData = await this._doctorModel.aggregate([
                {
                    $match: { _id: new mongoose_1.default.Types.ObjectId(doctor_id) },
                },
                {
                    $lookup: {
                        from: "specializations",
                        localField: "specializations",
                        foreignField: "_id",
                        as: "specializationDetails",
                    },
                },
            ]);
            return doctorData;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async fetchWalletData(doctor_id, page = 1, limit = 5) {
        try {
            const wallet = await this._walletModel.findOne({ doctorId: doctor_id }).exec();
            if (!wallet)
                return null;
            const totalTransactions = wallet.transactions.length;
            const skip = (page - 1) * limit;
            const paginatedTransactions = wallet.transactions.slice(skip, skip + limit);
            return {
                walletData: {
                    ...wallet.toObject(),
                    transactions: paginatedTransactions,
                },
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalTransactions / limit),
                    tatalTransctions: totalTransactions,
                    hasNextPage: page < Math.ceil(totalTransactions / limit),
                    hasPreviousPage: page > 1,
                    limit
                }
            };
        }
        catch (error) {
            console.error('Error fetching wallet data:', error);
            return null;
        }
    }
    async withdrawMoney(doctor_id, amount) {
        try {
            const wallet = await this._walletModel.findOne({ doctorId: doctor_id });
            if (!wallet) {
                throw new Error("Wallet not found for the specified Doctor.");
            }
            if (wallet.balance < amount) {
                throw new Error("Insufficient balance for withdrawal.");
            }
            wallet.balance -= amount;
            const transactionId = "txn_" + Date.now() + Math.floor(Math.random() * 10000);
            const transaction = {
                amount: amount,
                transactionId: transactionId,
                transactionType: "debit",
            };
            wallet.transactions.push(transaction);
            await wallet.save();
            return wallet;
        }
        catch (error) {
            console.error("Error processing withdrawal:", error.message);
            throw new Error(error.message);
        }
    }
    async getDoctorProfile(doctor_id) {
        try {
            const doctorData = await this._doctorModel.findById(doctor_id);
            return doctorData?.profileImage;
        }
        catch (error) {
        }
    }
    async updateDoctorData(doctor_id) {
        try {
            const existingDoctor = await this._doctorModel.findByIdAndUpdate(doctor_id);
            if (!existingDoctor) {
                throw new Error("Doctor not found");
            }
            return existingDoctor;
        }
        catch (error) {
            console.error("Error in repository layer:", error);
            throw new Error("Failed to update doctor data");
        }
    }
    async findUserEmail(email) {
        try {
            return await this._doctorModel.findOne({ email });
        }
        catch (error) {
            console.log("error finding user login:", error);
            return null;
        }
    }
    async saveOTP(email, OTP, OTPExpiry) {
        try {
            const newOtp = new this._otpModel({
                email,
                otp: OTP,
                expiresAt: OTPExpiry,
            });
            await newOtp.save();
        }
        catch (error) {
            console.error("Error in saveOTP:", error);
            throw error;
        }
    }
    async getOtpsByEmail(email) {
        try {
            const otps = await this._otpModel.find({ email: email });
            if (!otps || otps.length === 0) {
                console.log("No OTPs found for the given email.");
            }
            else {
                console.log("Fetched OTPs:", otps);
            }
            return otps;
        }
        catch (error) {
            console.error("Error in getOtpsByEmail:", error);
            throw error;
        }
    }
    async saveResetPassword(email, hashedPassword) {
        try {
            const user = await this._doctorModel.findOne({ email });
            if (!user) {
                console.log("User Not found  for this email", email);
            }
            const result = await this._doctorModel.updateOne({ email }, { $set: { password: hashedPassword } });
            if (result.modifiedCount === 0) {
                console.error("Failed to update password for email:", email);
                throw new Error("Password update failed.");
            }
            return result;
        }
        catch (error) {
            console.log("Error in Resetting password", error);
            throw error;
        }
    }
    async create(data) {
        const newPrescription = new this._prescriptionModel({
            doctorId: data.doctorId,
            userId: data.userId,
            bookingId: data.bookingId,
            specializationId: data.specializationId,
            prescriptions: data.prescriptions,
            patientDetails: data.patientDetails,
            doctorDetails: data.doctorDetails,
            createdAt: new Date()
        });
        return await newPrescription.save();
    }
    async getPrescriptionsByDoctor(doctorId, page = 1, limit = 5, search = '') {
        try {
            const skip = (page - 1) * limit;
            const matchCondition = {
                doctorId: new mongoose_1.default.Types.ObjectId(doctorId),
            };
            if (search) {
                const allPrescriptions = await this._prescriptionModel.aggregate([
                    {
                        $match: matchCondition,
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$userDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'doctors',
                            localField: 'doctorId',
                            foreignField: '_id',
                            as: 'doctorDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$doctorDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: 'bookingId',
                            foreignField: 'appoinmentId',
                            as: 'bookingDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$bookingDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            userId: 1,
                            bookingId: 1,
                            prescriptions: 1,
                            createdAt: 1,
                            patientName: '$userDetails.name',
                            patientEmail: '$userDetails.email',
                            doctorName: '$doctorDetails.name',
                            specializationId: '$bookingDetails.specialization',
                            bookingAmount: '$bookingDetails.amount',
                            bookingStartDate: '$bookingDetails.startDate',
                            bookingEndTime: '$bookingDetails.endTime',
                            bookingStartTime: '$bookingDetails.startTime',
                            bookingDate: '$bookingDetails.bookingDate',
                        },
                    },
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                ]);
                const filteredPrescriptions = allPrescriptions.filter((prescription) => {
                    const searchTerm = search.toLowerCase();
                    const patientNameMatch = prescription.patientName?.toLowerCase().includes(searchTerm);
                    const medicineNameMatch = prescription.prescriptions?.some((med) => med.medicineName?.toLowerCase().includes(searchTerm));
                    return patientNameMatch || medicineNameMatch;
                });
                const totalCount = filteredPrescriptions.length;
                const totalPages = Math.ceil(totalCount / limit);
                const paginatedPrescriptions = filteredPrescriptions.slice(skip, skip + limit);
                return {
                    prescriptions: paginatedPrescriptions,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalPrescriptions: totalCount,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1,
                        limit
                    }
                };
            }
            else {
                const totalCount = await this._prescriptionModel.countDocuments(matchCondition);
                const prescriptions = await this._prescriptionModel.aggregate([
                    {
                        $match: matchCondition,
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$userDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'doctors',
                            localField: 'doctorId',
                            foreignField: '_id',
                            as: 'doctorDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$doctorDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'bookings',
                            localField: 'bookingId',
                            foreignField: 'appoinmentId',
                            as: 'bookingDetails',
                        },
                    },
                    {
                        $unwind: {
                            path: '$bookingDetails',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            userId: 1,
                            bookingId: 1,
                            prescriptions: 1,
                            createdAt: 1,
                            patientName: '$userDetails.name',
                            patientEmail: '$userDetails.email',
                            doctorName: '$doctorDetails.name',
                            specializationId: '$bookingDetails.specialization',
                            bookingAmount: '$bookingDetails.amount',
                            bookingStartDate: '$bookingDetails.startDate',
                            bookingEndTime: '$bookingDetails.endTime',
                            bookingStartTime: '$bookingDetails.startTime',
                            bookingDate: '$bookingDetails.bookingDate',
                        },
                    },
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ]);
                return {
                    prescriptions,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / limit),
                        totalPrescriptions: totalCount,
                        hasNextPage: page < Math.ceil(totalCount / limit),
                        hasPreviousPage: page > 1,
                        limit
                    }
                };
            }
        }
        catch (error) {
            console.log("Error in fetching doctor prescriptions:", error);
            throw error;
        }
    }
    async getReportsByUserId(doctorId, page = 1, limit = 10, search = '') {
        try {
            const skip = (page - 1) * limit;
            // First, get all reports for the doctor with populated user data
            const reports = await this._reportModel
                .find({ doctorId })
                .sort({ createdAt: -1 });
            // Filter reports based on search query
            const filteredReports = search
                ? reports.filter((report) => {
                    const userName = report.userId?.name || report.user?.name || report.userName || report.patientName || '';
                    const userEmail = report.userId?.email || report.user?.email || '';
                    const patientId = report.patientId || report.userId?._id || report.user?._id || '';
                    return (userName.toLowerCase().includes(search.toLowerCase()) ||
                        userEmail.toLowerCase().includes(search.toLowerCase()) ||
                        patientId.toString().toLowerCase().includes(search.toLowerCase()));
                })
                : reports;
            const totalReports = filteredReports.length;
            const totalPages = Math.ceil(totalReports / limit);
            // Apply pagination to filtered results
            const paginatedReports = filteredReports.slice(skip, skip + limit);
            // Group reports by patient/user
            const groupedReportsMap = new Map();
            paginatedReports.forEach((report) => {
                const userId = report.userId?._id || report.user?._id || report.patientId || 'unknown';
                const userName = report.userId?.name || report.user?.name || report.userName || report.patientName || `User ${userId}`;
                if (!groupedReportsMap.has(userId)) {
                    groupedReportsMap.set(userId, {
                        patientId: userId,
                        patientName: userName,
                        reports: [],
                        totalReports: 0,
                        lastUpload: null
                    });
                }
                const group = groupedReportsMap.get(userId);
                group.reports.push(report.toObject());
                group.totalReports++;
                if (!group.lastUpload || new Date(report.createdAt) > new Date(group.lastUpload)) {
                    group.lastUpload = report.createdAt;
                }
            });
            const groupedReports = Array.from(groupedReportsMap.values());
            // Sort grouped reports by last upload date (most recent first)
            groupedReports.sort((a, b) => {
                if (!a.lastUpload && !b.lastUpload)
                    return 0;
                if (!a.lastUpload)
                    return 1;
                if (!b.lastUpload)
                    return -1;
                return new Date(b.lastUpload).getTime() - new Date(a.lastUpload).getTime();
            });
            return {
                reports: paginatedReports.map((report) => report.toObject()),
                groupedReports,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReports,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    limit,
                }
            };
        }
        catch (error) {
            console.log("Error in fetching report details", error);
            throw error;
        }
    }
    async getAllStatistics() {
        const revenueData = await this._bookingModel.aggregate([
            { $match: { paymentStatus: "Confirmed" } },
            {
                $group: {
                    _id: null,
                    amount: { $sum: "$amount" },
                    doctorRevenue: { $sum: { $multiply: ["$amount", 0.9] } },
                }
            }
        ]);
        const amount = revenueData.length > 0 ? revenueData[0].amount : 0;
        const doctorRevenue = revenueData.length > 0 ? revenueData[0].doctorRevenue : 0;
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 12);
        const userRegistrationData = await this._userModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        const monthlyStatistics = {};
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            const monthDate = new Date();
            monthDate.setMonth(currentDate.getMonth() - monthOffset);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;
            const key = `${year}-${month < 10 ? '0' : ''}${month}`;
            monthlyStatistics[key] = { users: 0, revenue: 0, amount: 0, doctorRevenue: 0, doctor: 0 };
        }
        userRegistrationData.forEach(userData => {
            const key = `${userData._id.year}-${userData._id.month < 10 ? '0' : ''}${userData._id.month}`;
            if (monthlyStatistics[key]) {
                monthlyStatistics[key].users = userData.count;
            }
        });
        const revenueByMonth = await this._bookingModel.aggregate([
            { $match: { paymentStatus: "Confirmed", bookingDate: { $gte: startDate } } },
            {
                $group: {
                    _id: { year: { $year: "$bookingDate" }, month: { $month: "$bookingDate" } },
                    amount: { $sum: "$amount" },
                    doctorRevenue: { $sum: { $multiply: ["$amount", 0.9] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        const revenueByDoctor = await this._bookingModel.aggregate([
            { $match: { paymentStatus: "Confirmed", bookingDate: { $gte: startDate } } },
            {
                $group: {
                    _id: { doctor: "$doctorId", year: { $year: "$bookingDate" }, month: { $month: "$bookingDate" } },
                    amount: { $sum: "$amount" },
                    doctorRevenue: { $sum: { $multiply: ["$amount", 0.9] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        console.log("Doctor-wise Revenue:", revenueByDoctor);
        const doctorWiseData = {};
        revenueByDoctor.forEach(data => {
            const doctorId = data._id.doctor;
            const key = `${data._id.year}-${data._id.month < 10 ? '0' : ''}${data._id.month}`;
            if (!doctorWiseData[doctorId]) {
                doctorWiseData[doctorId] = [];
            }
            doctorWiseData[doctorId].push({
                year: data._id.year,
                month: data._id.month,
                revenue: data.amount,
                doctorRevenue: data.doctorRevenue
            });
        });
        revenueByMonth.forEach(revenueData => {
            const key = `${revenueData._id.year}-${revenueData._id.month < 10 ? '0' : ''}${revenueData._id.month}`;
            if (monthlyStatistics[key]) {
                monthlyStatistics[key].revenue = revenueData.amount;
                monthlyStatistics[key].amount = revenueData.amount;
                monthlyStatistics[key].doctorRevenue = revenueData.doctorRevenue;
            }
        });
        const userDoctorChartData = Object.keys(monthlyStatistics).map(key => {
            const [year, month] = key.split('-');
            return {
                year: parseInt(year, 10),
                month: parseInt(month, 10),
                users: monthlyStatistics[key].users,
                doctor: monthlyStatistics[key].doctor,
                revenue: monthlyStatistics[key].revenue,
                amount: monthlyStatistics[key].amount,
                doctorRevenue: monthlyStatistics[key].doctorRevenue
            };
        });
        return {
            doctorRevenue,
            userDoctorChartData,
            doctorWiseData
        };
    }
    async cancelAppoinment(id) {
        return await this._appoinmentModel.findByIdAndUpdate(id, { $set: { status: "Cancelled" } });
    }
    async findAppointmentById(id) {
        return await this._appoinmentModel.findById(id);
    }
    async checkSchedulingConflicts(doctorId, appointmentId, date, startTime, endTime) {
        return await this._appoinmentModel.find({
            doctorId,
            selectedDate: date,
            _id: { $ne: appointmentId },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });
    }
    async rescheduleAppointment(id, updatedData) {
        const session = await mongoose_1.default.startSession();
        try {
            return await session.withTransaction(async () => {
                // Update the appointment
                const updatedAppointment = await this._appoinmentModel.findByIdAndUpdate(id, {
                    $set: {
                        selectedDate: updatedData.selectedDate,
                        startTime: updatedData.startTime,
                        endTime: updatedData.endTime,
                        price: updatedData.price,
                        specializationId: updatedData.specializationId,
                        status: "Pending"
                    }
                }, { new: true, session });
                console.log("88888", updatedAppointment);
                if (!updatedAppointment) {
                    throw new Error("Appointment not found");
                }
                // Update the corresponding booking
                const updatedBooking = await this._bookingModel.findOneAndUpdate({ appoinmentId: id }, {
                    $set: {
                        bookingDate: updatedData.selectedDate,
                        startDate: updatedData.selectedDate,
                        startTime: updatedData.startTime,
                        endTime: updatedData.endTime,
                        amount: updatedData.price,
                        // Reset payment status if needed
                        // paymentStatus: "Pending"
                    }
                }, { session });
                console.log("updddd", updatedBooking);
                if (!updatedBooking) {
                    throw new Error("Corresponding booking not found");
                }
                return updatedAppointment;
            });
        }
        catch (error) {
            console.error("Error rescheduling appointment:", error);
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
}
exports.default = DoctorRepository;
