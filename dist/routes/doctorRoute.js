"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../utils/multer"));
const doctorRepository_1 = __importDefault(require("../repositories/doctor/doctorRepository"));
const doctorService_1 = __importDefault(require("../service/doctor/doctorService"));
const doctorcontroller_1 = require("../controllers/doctor/doctorcontroller");
const JwtConfig_1 = require("../config/JwtConfig");
console.log("DoctorController", doctorcontroller_1.DoctorController);
const uploadDoctorDataFiles = multer_1.default.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: "aadhaarFrontSide", maxCount: 1 },
    { name: "aadhaarBackSide", maxCount: 1 },
    { name: "certificate", maxCount: 1 }
]);
const router = (0, express_1.Router)();
const doctorRepository = new doctorRepository_1.default();
const doctorService = new doctorService_1.default(doctorRepository);
const doctorController = new doctorcontroller_1.DoctorController(doctorService);
router.post('/signup', doctorController.registerDoctor.bind(doctorController));
router.get('/specializations', doctorController.getAllSpecializations.bind(doctorController));
router.post('/verifyotp', doctorController.verifyOtp.bind(doctorController));
router.post('/resend-otp', doctorController.resendOtp.bind(doctorController));
router.post('/logindoctor', doctorController.loginDoctor.bind(doctorController));
router.post('/googlesignup', doctorController.googleSignUpUser.bind(doctorController));
router.post('/kyc', uploadDoctorDataFiles, doctorController.kycSubmission.bind(doctorController));
router.get('/kycStatus/:doctorId', doctorController.doctorKycStatus.bind(doctorController));
router.post("/forgotpassword", doctorController.forgotPassword.bind(doctorController));
router.post("/forgototp", doctorController.verifyForgotOtp.bind(doctorController));
router.post("/resetpassword", doctorController.resetPassword.bind(doctorController));
router.get("/specializations/:doctorId", (0, JwtConfig_1.verifyToken)('doctor'), doctorController.getSpecialization.bind(doctorController));
router.post('/appoinments/:doctorId', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.storeAppoinmentData.bind(doctorController));
router.patch('/update-doctor/:doctor_id', (0, JwtConfig_1.verifyToken)('doctor'), multer_1.default.single('profileImage'), doctorController.updateDoctor.bind(doctorController));
router.get('/shedules/:doctorId', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.getAppoinmentSchedules.bind(doctorController));
router.patch('/shedules/:appoinmentId/appoinment', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.cancelAppoinment.bind(doctorController));
router.put('/shedules/:rescheduleAppointmentId/reschedule', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.rescheduleAppointment.bind(doctorController));
router.get('/:doctor_id', doctorController.getDoctor.bind(doctorController));
router.get(`/bookingdetails/:doctorId`, (0, JwtConfig_1.verifyToken)('doctor'), doctorController.fetchBookingDetails.bind(doctorController));
router.get('/fetchusers/:doctorId', doctorController.fetchUsers.bind(doctorController));
router.get('/bookings/:doctor_id', doctorController.getAllBookings.bind(doctorController));
router.get('/wallet-data/:doctor_id', doctorController.getWalletData.bind(doctorController));
router.post('/withdraw/:doctor_id', doctorController.withdraw.bind(doctorController));
router.get('/notifications/:doctor_id', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.getNotifications.bind(doctorController));
router.delete('/clear-notifications/:doctor_id', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.clearNotifications.bind(doctorController));
router.post('/prescription/:doctor_id/:user_id', doctorController.createPrescription.bind(doctorController));
router.get('/booking/:doctorId/:userId', doctorController.getPatientBookingForDoctor.bind(doctorController));
router.get('/reports/:doctorId', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.getReports.bind(doctorController));
router.get('/prescriptions/:doctor_id', doctorController.getPrescriptionsByDoctor.bind(doctorController));
router.get('/dashboard/:doctor_id', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.getDashboardData.bind(doctorController));
router.post('/logout', (0, JwtConfig_1.verifyToken)('doctor'), doctorController.logoutDoctor.bind(doctorController));
exports.default = router;
