import { Router } from "express";
import { AuthRepository } from "../repositories/user/AuthRepository";
import { AuthService } from "../service/user/Auth";
import { AuthController } from "../controllers/user/Auth";


const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);


route.post('/signUp', AuthControllerInstance.createUser.bind(AuthControllerInstance));
route.post('/verifyotp', AuthControllerInstance.verifyOtp.bind(AuthControllerInstance));
route.post('/resend-otp', AuthControllerInstance.resendOtp.bind(AuthControllerInstance));
route.post('/login', AuthControllerInstance.login.bind(AuthControllerInstance));
route.post('/googlesignup', AuthControllerInstance.googleSignUpUser.bind(AuthControllerInstance));
route.get("/specializations",AuthControllerInstance.fetchAllSpecializations.bind(AuthControllerInstance))
route.get("/doctors",AuthControllerInstance.getAllDoctors.bind(AuthControllerInstance))
    
export default route;