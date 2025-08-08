import { Router } from "express";
import { AuthRepository } from "../repositories/user/userRepository";
import { AuthService } from "../service/user/userService";
import { AuthController } from "../controllers/user/userController";
// import authMiddleware from "../middlewares/authmiddleware";
import upload from "../utils/multer"
import { verifyToken } from "../config/JwtConfig";
import { verify } from "crypto";


const router = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);


router.post('/signUp', AuthControllerInstance.createUser.bind(AuthControllerInstance));
router.post('/verifyotp', AuthControllerInstance.verifyOtp.bind(AuthControllerInstance));
router.post('/resend-otp', AuthControllerInstance.resendOtp.bind(AuthControllerInstance));
router.post('/login', AuthControllerInstance.login.bind(AuthControllerInstance));
router.post("/forgototp", AuthControllerInstance.verifyForgotOtp.bind(AuthControllerInstance))
router.post('/googlesignup', AuthControllerInstance.googleSignUpUser.bind(AuthControllerInstance));
router.post("/forgotpassword", AuthControllerInstance.forgotPassword.bind(AuthControllerInstance))
router.post("/resetpassword", AuthControllerInstance.resetPassword.bind(AuthControllerInstance))
router.get("/specializations", verifyToken('user'), AuthControllerInstance.fetchAllSpecializations.bind(AuthControllerInstance))
router.get("/doctors", verifyToken('user'), AuthControllerInstance.getAllDoctors.bind(AuthControllerInstance))
router.get("/doctors/:doctorId", verifyToken('user'), AuthControllerInstance.getDoctor.bind(AuthControllerInstance))
router.get("/status", AuthControllerInstance.getUserStatus.bind(AuthControllerInstance));
router.get("/schedules", verifyToken('user'), AuthControllerInstance.getAppoinmentSchedules.bind(AuthControllerInstance))
router.post("/payment/:appoinmentId", verifyToken('user'), AuthControllerInstance.checkoutPayment.bind(AuthControllerInstance))
router.post("/bookings", verifyToken('user'), AuthControllerInstance.createBooking.bind(AuthControllerInstance))
router.get('/users/:userId', verifyToken('user'), AuthControllerInstance.getUser.bind(AuthControllerInstance))
router.get('/users', verifyToken('user'), AuthControllerInstance.getAllUsers.bind(AuthControllerInstance))
router.patch('/update-user', verifyToken('user'), upload.single('profileImage'), AuthControllerInstance.updateUserData.bind(AuthControllerInstance));
router.get('/bookings-details/:user_id', verifyToken('user'), AuthControllerInstance.getAllBookings.bind(AuthControllerInstance));
router.post("/cancel-appoinment", verifyToken('user'), AuthControllerInstance.cancelAppoinment.bind(AuthControllerInstance))
router.get("/fetchdoctors/:userId", verifyToken('user'), AuthControllerInstance.getBookedDoctor.bind(AuthControllerInstance))
router.patch('/reset-password/:user_id', verifyToken('user'), AuthControllerInstance.resetPasswords.bind(AuthControllerInstance));
router.get('/prescription/download/:prescriptionId/:userId', AuthControllerInstance.downloadPrescriptionPDF.bind(AuthControllerInstance));
router.get('/prescription/:user_id', verifyToken('user'), AuthControllerInstance.getPrescription.bind(AuthControllerInstance))
router.get('/bookings/:user_id/:doctor_id', verifyToken('user'), AuthControllerInstance.findBookings.bind(AuthControllerInstance));
router.post('/review', verifyToken('user'), AuthControllerInstance.addReview.bind(AuthControllerInstance));
router.get('/reviews/:doctor_id', verifyToken('user'), AuthControllerInstance.getReivew.bind(AuthControllerInstance));
router.patch('/edit-review', verifyToken('user'), AuthControllerInstance.editReview.bind(AuthControllerInstance));
router.get('/reviews-summary/:doctor_id', verifyToken('user'), AuthControllerInstance.getReivewSummary.bind(AuthControllerInstance));
router.get('/notifications/:user_id', verifyToken('user'), AuthControllerInstance.getNotifications.bind(AuthControllerInstance));
router.delete('/clear-notifications/:user_id', verifyToken('user'), AuthControllerInstance.clearNotifications.bind(AuthControllerInstance));
router.post('/add-reports', verifyToken('user'), upload.single('image'), AuthControllerInstance.addReport.bind(AuthControllerInstance))
router.get('/wallet-data/:user_id', verifyToken('user'), AuthControllerInstance.getWalletData.bind(AuthControllerInstance));
router.get('/reports/:userId', verifyToken('user'), AuthControllerInstance.getReports.bind(AuthControllerInstance));
router.post('/contact/:userId', verifyToken('user'), AuthControllerInstance.contact.bind(AuthControllerInstance))

router.post("/logout", verifyToken('user'), AuthControllerInstance.logout.bind(AuthControllerInstance));

export default router;