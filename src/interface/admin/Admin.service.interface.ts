import { PaginatedUserResponse, UserResponseDTO } from "../../dtos/user.dto";
import { IUser } from "../common"
import { IKYC } from "../doctor/doctor_interface";
import { ISpecialization, ISpecializationPaginationResponse } from "./admin_interface";



export interface IAdminService{
    adminLogin(email:string,password:string):Promise<any>
    getAllUsers(page?: number, limit?: number): Promise<PaginatedUserResponse|undefined>
    addSpecialization(specializationData: { name: string; description: string;}):Promise<any>
    updatespecialisation( name: string,description: string,specializationId: string):Promise<void>
    getAllSpecializations(page?: number, limit?: number):Promise<ISpecializationPaginationResponse|undefined|null>
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
