"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminModel_1 = __importDefault(require("../../models/adminModel"));
const specializationModel_1 = __importDefault(require("../../models/specializationModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const kycModel_1 = __importDefault(require("../../models/kycModel"));
const doctorModel_1 = __importDefault(require("../../models/doctorModel"));
const KycRejectionReason_1 = __importDefault(require("../../models/KycRejectionReason"));
const bookingModel_1 = __importDefault(require("../../models/bookingModel"));
const contactModel_1 = __importDefault(require("../../models/contactModel"));
const baseRepository_1 = __importDefault(require("../base/baseRepository"));
class AdminRepository extends baseRepository_1.default {
    constructor() {
        super(adminModel_1.default);
        this._adminModel = adminModel_1.default;
        this._specializationModel = specializationModel_1.default;
        this._userModel = userModel_1.default;
        this._kycModel = kycModel_1.default;
        this._doctorModel = doctorModel_1.default;
        this._kycRejectionReasonModel = KycRejectionReason_1.default;
        this._bookingModel = bookingModel_1.default;
        this._contactModel = contactModel_1.default;
        this.deleteSpecializationRepository = async (id) => {
            const result = await this._specializationModel.findByIdAndDelete(id);
            if (!result) {
                throw new Error(`Specialization with id ${id} not found`);
            }
        };
        this.deleteSubmission = async (id) => {
            const result = await this._contactModel.findByIdAndDelete(id);
            if (!result) {
                throw new Error(`contact with id ${id} not found`);
            }
        };
    }
    async findAdmin(email) {
        const admin = await this._adminModel.findOne({ email });
        return admin;
    }
    async createAdmin(email, password) {
        try {
            let data = { email, password };
            const newAdmin = new this._adminModel(data);
            return await newAdmin.save();
        }
        catch (error) {
            console.log("create admin", error);
            throw error;
        }
    }
    async fetchAllUsers(page = 1, limit = 5, search = '') {
        try {
            const skip = (page - 1) * limit;
            let query = {};
            if (search && search.trim()) {
                query = {
                    $or: [
                        { name: { $regex: search.trim(), $options: 'i' } },
                        { email: { $regex: search.trim(), $options: 'i' } }
                    ]
                };
            }
            const totalUsers = await this._userModel.countDocuments(query);
            const users = await this._userModel.find(query).lean().skip(skip)
                .limit(limit);
            return {
                users: users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    hasNextPage: page < Math.ceil(totalUsers / limit),
                    hasPreviousPage: page > 1,
                    limit
                }
            };
        }
        catch (error) {
            console.log("error fetching users", error);
        }
    }
    async fetchAllDoctors(page = 1, limit = 5, search = '') {
        try {
            const skip = (page - 1) * limit;
            let query = {};
            if (search && search.trim()) {
                query = {
                    $or: [
                        { name: { $regex: search.trim(), $options: 'i' } },
                        { email: { $regex: search.trim(), $options: 'i' } }
                    ]
                };
            }
            const totalDoctors = await this._doctorModel.countDocuments(query);
            const doctors = await this._doctorModel
                .find(query)
                .lean()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            const totalPages = Math.ceil(totalDoctors / limit);
            return {
                doctors: doctors,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalDoctors,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    limit
                }
            };
        }
        catch (error) {
            console.log("error fetching doctors", error);
            throw error;
        }
    }
    async getAllContact() {
        const contact = await this._contactModel.find();
        return contact;
    }
    async saveSpecialization({ name, description }) {
        try {
            return await this._specializationModel.create({ name, description });
        }
        catch (error) {
            console.error("Error in admin repository:", error);
            throw error;
        }
    }
    async getAllSpecializations(page = 1, limit = 5) {
        try {
            const skip = (page - 1) * limit;
            const totalCount = await this._specializationModel.countDocuments();
            const specializations = await this._specializationModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            return {
                specializations,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount: totalCount,
                    itemsPerPage: limit,
                    hasNextPage: page < Math.ceil(totalCount / limit),
                    hasPreviousPage: page > 1,
                }
            };
        }
        catch (error) {
            console.log("Error in fetching specializations", error);
            throw error;
        }
    }
    async saveUpdateSpecialization(name, description, specializationId) {
        try {
            const updatedSpecialization = await this._specializationModel.findByIdAndUpdate(specializationId, { name, description }, { new: true });
            return updatedSpecialization;
        }
        catch (error) {
            console.log(error);
        }
    }
    async blockUnblockUser(user_id, userState) {
        const updatedUser = await this._userModel.findByIdAndUpdate(user_id, { isBlocked: userState }, { new: true }).lean();
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    }
    async blockUnblockDoctor(doctor_id, doctorState) {
        const updatedDoctor = await this._doctorModel.findByIdAndUpdate(doctor_id, { isBlocked: doctorState }, { new: true }).lean();
        if (!updatedDoctor) {
            throw new Error("Doctor not found");
        }
        return updatedDoctor;
    }
    async getAllDoctorsKycDatas() {
        return await this._doctorModel.aggregate([
            {
                $lookup: {
                    from: this._kycModel.collection.name,
                    localField: '_id',
                    foreignField: 'doctorId',
                    as: 'kycData',
                },
            },
            {
                $unwind: {
                    path: '$kycData',
                    // preserveNullAndEmptyArrays: true, 
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    kycData: 1,
                },
            },
        ]);
    }
    async fetchKycData(doctorId) {
        try {
            const kycData = await this._kycModel.findOne({ doctorId }).populate("specializationId").populate("doctorId");
            return kycData;
        }
        catch (error) {
            console.error('Error fetching KYC data:', error);
        }
    }
    async updateKycStatus(status, doctor_id, rejectionReason) {
        try {
            const updatedDoctor = await this._doctorModel.findByIdAndUpdate(doctor_id, { kycStatus: status }, { new: true, runValidators: true });
            if (updatedDoctor) {
                const updatedKyc = await this._kycModel.findOneAndUpdate({ doctorId: doctor_id }, { kycStatus: status }, { new: true, runValidators: true });
                if (updatedKyc) {
                    if (status === 'rejected' && rejectionReason) {
                        const reason = await this._kycRejectionReasonModel.create({
                            doctorId: doctor_id,
                            reason: rejectionReason,
                        });
                        const response = {
                            doctorMail: updatedDoctor.email,
                            reason: reason.reason
                        };
                        return response;
                    }
                    if (status === 'approved') {
                        console.log('approve hit with', updatedDoctor.email);
                        if (updatedDoctor.email) {
                            return updatedDoctor.email;
                        }
                    }
                }
                else {
                    console.log('KYC record not found for the given doctor ID:', doctor_id);
                    return null;
                }
            }
            else {
                console.log('Doctor not found with the given ID:', doctor_id);
                return null;
            }
        }
        catch (error) {
            console.error('Error updating KYC status:', error);
            throw error;
        }
    }
    async deleteKyc(doctor_id) {
        try {
            const result = await this._kycModel.findOneAndDelete({ doctorId: doctor_id });
            if (result) {
            }
            else {
                console.log('No KYC record found for deletion with doctor ID:', doctor_id);
            }
        }
        catch (error) {
            console.error('Error deleting KYC record:', error);
        }
    }
    async getAllStatistics() {
        const totalDoctors = await this._doctorModel.countDocuments();
        const activeDoctors = await this._doctorModel.countDocuments({ isBlocked: false });
        const totalUsers = await this._userModel.countDocuments();
        const activeUsers = await this._userModel.countDocuments({ isBlocked: false });
        const totalBookings = await this._bookingModel.countDocuments();
        const revenueData = await this._bookingModel.aggregate([
            { $match: { paymentStatus: "Confirmed" } },
            {
                $group: {
                    _id: null, amount: { $sum: "$amount" },
                    doctorRevenue: { $sum: { $multiply: ["$amount", 0.9] } },
                    adminRevenue: { $sum: { $multiply: ["$amount", 0.1] } }
                }
            }
        ]);
        const amount = revenueData.length > 0 ? revenueData[0].amount : 0;
        const doctorRevenue = revenueData.length > 0 ? revenueData[0].doctorRevenue : 0;
        const adminRevenue = revenueData.length > 0 ? revenueData[0].adminRevenue : 0;
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 12);
        const userAndDoctorRegistartionData = await Promise.all([
            this._userModel.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
            this._doctorModel.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);
        const monthlyStatistics = {};
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            const monthDate = new Date();
            monthDate.setMonth(currentDate.getMonth() - monthOffset);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;
            const key = `${year}-${month < 10 ? '0' : ''}${month}`;
            monthlyStatistics[key] = {
                users: 0,
                doctor: 0,
                revenue: 0,
                amount: 0,
                doctorRevenue: 0,
                adminRevenue: 0
            };
        }
        userAndDoctorRegistartionData[0].forEach(userData => {
            const key = `${userData._id.year}-${userData._id.month < 10 ? '0' : ''}${userData._id.month}`;
            if (monthlyStatistics[key]) {
                monthlyStatistics[key].users = userData.count;
            }
        });
        userAndDoctorRegistartionData[1].forEach(doctorData => {
            const key = `${doctorData._id.year}-${doctorData._id.month < 10 ? '0' : ''}${doctorData._id.month}`;
            if (monthlyStatistics[key]) {
                monthlyStatistics[key].doctor = doctorData.count;
            }
        });
        const revenueByMonth = await bookingModel_1.default.aggregate([
            { $match: { paymentStatus: "Confirmed", bookingDate: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$bookingDate" },
                        month: { $month: "$bookingDate" }
                    },
                    amount: { $sum: "$amount" },
                    doctorRevenue: { $sum: { $multiply: ["$amount", 0.9] } },
                    adminRevenue: { $sum: { $multiply: ["$amount", 0.1] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        revenueByMonth.forEach(revenueData => {
            const key = `${revenueData._id.year}-${revenueData._id.month < 10 ? '0' : ''}${revenueData._id.month}`;
            if (monthlyStatistics[key]) {
                monthlyStatistics[key].revenue = revenueData.amount;
                monthlyStatistics[key].amount = revenueData.amount;
                monthlyStatistics[key].doctorRevenue = revenueData.doctorRevenue;
                monthlyStatistics[key].adminRevenue = revenueData.adminRevenue;
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
                doctorRevenue: monthlyStatistics[key].doctorRevenue,
                adminRevenue: monthlyStatistics[key].adminRevenue
            };
        });
        return {
            totalDoctors,
            activeDoctors,
            totalUsers,
            activeUsers,
            doctorRevenue,
            adminRevenue,
            totalRevenue: amount,
            userDoctorChartData,
            totalBookings
        };
    }
}
exports.default = AdminRepository;
