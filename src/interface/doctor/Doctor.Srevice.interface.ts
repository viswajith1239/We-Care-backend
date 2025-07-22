
import { DoctorProfileDTO } from "../../dtos/doctor.dto"
import { IBooking, JwtPayload, JwtPayloads } from "../common"
import { IAppoinment, IDoctor, IKYC, Interface_Doctor, ISpecialization, IWallet, PaginatedWalletResponse, PrescriptionData } from "./doctor_interface"


export interface IDoctorService {

    findAllSpecializations(): Promise<any>
    registerDoctor(doctorData: Interface_Doctor): Promise<void>
    verifyOtp(doctorData: Interface_Doctor, otp: string): Promise<void>
    verifyForgotOTP(doctorData: string, otp: string): Promise<void>
    resendOTP(email: string): Promise<void>
    LoginDoctor(email: string, password: string): Promise<{ doctor: any; user: string, accessToken: string, refreshToken: string }>
    kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }): Promise<any>
    resetapassword(doctorData: string, payload: { newPassword: string }): Promise<any>
    kycStatus(doctorId: string): Promise<IKYC[]>
    getSpecialization(trainerId: string): Promise<ISpecialization>
    getAppoinmentSchedules(doctor_id: string,page?: number, limit?: number): Promise<Interface_Doctor>
    storeAppoinmentData(appoinmentData: IAppoinment): Promise<IAppoinment>
    fetchBookingDetails(doctor_id: string): Promise<IBooking>
    googleSignUpUser(decodedToken: JwtPayloads): Promise<any>
    forgotpassword(emailData: string): Promise<any>
    fetchusers(doctorId: string): Promise<any>
    getAllBookings(doctor_id: string): Promise<any>
    storeMultipleAppointments(appointments: IAppoinment[]): Promise<IAppoinment[]>
    getDoctor(doctor_id: string): Promise<DoctorProfileDTO|null>
    getWallet(doctorId: string,page?:number,limit?:number): Promise<PaginatedWalletResponse | null | undefined>
    withdraw(doctor_id: any, amount: any): Promise<IWallet | null | undefined>
    fetchDoctor(doctor_id: string): Promise<any>
    getNotifications(doctor_id: any): Promise<any>
    clearNotifications(doctor_id: any): Promise<any>
    updateDoctor(doctor_Id: string, updatedDoctorData: Partial<IDoctor>): Promise<IDoctor | null | undefined>;
    savePrescription(formData: PrescriptionData): Promise<any|null>
    fetchPrescriptions(doctor_id: string): Promise<any>
    getDashboardData(): Promise<void>
    cancelAppoinment(id: string): Promise<IAppoinment | null>
    findAppointmentById(id: string): Promise<IAppoinment | null>;
    rescheduleAppointment(appointmentId: string, updatedData: any): Promise<IAppoinment | null>;
    getReportsByUserId(doctorId:string):Promise<any>
    getBookingsByDoctorAndUser(doctorId:string,userId:string):Promise<any>
}