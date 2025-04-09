import { IUser } from "../common";
import { IDoctorKYC, IKYC } from "../doctor/doctor_interface";
import { ISpecialization, LoginAdmin_interface } from "./admin_interface";

type IUserDocument = IUser & Document;
export interface IAdminRepository{

    findAdmin(email:string):Promise<LoginAdmin_interface|undefined|null>
    createAdmin(email:string,password:string):Promise<LoginAdmin_interface|null>
    fetchAllUsers():Promise<IUserDocument[] |undefined>
    getAllSpecializations():Promise<ISpecialization[]|undefined|null>
    saveSpecialization({name,description}:{name:string,description:string}):Promise<any>
    blockUnblockUser(user_id:string,userState:boolean):Promise<IUser|undefined|null>
    fetchKycData(doctorId:string):Promise<IKYC|undefined|null>
    getAllDoctorsKycDatas():Promise<IDoctorKYC[]>
    updateKycStatus(status: string, doctor_id: string, rejectionReason: string | null):Promise<any>
    saveupdatespecialization(name:string,description:string,specializationId:string):Promise<any>
    deleteKyc(doctor_id: string):Promise<void>
    deleteSpecializationRepository(id:string):Promise<any>
    getAllStatistics():Promise<any>
}