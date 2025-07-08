import { IUser } from "../common"
import { IKYC } from "../doctor/doctor_interface";
import { ISpecialization } from "./admin_interface";



export interface IAdminService{
    adminLogin(email:string,password:string):Promise<any>
    getAllUsers(): Promise<IUser[]|undefined>
    addSpecialization(specializationData: { name: string; description: string;}):Promise<any>
    updatespecialisation( name: string,description: string,specializationId: string):Promise<void>
    getAllSpecializations():Promise<ISpecialization[]|undefined|null>
    getallcontact():Promise<any>
    // saveupdatespecialization(name:string,description:string,specializationId:string):Promise<any>
    blockUnblockUser(user_id:string,userState:boolean):Promise<IUser>
    DoctorsKycData():Promise<void>
    updateKycStatus(  status: string, doctor_id: string,rejectionReason: string | null):Promise<void>
    fetchKycData(doctorId:string):Promise<IKYC|undefined|null>
    deleteSpecializationService(id:string):Promise<any>
    deletesubmission(id:string):Promise<any>
    getDashboardData():Promise<any>
}
