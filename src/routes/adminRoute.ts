import { Router } from "express";
import AdminRepository from "../repositories/admin/adminRepository"
import AdminService from "../service/admin/adminService"
import AdminController from "../controllers/admin/adminController"
import authMiddleware from "../middlewares/authmiddleware";
import { verifyToken } from "../config/JwtConfig";


const router = Router();
const adminRepository = new AdminRepository()
const adminService = new AdminService(adminRepository)
const adminController = new AdminController(adminService)


router
  .route("/loginadmin")
  .post(adminController.adminLogin.bind(adminController));

router
  .route("/logout")
  .post(adminController.logoutAdmin.bind(adminController));


router
  .route("/specialization")
  .post(adminController.addSpecialization.bind(adminController))
  .get(verifyToken("admin"), adminController.getAllSpecializations.bind(adminController));

router
  .route("/specialization/:id")
  .put(verifyToken("admin"), adminController.updateSpecialisation.bind(adminController));

router
  .route("/specializations/:id")
  .delete(adminController.deleteSpecialization.bind(adminController));


router
  .route("/users")
  .get(verifyToken("admin"), adminController.getAllUsers.bind(adminController));

router
  .route("/user/:user_id/block-unblock")
  .patch(verifyToken("admin"), adminController.blockUnblockUser.bind(adminController));


router
  .route("/doctors")
  .get(verifyToken("admin"), adminController.getAllDoctors.bind(adminController));

router
  .route("/doctor/:doctor_id/block-unblock")
  .patch(verifyToken("admin"), adminController.blockUnblockDoctor.bind(adminController));

router
  .route("/doctor/kyc")
  .get(verifyToken("admin"), adminController.getAllDoctorKycDatas.bind(adminController));

router
  .route("/doctors/kyc/:doctor_id")
  .get(verifyToken("admin"), adminController.doctorsKycData.bind(adminController));

router
  .route("/kyc-status-update/:doctor_id")
  .patch(verifyToken("admin"), adminController.changeKycStatus.bind(adminController));


router
  .route("/contact")
  .get(verifyToken("admin"), adminController.getAllContact.bind(adminController));

router
  .route("/submissions/:id")
  .delete(verifyToken("admin"), adminController.deleteSubmission.bind(adminController));


router
  .route("/dashboardData")
  .get(verifyToken("admin"), adminController.getDashboardData.bind(adminController));

export default router; 