import { Router } from "express";
import { AuthRepository } from "../repositories/user/AuthRepository";
import { AuthService } from "../service/user/Auth";
import { AuthController } from "../controllers/user/Auth";
import authMiddleware from "../middlewares/authmiddleware";


const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);


route.post('/signUp', AuthControllerInstance.createUser.bind(AuthControllerInstance));
route.post('/verifyotp', AuthControllerInstance.verifyOtp.bind(AuthControllerInstance));
route.post('/resend-otp', AuthControllerInstance.resendOtp.bind(AuthControllerInstance));
route.post('/login', AuthControllerInstance.login.bind(AuthControllerInstance));
route.post("/forgototp",AuthControllerInstance.verifyForgotOtp.bind(AuthControllerInstance))
route.post('/googlesignup', AuthControllerInstance.googleSignUpUser.bind(AuthControllerInstance));
route.post("/forgotpassword",AuthControllerInstance.forgotpassword.bind(AuthControllerInstance))
route.post("/resetpassword",AuthControllerInstance.resetPassword.bind(AuthControllerInstance))
route.get("/specializations",AuthControllerInstance.fetchAllSpecializations.bind(AuthControllerInstance))
route.get("/doctors",AuthControllerInstance.getAllDoctors.bind(AuthControllerInstance))
route.get("/doctors/:doctorId",AuthControllerInstance.getDoctor.bind(AuthControllerInstance))
route.get("/status",AuthControllerInstance.getUserStatus.bind(AuthControllerInstance));
route.get("/schedules",AuthControllerInstance.getAppoinmentSchedules.bind(AuthControllerInstance))
route.post("/payment/:appoinmentId",AuthControllerInstance.checkoutPayment.bind(AuthControllerInstance))
route.post("/bookings",AuthControllerInstance.createBooking.bind(AuthControllerInstance))

    
export default route;