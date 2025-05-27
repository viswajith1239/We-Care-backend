import { Router } from "express";
import upload from "../utils/multer"
import DoctorRepository from "../repositories/doctor/doctorRepository"
import DoctorService from "../service/doctor/doctorService";
import DoctorController from "../controllers/doctor/doctorcontroller";
import authMiddlewares from "../middlewares/authmiddleware";
import { verifyToken } from "../config/JwtConfig";

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
router.post('/verifyotp', doctorController.verifyOtp.bind(doctorController))
router.post('/resend-otp', doctorController.resendOtp.bind(doctorController))
router.post('/logindoctor', doctorController.loginDoctor.bind(doctorController))
router.post('/googlesignup', doctorController.googleSignUpUser.bind(doctorController));
router.post('/kyc', uploadDoctorDataFiles, doctorController.kycSubmission.bind(doctorController))
router.get('/kycStatus/:doctorId', doctorController.doctorKycStatus.bind(doctorController))
router.post("/forgotpassword", doctorController.forgotpassword.bind(doctorController))
router.post("/forgototp", doctorController.verifyForgotOtp.bind(doctorController))
router.post("/resetpassword", doctorController.resetPassword.bind(doctorController))
router.get("/specializations/:doctorId", verifyToken('doctor'), doctorController.getSpecialization.bind(doctorController))
router.post('/appoinments/:doctorId', verifyToken('doctor'), doctorController.storeAppoinmentData.bind(doctorController));
router.patch('/update-doctor/:doctor_id', verifyToken('doctor'), upload.single('profileImage'), doctorController.updateDoctor.bind(doctorController));
router.get('/shedules/:doctorId', verifyToken('doctor'), doctorController.getAppoinmentSchedules.bind(doctorController))
router.patch('/shedules/:appoinmentId/appoinment', verifyToken('doctor'), doctorController.cancelAppoinment.bind(doctorController))
router.put('/shedules/:rescheduleAppointmentId/reschedule', verifyToken('doctor'), doctorController.rescheduleAppointment.bind(doctorController))
router.get('/:doctor_id', doctorController.getDoctor.bind(doctorController));
router.get(`/bookingdetails/:doctorId`, verifyToken('doctor'), doctorController.fetchbookingDetails.bind(doctorController))
router.get('/fetchusers/:doctorId', doctorController.fetchusers.bind(doctorController))
router.get('/bookings/:doctor_id', doctorController.getAllBookings.bind(doctorController));
router.get('/wallet-data/:doctor_id', doctorController.getWalletData.bind(doctorController));
router.post('/withdraw/:doctor_id', doctorController.withdraw.bind(doctorController));
router.get('/notifications/:doctor_id', verifyToken('doctor'), doctorController.getNotifications.bind(doctorController));
router.delete('/clear-notifications/:doctor_id', verifyToken('doctor'), doctorController.clearNotifications.bind(doctorController));
router.post('/prescription/:doctor_id/:user_id', doctorController.createPrescription.bind(doctorController));
router.get('/reports/:doctorId',verifyToken('doctor'),doctorController.getReports.bind(doctorController))
router.get('/prescriptions/:doctor_id', doctorController.getPrescriptionsByDoctor.bind(doctorController));
router.get('/dashboard/:doctor_id', verifyToken('doctor'), doctorController.getDashboardData.bind(doctorController));


router.post('/logout', verifyToken('doctor'), doctorController.logoutDoctor.bind(doctorController));








export default router; 