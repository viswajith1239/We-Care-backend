 import AdminRepository from "../../repositories/admin/adminRepository"
 import sendMail from "../../config/emailConfig";
 import { kyTemplate } from "../../config/kyTemplate";

import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { IAdminRepository } from "../../interface/admin/Admin.repository.interface";
import { IAdminService } from "../../interface/admin/Admin.service.interface";
import { IUser } from "../../interface/common";
dotenv.config();

class AdminService implements IAdminService {
    private adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {

    this.adminRepository = adminRepository;
  }
  async adminLogin(email: string,password: string) {
    try {
        console.log("admin servicil ethi");
        
      if (process.env.ADMIN_EMAIL === email && process.env.ADMIN_PASSWORD === password) {
        console.log("Credentials matched");
  
        let adminData: any = await this.adminRepository.findAdmin(email);
  
        if (!adminData) {
          console.log("Admin does not exist, creating admin...");
          adminData = await this.adminRepository.createAdmin(email, password);
        }
  
      const accessToken = jwt.sign(
                { id: adminData._id.toString(), email: adminData.email, role: "admin" },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
              );
      
              const refreshToken = jwt.sign(
                { id: adminData._id.toString(), email: adminData.email,  },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
              );
  
        return {
          accessToken,
          refreshToken,
          admin: {
            id: adminData._id.toString(),
            email: adminData.email,
            password: adminData.password,
          },
        };
      } else {
        console.log("Invalid admin credentials");
        return {
          status: 401,
          success: false,
          message: "Invalid admin credentials",
        };
      }
    } catch (error) {
      console.error("Error in adminLogin", error);
      throw new Error("Admin login failed. Please try again later.");
    }
  }

  async getAllUsers(){
    return await this.adminRepository.fetchAllUsers()
  }


  async addSpecialization(specializationData:{name:string,description:string}){
    console.log("hello");
    
    const specialization=await this.adminRepository.saveSpecialization({...specializationData})
    return specialization
    }

    async getAllSpecializations() {
      const specializations = await this.adminRepository.getAllSpecializations()    
      return specializations
    }

    async updatespecialisation(name:string,description:string,specializationId:string){
      
      const specializationresponse=await this.adminRepository.saveupdatespecialization(name,description,specializationId)
      return specializationresponse
    }
     deleteSpecializationService =  async (id: string): Promise<void> => {
      await this.adminRepository.deleteSpecializationRepository(id);
    };


    async blockUnblockUser(user_id: string, userState: boolean):Promise<any> {
      return await this.adminRepository.blockUnblockUser(user_id, userState);
  }
  

    async DoctorsKycData():Promise<any> {
      try {
        const allDoctorsKycData =
          await this.adminRepository.getAllDoctorsKycDatas();
        
  
        return allDoctorsKycData;
      } catch (error) {
        console.error("Error fetching doctors KYC data:", error);
        throw error;
      }
    }

    async fetchKycData(doctorId: string):Promise<any>{
      try {
        let response = await this.adminRepository.fetchKycData(doctorId);
        console.log("casual checking", response);
        return response;
      } catch (error) {
        console.log(error);
      }
    }

    async updateKycStatus(
      status: string,
      doctor_id: string,
      rejectionReason: string | null
    ): Promise<void> {
      try {
        const updatedKyc = await this.adminRepository.updateKycStatus(
          status,
          doctor_id,
          rejectionReason
        );
        console.log("simply checkingggg datas", updatedKyc);
  
        if (status === "approved" || status === "rejected") {
          await this.adminRepository.deleteKyc(doctor_id);
          console.log(`KYC data deleted for trainer ID: ${doctor_id}`);
        }
  
        if (status === "approved") {
          console.log("simply checkingggg approved", updatedKyc);
          const email_Ht = kyTemplate(
            "your Kyc approved successfully",
            updatedKyc || "user",
            status
          );
          await sendMail("approve", updatedKyc, email_Ht);
        } else {
          console.log("simply checkingggg", updatedKyc.trainerMail);
          const email_Ht = kyTemplate(
            updatedKyc.reason,
            updatedKyc.trainerMai || "user",
            status
          );
  
          await sendMail("reject", updatedKyc.trainerMail, email_Ht);
        }
      } catch (error) {
        console.error("Error updating KYC status:", error);
      }
    }

}
export default AdminService
  
    