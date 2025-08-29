"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminRepository_1 = __importDefault(require("../repositories/admin/adminRepository"));
const adminService_1 = __importDefault(require("../service/admin/adminService"));
const adminController_1 = __importDefault(require("../controllers/admin/adminController"));
const JwtConfig_1 = require("../config/JwtConfig");
const router = (0, express_1.Router)();
const adminRepository = new adminRepository_1.default();
const adminService = new adminService_1.default(adminRepository);
const adminController = new adminController_1.default(adminService);
router
    .route("/loginadmin")
    .post(adminController.adminLogin.bind(adminController));
router
    .route("/logout")
    .post(adminController.logoutAdmin.bind(adminController));
router
    .route("/specialization")
    .post(adminController.addSpecialization.bind(adminController))
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.getAllSpecializations.bind(adminController));
router
    .route("/specialization/:id")
    .put((0, JwtConfig_1.verifyToken)("admin"), adminController.updateSpecialisation.bind(adminController));
router
    .route("/specializations/:id")
    .delete(adminController.deleteSpecialization.bind(adminController));
router
    .route("/users")
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.getAllUsers.bind(adminController));
router
    .route("/user/:user_id/block-unblock")
    .patch((0, JwtConfig_1.verifyToken)("admin"), adminController.blockUnblockUser.bind(adminController));
router
    .route("/doctors")
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.getAllDoctors.bind(adminController));
router
    .route("/doctor/:doctor_id/block-unblock")
    .patch((0, JwtConfig_1.verifyToken)("admin"), adminController.blockUnblockDoctor.bind(adminController));
router
    .route("/doctor/kyc")
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.getAllDoctorKycDatas.bind(adminController));
router
    .route("/doctors/kyc/:doctor_id")
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.doctorsKycData.bind(adminController));
router
    .route("/kyc-status-update/:doctor_id")
    .patch((0, JwtConfig_1.verifyToken)("admin"), adminController.changeKycStatus.bind(adminController));
router
    .route("/contact")
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.getAllContact.bind(adminController));
router
    .route("/submissions/:id")
    .delete((0, JwtConfig_1.verifyToken)("admin"), adminController.deleteSubmission.bind(adminController));
router
    .route("/dashboardData")
    .get((0, JwtConfig_1.verifyToken)("admin"), adminController.getDashboardData.bind(adminController));
exports.default = router;
