import { Router } from "express";
import upload from "../utils/multer"
import DoctorRepository from "../repositories/doctor/doctorRepository"
import DoctorService from "../service/doctor/doctorService";
import DoctorController from "../controllers/doctor/doctorcontroller";
import authMiddlewares from "../middlewares/authmiddleware";

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
router.post('/googlesignup', doctorController.googleSignUpUser.bind(doctorController));
router.post('/kyc',uploadDoctorDataFiles,doctorController.kycSubmission.bind(doctorController))
router.get('/kycStatus/:doctorId',doctorController.doctorKycStatus.bind(doctorController))
router.get("/specializations/:doctorId",doctorController.getSpecialization.bind(doctorController))
router.post('/appoinments/:doctorId', (req, res, next) => {
  console.log("🔹 Received doctorId from request params:", req.params.doctorId);
  console.log("🔹 Received request body:", req.body);
  next();
}, doctorController.storeAppoinmentData.bind(doctorController));

router.get('/shedules/:doctorId', doctorController.getAppoinmentSchedules.bind(doctorController))

router.get(`/bookingdetails/:doctorId`,doctorController.fetchbookingDetails.bind(doctorController))







export default router; 