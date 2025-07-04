import { Router } from "express";
import { AuthRepository } from "../repositories/user/AuthRepository";
import { AuthService } from "../service/user/Auth";
import { AuthController } from "../controllers/user/Auth";
// import authMiddleware from "../middlewares/authmiddleware";
import upload from "../utils/multer"
import { verifyToken } from "../config/JwtConfig";


const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);


route.post('/signUp', AuthControllerInstance.createUser.bind(AuthControllerInstance));
route.post('/verifyotp', AuthControllerInstance.verifyOtp.bind(AuthControllerInstance));
route.post('/resend-otp', AuthControllerInstance.resendOtp.bind(AuthControllerInstance));
route.post('/login', AuthControllerInstance.login.bind(AuthControllerInstance));
route.post("/forgototp", AuthControllerInstance.verifyForgotOtp.bind(AuthControllerInstance))
route.post('/googlesignup', AuthControllerInstance.googleSignUpUser.bind(AuthControllerInstance));
route.post("/forgotpassword", AuthControllerInstance.forgotpassword.bind(AuthControllerInstance))
route.post("/resetpassword", AuthControllerInstance.resetPassword.bind(AuthControllerInstance))
route.get("/specializations", verifyToken('user'), AuthControllerInstance.fetchAllSpecializations.bind(AuthControllerInstance))
route.get("/doctors", verifyToken('user'), AuthControllerInstance.getAllDoctors.bind(AuthControllerInstance))
route.get("/doctors/:doctorId", verifyToken('user'), AuthControllerInstance.getDoctor.bind(AuthControllerInstance))
route.get("/status", AuthControllerInstance.getUserStatus.bind(AuthControllerInstance));
route.get("/schedules", verifyToken('user'), AuthControllerInstance.getAppoinmentSchedules.bind(AuthControllerInstance))
route.post("/payment/:appoinmentId", verifyToken('user'), AuthControllerInstance.checkoutPayment.bind(AuthControllerInstance))
route.post("/bookings", verifyToken('user'), AuthControllerInstance.createBooking.bind(AuthControllerInstance))
route.get('/users/:userId', AuthControllerInstance.getUser.bind(AuthControllerInstance))
route.patch('/update-user', upload.single('profileImage'),AuthControllerInstance.updateUserData.bind(AuthControllerInstance));
route.get('/bookings-details/:user_id', AuthControllerInstance.getAllBookings.bind(AuthControllerInstance));
route.post("/cancel-appoinment", AuthControllerInstance.cancelAppoinment.bind(AuthControllerInstance))
route.get("/fetchdoctors/:userId", verifyToken('user'), AuthControllerInstance.getbookedDoctor.bind(AuthControllerInstance))
route.patch('/reset-password/:user_id', AuthControllerInstance.resetPasswords.bind(AuthControllerInstance));
route.get('/prescription/:user_id', AuthControllerInstance.getprescription.bind(AuthControllerInstance))
route.get('/bookings/:user_id/:doctor_id', verifyToken('user'), AuthControllerInstance.findbookings.bind(AuthControllerInstance));
route.post('/review', verifyToken('user'), AuthControllerInstance.addReview.bind(AuthControllerInstance));
route.get('/reviews/:doctor_id', verifyToken('user'), AuthControllerInstance.getReivew.bind(AuthControllerInstance));
route.patch('/edit-review', verifyToken('user'), AuthControllerInstance.editReview.bind(AuthControllerInstance));
route.get('/reviews-summary/:doctor_id', verifyToken('user'), AuthControllerInstance.getReivewSummary.bind(AuthControllerInstance));
route.get('/notifications/:user_id', verifyToken('user'), AuthControllerInstance.getNotifications.bind(AuthControllerInstance));
route.delete('/clear-notifications/:user_id', verifyToken('user'), AuthControllerInstance.clearNotifications.bind(AuthControllerInstance));
route.post('/add-reports',verifyToken('user'),upload.single('image'),AuthControllerInstance.addReport.bind(AuthControllerInstance))
route.get('/reports/:userId', verifyToken('user'), AuthControllerInstance.getReports.bind(AuthControllerInstance));

route.post("/logout", verifyToken('user'), AuthControllerInstance.logout.bind(AuthControllerInstance));

export default route;