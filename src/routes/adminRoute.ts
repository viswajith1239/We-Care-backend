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


router.post("/loginadmin", adminController.adminLogin.bind(adminController))
router.post('/logout', adminController.logoutAdmin.bind(adminController));
router.post("/specialization", adminController.addSpecialization.bind(adminController));
router.get("/users", verifyToken('admin'), adminController.getAllUsers.bind(adminController))
router.get("/doctors", verifyToken('admin'), adminController.getAllDoctors.bind(adminController))
router.get('/specialization', verifyToken('admin'), adminController.getAllSpecializations.bind(adminController))
router.patch('/user/:user_id/block-unblock', verifyToken('admin'), adminController.blockUnblockUser.bind(adminController))
router.patch('/doctor/:doctor_id/block-unblock', verifyToken('admin'), adminController.blockUnblockDoctor.bind(adminController))
router.put("/specialization/:id", verifyToken('admin'), adminController.updateSpecialisation.bind(adminController))
router.delete("/specializations/:id", adminController.deleteSpecialization.bind(adminController))
router.get("/doctor/kyc", verifyToken('admin'), adminController.getAllDoctorKycDatas.bind(adminController))
router.get('/doctors/kyc/:doctor_id', verifyToken('admin'), adminController.doctorsKycData.bind(adminController));
router.patch('/kyc-status-update/:doctor_id', verifyToken('admin'), adminController.changeKycStatus.bind(adminController));
router.get("/contact", verifyToken('admin'), adminController.getAllContact.bind(adminController))
router.delete("/submissions/:id", verifyToken('admin'), adminController.deleteSubmission.bind(adminController))
router.get('/dashboardData', verifyToken('admin'), adminController.getDashboardData.bind(adminController));

export default router; 