import { Router } from "express";
import DoctorRepository from "../repositories/doctor/doctorRepository"
import DoctorService from "../service/doctor/doctorService";
import DoctorController from "../controllers/doctor/doctorcontroller";



const router = Router();

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

router.post('/signup', doctorController.registerDoctor.bind(doctorController))
router.get('/specializations', doctorController.getAllSpecializations.bind(doctorController));
router.post('/verifyotp',doctorController.verifyOtp.bind(doctorController))
router.post('/resend-otp',doctorController.resendOtp.bind(doctorController))
router.post('/logindoctor',doctorController.loginDoctor.bind(doctorController))





export default router; 