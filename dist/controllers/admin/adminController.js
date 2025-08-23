"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCode_1 = __importDefault(require("../../enums/HttpStatusCode"));
const messages_1 = __importDefault(require("../../enums/messages"));
class AdminController {
    constructor(adminService) {
        this.deleteSpecialization = async (req, res, next) => {
            try {
                const { id } = req.params;
                const response = await this._adminService.deleteSpecializationService(id);
                res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.SPECIALIZATION_DELETE_SUCCESS });
                return response;
            }
            catch (error) {
                console.error('Error deleting specialization:', error);
                res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.SPECIALIZATION_DELETE_FAILED });
            }
        };
        this.deleteSubmission = async (req, res, next) => {
            try {
                const { id } = req.params;
                const response = await this._adminService.deleteSubmission(id);
                res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.SPECIALIZATION_DELETE_SUCCESS });
                return response;
            }
            catch (error) {
                console.error('Error deleting specialization:', error);
                res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.SPECIALIZATION_DELETE_FAILED });
            }
        };
        this._adminService = adminService;
    }
    async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const adminResponse = await this._adminService.adminLogin(email, password);
            if (adminResponse.status === 401) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({
                    message: "Invalid credentials. Login failed.",
                });
            }
            res.cookie("RefreshToken", adminResponse.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            });
            res.cookie("AccessToken", adminResponse.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: messages_1.default.ADMIN_LOGIN_SUCCESS,
                admin: adminResponse.admin,
            });
        }
        catch (error) {
            console.error("Admin login controller error:", error);
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            const allUsers = await this._adminService.getAllUsers(page, limit, search);
            res
                .status(HttpStatusCode_1.default.OK)
                .json({ message: messages_1.default.FETCH_ALL_USERS_SUCCESS, users: allUsers });
        }
        catch (error) {
            console.log(error);
        }
    }
    async getAllDoctors(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || '';
            const allDoctors = await this._adminService.getAllDoctors(page, limit, search);
            res
                .status(HttpStatusCode_1.default.OK)
                .json({ message: messages_1.default.FETCH_ALL_USERS_SUCCESS, doctors: allDoctors });
        }
        catch (error) {
            console.log(error);
        }
    }
    async getAllContact(req, res, Next) {
        try {
            const response = await this._adminService.getAllContact();
            res.status(HttpStatusCode_1.default.OK).json({ response: response });
        }
        catch (error) {
        }
    }
    async addSpecialization(req, res, next) {
        try {
            const specializationData = req.body;
            const specializationresponse = await this._adminService.addSpecialization(specializationData);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.SPECIALIZATION_ADD_SUCCESS, specializationresponse });
            if (!specializationData) {
                res.status(HttpStatusCode_1.default.BadRequest).json({ message: messages_1.default.SPECIALIZATION_NAME_REQUIRED });
            }
        }
        catch (error) {
            console.log("Error adding specialization", error);
        }
    }
    async getAllSpecializations(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const allSpecializations = await this._adminService.getAllSpecializations(page, limit);
            res.status(HttpStatusCode_1.default.OK).json(allSpecializations);
        }
        catch (error) {
            console.error('Error fetching specializations:', error);
            next(error);
        }
    }
    async updateSpecialisation(req, res, next) {
        try {
            const { name, description } = req.body;
            const specializationId = req.params.id;
            const response = await this._adminService.updateSpecialisation(name, description, specializationId);
            // const specialization={name: response?.name,description: response?.description,}
            //  console.log("response what",response?.name,response?.description)
            const specialization = response;
            res.status(HttpStatusCode_1.default.updated).json({ message: messages_1.default.UPDATED_SUCCESS, specialization });
        }
        catch (error) {
            console.log("the error in controller", error);
        }
    }
    async blockUnblockUser(req, res, next) {
        try {
            const user_id = req.params.user_id;
            const userState = req.body.status;
            const responsestatus = await this._adminService.blockUnblockUser(user_id, userState);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.USER_STATUS_UPDATE_SUCCESS, data: responsestatus?.isBlocked });
        }
        catch (error) {
            console.log("Error in controller userblockunblock ", error);
        }
    }
    async blockUnblockDoctor(req, res, next) {
        try {
            const doctor_id = req.params.doctor_id;
            const doctorState = req.body.status;
            const responsestatus = await this._adminService.blockUnblockDoctor(doctor_id, doctorState);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.USER_STATUS_UPDATE_SUCCESS, data: responsestatus?.isBlocked });
        }
        catch (error) {
            console.log("Error in controller userblockunblock ", error);
        }
    }
    async getAllDoctorKycDatas(req, res, next) {
        try {
            const allDoctorsKycData = await this._adminService.doctorsKycData();
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.DOCTOR_KYC_DATA_FETCH_SUCCESS, data: allDoctorsKycData });
        }
        catch (error) {
            console.error("Error fetching KYC data:", error);
            next(error);
        }
    }
    async doctorsKycData(req, res, next) {
        try {
            const doctorId = req.params.doctor_id;
            const doctorKycDetails = await this._adminService.fetchKycData(doctorId);
            return res.json({ kycData: doctorKycDetails });
        }
        catch (error) {
            console.log("error in controller", error);
        }
    }
    async changeKycStatus(req, res, next) {
        try {
            const status = String(req.body.status);
            const doctor_id = req.params.doctor_id;
            const rejectionReason = req.body.rejectionReason || null;
            await this._adminService.updateKycStatus(status, doctor_id, rejectionReason);
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.DOCTOR_KYC_STATUS_UPDATE_SUCCESS, status });
        }
        catch (error) {
            console.error('Error updating doctor status:', error);
            next(error);
        }
    }
    async getDashboardData(req, res, next) {
        try {
            const response = await this._adminService.getDashboardData();
            res.status(HttpStatusCode_1.default.OK).json({ data: response });
        }
        catch (error) {
            next(error);
        }
    }
    async logoutAdmin(req, res) {
        try {
            res.clearCookie('AccessToken', { httpOnly: true, expires: new Date(0) });
            res.clearCookie('RefreshToken', { httpOnly: true, expires: new Date(0) });
            res.status(HttpStatusCode_1.default.OK).json({ message: messages_1.default.ADMIN_LOGOUT_SUCCESS });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(HttpStatusCode_1.default.InternalServerError).json({ message: messages_1.default.ADMIN_LOGOUT_FAILED });
        }
    }
}
exports.default = AdminController;
