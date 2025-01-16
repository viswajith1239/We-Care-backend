import { Router } from "express";
import AdminRepository from "../repositories/admin/adminRepository"
import AdminService from "../service/admin/adminService"
import AdminController from "../controllers/admin/adminController"
import authMiddleware from "../middlewares/authmiddleware";


const router = Router();
const adminRepository=new AdminRepository()
const adminService =new AdminService(adminRepository)
const adminController=new AdminController(adminService)


router.post("/loginadmin",adminController.adminLogin.bind(adminController))
router.post("/specialization",adminController.addspecialization.bind(adminController))
router.get("/users",adminController.getAllUsers.bind(adminController))
router.get('/specialization',  adminController.getAllSpecializations.bind(adminController))
router.patch('/:user_id/block-unblock',adminController.blockUnblockUser.bind(adminController))
router.put("/specialization/:id",adminController.updatespecialisation.bind(adminController))
router.delete("/specializations/:id",adminController.deleteSpecialization.bind(adminController))

export default router; 