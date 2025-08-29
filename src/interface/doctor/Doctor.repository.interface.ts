
import { IAppoinment, Interface_Doctor, IWallet, PaginatedWalletResponse, PrescriptionData } from "./doctor_interface"
import { IOtp, IUser } from "../common"
import mongoose from "mongoose"
export interface IDoctorRepository {

    
   
    saveOtp(email: string, OTP: string, OTPExpirey: Date): Promise<void>
    getOtpByEmail(email: string): Promise<IOtp[] | []>
    createNewUser(newUserData: Interface_Doctor): Promise<any>
    deleteOtpById(otpId?: mongoose.Types.ObjectId): Promise<any>
    findDoctor(email: string): Promise<Interface_Doctor | null>
    saveKyc(formData: any, documents: any): Promise<any>
    changeKycStatus(doctorId: string, profileImage: string | undefined): Promise<string | undefined>
    getSpecialization(doctorId: string): Promise<any>
    createNewAppoinment(sessiondata: IAppoinment): Promise<any>
    fetchAppoinmentData(doctor_id: string, page?: number, limit?: number,search?: string): Promise<any>
    fecthBookingDetails(doctor_id: string): Promise<any>
    existingUser(email: string): Promise<Interface_Doctor | null>;
     existsDoctor(DoctorData: Interface_Doctor): Promise<any>
    createUsers(user: { email: string; name: string; password: string | null; }): Promise<any>
    fetchUsers(doctorId: string): Promise<any>
    getAllBookings(doctor_Id: string , page?: number, limit?: number,search?: string): Promise<any>
    createMultipleAppointments(appointments: IAppoinment[]): Promise<IAppoinment[]>;
    findAllSpecializations(): Promise<any>
    getDoctorStatus(doctorId: string): Promise<any>
    findConflictingAppointments(appointmentData: Partial<IAppoinment>): Promise<IAppoinment[]>;
    getDoctor(doctor_id: string): Promise<any>
    fetchWalletData(doctor_id: string, page?: number, limit?: number): Promise<PaginatedWalletResponse | null | undefined>
    withdrawMoney(doctor_id: any, amount: any): Promise<any>
    getDoctorProfile(doctor_id: string): Promise<any>
    updateDoctorData(doctor_id: string): Promise<any>
    saveOTP(email: string, OTP: string, OTPExpirey: Date): Promise<void>
    findUserEmail(email: string): Promise<any>
    getOtpsByEmail(email: string): Promise<IOtp[] | []>
    saveResetPassword(email: string, hashedPassword: string): Promise<any>
    fetchNotifications(doctorId: any): Promise<any>
    deleteDoctorNotifications(doctorId: any): Promise<any>
    create(data: PrescriptionData): Promise<any>
    getPrescriptionsByDoctor(doctor_id: string, page?: number, limit?: number,search?: string): Promise<any>
    getAllStatistics(): Promise<any>
    cancelAppoinment(id: any): Promise<IAppoinment | null>
    findAppointmentById(id: string): Promise<IAppoinment | null>;
    findAppointmentById(id: string): Promise<IAppoinment | null>;
    checkSchedulingConflicts(
        doctorId: string | mongoose.Types.ObjectId | mongoose.Schema.Types.ObjectId,
        id: string,
        selectedDate: string,
        startTime: string,
        endTime: string
    ): Promise<IAppoinment[]>;
    rescheduleAppointment(id: string, updatedData: any): Promise<IAppoinment | null>;
    getReportsByUserId(doctorId: string, page?: number, limit?: number,search?: string): Promise<any>
    findByDoctorAndUser(doctorId: string, userId: string): Promise<any>
}
