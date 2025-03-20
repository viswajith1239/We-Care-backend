import { IBooking, JwtPayload, JwtPayloads } from "../common"
import { IAppoinment, IKYC, Interface_Doctor, ISpecialization } from "./doctor_interface"


export interface IDoctorService{

    findAllSpecializations():Promise<any>
    registerDoctor(doctorData:Interface_Doctor):Promise<void>
    verifyOtp(doctorData:Interface_Doctor,otp:string):Promise<void>
    resendOTP(email:string):Promise<void>
    LoginDoctor(email:string,password:string):Promise<{doctor: any;user:string,accessToken:string,refreshToken:string}>
    kycSubmit(formData: any, files: { [fieldname: string]: Express.Multer.File[] }):Promise<any>
    kycStatus(doctorId:string):Promise<IKYC[]>
    getSpecialization(trainerId:string):Promise<ISpecialization>
    getAppoinmentSchedules(doctor_id:string):Promise<Interface_Doctor>
    storeAppoinmentData(appoinmentData:IAppoinment):Promise<IAppoinment>
    fetchBookingDetails(doctor_id:string):Promise<IBooking>
    googleSignUpUser(decodedToken: JwtPayloads):Promise<any>
    fetchusers(doctorId:string):Promise<any>

}