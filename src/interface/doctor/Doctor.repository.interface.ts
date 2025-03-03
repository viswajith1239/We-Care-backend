
import { IAppoinment, Interface_Doctor } from "./doctor_interface"
import  {IOtp, IUser} from "../common"
import mongoose from "mongoose"
export interface IDoctorRepository{
    findAllSpecializations():Promise<any>
    getDoctorStatus(doctorId: string):Promise<any>
    existsDoctor(DoctorData: Interface_Doctor):Promise<any>
    saveOtp(email: string, OTP: string, OTPExpirey: Date):Promise<void>
    getOtpByEmail(email: string):Promise<IOtp[] | []>
    createNewUser(trainerData: Interface_Doctor):Promise<any>
    deleteOtpById(otpId?: mongoose.Types.ObjectId):Promise<any>
    findDoctor(email: string):Promise<Interface_Doctor | null>
    saveKyc(formData: any, documents: any):Promise<any>
    changeKycStatus(doctorId: string, profileImage: string | undefined):Promise<string | undefined>
    getSpecialization(trainerid:string):Promise<any>
    createNewAppoinment(sessiondata: IAppoinment):Promise<any>
    fetchAppoinmentData(doctor_id: string):Promise<any>
    fecthBookingDetails(doctor_id: string):Promise<any>
    existingUser(email: string): Promise<Interface_Doctor | null>;
    createUsers(user: {email: string; name: string; password: string | null; }):Promise<any>
}
