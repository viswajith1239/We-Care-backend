import { PaginatedDoctorResponse } from "../../dtos/doctor.dto";
import { PaginatedUserResponse, UserResponseDTO } from "../../dtos/user.dto";
import { IDoctor, IUser } from "../common"
import { IKYC } from "../doctor/doctor_interface";
import { ISpecialization, ISpecializationPaginationResponse } from "./admin_interface";



export interface IAdminService {
    adminLogin(email: string, password: string): Promise<any>
    getAllUsers(page?: number, limit?: number,search?:string): Promise<PaginatedUserResponse | undefined>
    getAllDoctors(page?: number, limit?: number,search?:string): Promise<PaginatedDoctorResponse|undefined>
    addSpecialization(specializationData: { name: string; description: string; }): Promise<any>
    updateSpecialisation(name: string, description: string, specializationId: string): Promise<void>
    getAllSpecializations(page?: number, limit?: number): Promise<ISpecializationPaginationResponse | undefined | null>
    getAllContact(): Promise<any>//any mattanam
    // saveupdatespecialization(name:string,description:string,specializationId:string):Promise<any>
    blockUnblockUser(user_id: string, userState: boolean): Promise<IUser>
    blockUnblockDoctor(doctor_id: string, doctorState: boolean): Promise<IDoctor>
    doctorsKycData(): Promise<void>
    updateKycStatus(status: string, doctor_id: string, rejectionReason: string | null): Promise<void>
    fetchKycData(doctorId: string): Promise<IKYC | undefined | null>
    deleteSpecializationService(id: string): Promise<any>
    deleteSubmission(id: string): Promise<any>
    getDashboardData(): Promise<any>
}
