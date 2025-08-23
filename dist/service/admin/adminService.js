"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emailConfig_1 = __importDefault(require("../../config/emailConfig"));
const kyTemplate_1 = require("../../config/kyTemplate");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userMapper_1 = require("../../utils/userMapper");
const doctorMapper_1 = require("../../utils/doctorMapper");
dotenv_1.default.config();
class AdminService {
    constructor(adminRepository) {
        this.deleteSpecializationService = async (id) => {
            await this._adminRepository.deleteSpecializationRepository(id);
        };
        this.deleteSubmission = async (id) => {
            await this._adminRepository.deleteSubmission(id);
        };
        this._adminRepository = adminRepository;
    }
    async adminLogin(email, password) {
        try {
            if (process.env.ADMIN_EMAIL === email && process.env.ADMIN_PASSWORD === password) {
                let adminData = await this._adminRepository.findAdmin(email);
                if (!adminData) {
                    adminData = await this._adminRepository.createAdmin(email, password);
                }
                const accessToken = jsonwebtoken_1.default.sign({ id: adminData._id.toString(), email: adminData.email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
                const refreshToken = jsonwebtoken_1.default.sign({ id: adminData._id.toString(), email: adminData.email, }, process.env.JWT_SECRET, { expiresIn: "7d" });
                return {
                    accessToken,
                    refreshToken,
                    admin: {
                        id: adminData._id.toString(),
                        email: adminData.email,
                        password: adminData.password,
                    },
                };
            }
            else {
                console.log("Invalid admin credentials");
                return {
                    status: 401,
                    success: false,
                    message: "Invalid admin credentials",
                };
            }
        }
        catch (error) {
            console.error("Error in adminLogin", error);
            throw new Error("Admin login failed. Please try again later.");
        }
    }
    async getAllUsers(page = 1, limit = 5, search) {
        const result = await this._adminRepository.fetchAllUsers(page, limit, search);
        if (!result) {
            return {
                users: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalUsers: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    limit: limit
                }
            };
        }
        const { users, pagination } = result;
        const mappedUsers = users.map(userMapper_1.mapUserToDTO);
        return {
            users: mappedUsers,
            pagination: pagination
        };
    }
    async getAllDoctors(page = 1, limit = 5, search) {
        const result = await this._adminRepository.fetchAllDoctors(page, limit, search);
        if (!result) {
            return {
                doctors: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalDoctors: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    limit: limit
                }
            };
        }
        const { doctors, pagination } = result;
        const mappedDoctors = doctors.map(doctorMapper_1.mapDoctorToDTO);
        return {
            doctors: mappedDoctors,
            pagination: pagination
        };
    }
    async getAllContact() {
        return await this._adminRepository.getAllContact();
    }
    async addSpecialization(specializationData) {
        const specialization = await this._adminRepository.saveSpecialization({ ...specializationData });
        return specialization;
    }
    async getAllSpecializations(page = 1, limit = 5) {
        const specializations = await this._adminRepository.getAllSpecializations(page, limit);
        return specializations;
    }
    async updateSpecialisation(name, description, specializationId) {
        const specializationresponse = await this._adminRepository.saveUpdateSpecialization(name, description, specializationId);
        return specializationresponse;
    }
    async blockUnblockUser(user_id, userState) {
        return await this._adminRepository.blockUnblockUser(user_id, userState);
    }
    async blockUnblockDoctor(doctor_id, doctorState) {
        return await this._adminRepository.blockUnblockDoctor(doctor_id, doctorState);
    }
    async doctorsKycData() {
        try {
            const allDoctorsKycData = await this._adminRepository.getAllDoctorsKycDatas();
            return allDoctorsKycData;
        }
        catch (error) {
            console.error("Error fetching doctors KYC data:", error);
            throw error;
        }
    }
    async fetchKycData(doctorId) {
        try {
            let response = await this._adminRepository.fetchKycData(doctorId);
            return response;
        }
        catch (error) {
            console.log(error);
        }
    }
    async updateKycStatus(status, doctor_id, rejectionReason) {
        try {
            const updatedKyc = await this._adminRepository.updateKycStatus(status, doctor_id, rejectionReason);
            if (status === "approved" || status === "rejected") {
                await this._adminRepository.deleteKyc(doctor_id);
            }
            if (status === "approved") {
                console.log("simply checkingggg approved", updatedKyc);
                const email_Ht = (0, kyTemplate_1.kyTemplate)("your Kyc approved successfully", updatedKyc || "user", status);
                await (0, emailConfig_1.default)("approve", updatedKyc, email_Ht);
            }
            else {
                const email_Ht = (0, kyTemplate_1.kyTemplate)(updatedKyc.reason, updatedKyc.doctorMail || "user", status);
                await (0, emailConfig_1.default)("reject", updatedKyc.doctorMail, email_Ht);
            }
        }
        catch (error) {
            console.error("Error updating KYC status:", error);
        }
    }
    async getDashboardData() {
        try {
            return await this._adminRepository.getAllStatistics();
        }
        catch (error) {
            throw Error(error);
        }
    }
}
exports.default = AdminService;
