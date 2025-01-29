import { Router } from "express";
import upload from "../utils/multer"
import DoctorRepository from "../repositories/doctor/doctorRepository"
import DoctorService from "../service/doctor/doctorService";
import DoctorController from "../controllers/doctor/doctorcontroller";

const uploadDoctorDataFiles = upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: "aadhaarFrontSide", maxCount: 1 },  
    { name: "aadhaarBackSide", maxCount: 1 },
    { name: "certificate", maxCount: 1 }
  ]);



const router = Router();

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

router.post('/signup', doctorController.registerDoctor.bind(doctorController))
router.get('/specializations', doctorController.getAllSpecializations.bind(doctorController));
router.post('/verifyotp',doctorController.verifyOtp.bind(doctorController))
router.post('/resend-otp',doctorController.resendOtp.bind(doctorController))
router.post('/logindoctor',doctorController.loginDoctor.bind(doctorController))
router.post('/kyc',uploadDoctorDataFiles,doctorController.kycSubmission.bind(doctorController))
router.get('/kycStatus/:doctorId',doctorController.doctorKycStatus.bind(doctorController))





export default router; 