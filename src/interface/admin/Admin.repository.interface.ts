import { PaginatedDoctorResponse } from "../../dtos/doctor.dto";
import { PaginatedUserResponse, UserResponseDTO } from "../../dtos/user.dto";
import { IDoctor, IUser } from "../common";
import { IDoctorKYC, IKYC } from "../doctor/doctor_interface";
import { ISpecialization, ISpecializationPaginationResponse, LoginAdmin_interface } from "./admin_interface";

type IUserDocument = IUser & Document;
export interface IAdminRepository {

    findAdmin(email: string): Promise<LoginAdmin_interface | undefined | null>
    createAdmin(email: string, password: string): Promise<LoginAdmin_interface | null>
    fetchAllUsers(page?: number, limit?: number,search?:string): Promise<PaginatedUserResponse | undefined>
    fetchAllDoctors(page?: number, limit?: number,search?:string): Promise<PaginatedDoctorResponse | undefined>
    getAllContact(): Promise<any>
    getAllSpecializations(page?: number, limit?: number): Promise<ISpecializationPaginationResponse | undefined | null>
    saveSpecialization({ name, description }: { name: string, description: string }): Promise<any>
    blockUnblockUser(user_id: string, userState: boolean): Promise<IUser | undefined | null>
    blockUnblockDoctor(doctor_id: string, doctorState: boolean): Promise<IDoctor | undefined | null>
    fetchKycData(doctorId: string): Promise<IKYC | undefined | null>
    getAllDoctorsKycDatas(): Promise<IDoctorKYC[]>
    updateKycStatus(status: string, doctor_id: string, rejectionReason: string | null): Promise<any>
    saveUpdateSpecialization(name: string, description: string, specializationId: string): Promise<any>
    deleteKyc(doctor_id: string): Promise<void>
    deleteSpecializationRepository(id: string): Promise<any>
    deleteSubmission(id: string): Promise<any>
    getAllStatistics(): Promise<any>
}