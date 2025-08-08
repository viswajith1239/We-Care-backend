import AdminRepository from "../../repositories/admin/adminRepository"
import sendMail from "../../config/emailConfig";
import { kyTemplate } from "../../config/kyTemplate";

import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { IAdminRepository } from "../../interface/admin/Admin.repository.interface";
import { IAdminService } from "../../interface/admin/Admin.service.interface";
import { IUser } from "../../interface/common";
import { PaginatedUserResponse, UserResponseDTO } from "../../dtos/user.dto";
import { mapUserToDTO } from "../../utils/userMapper";
import { IUserDocument } from "../../models/userModel";
import { mapDoctorToDTO } from "../../utils/doctorMapper";
import { PaginatedDoctorResponse } from "../../dtos/doctor.dto";
dotenv.config();

class AdminService implements IAdminService {
  private _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {

    this._adminRepository = adminRepository;
  }
  async adminLogin(email: string, password: string) {
    try {



      if (process.env.ADMIN_EMAIL === email && process.env.ADMIN_PASSWORD === password) {


        let adminData: any = await this._adminRepository.findAdmin(email);

        if (!adminData) {

          adminData = await this._adminRepository.createAdmin(email, password);
        }

        const accessToken = jwt.sign(
          { id: adminData._id.toString(), email: adminData.email, role: "admin" },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
          { id: adminData._id.toString(), email: adminData.email, },
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

  async getAllUsers(page: number = 1, limit: number = 5,search:string): Promise<PaginatedUserResponse> {
    const result = await this._adminRepository.fetchAllUsers(page, limit,search);

    if (!result) {
      return {
        users: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: limit
        }
      };
    }


    const { users, pagination } = result;


    const mappedUsers = (users as unknown as IUserDocument[]).map(mapUserToDTO);

    return {
      users: mappedUsers,
      pagination: pagination
    };
  }

  async getAllDoctors(page: number = 1, limit: number = 5,search:string): Promise<PaginatedDoctorResponse> {
    const result = await this._adminRepository.fetchAllDoctors(page, limit,search);

    if (!result) {
      return {
        doctors: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalDoctors: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: limit
        }
      };
    }


    const { doctors, pagination } = result;


    const mappedDoctors = (doctors as unknown as IUserDocument[]).map(mapDoctorToDTO);

    return {
      doctors: mappedDoctors,
      pagination: pagination
    };
  }

  async getAllContact() {
    return await this._adminRepository.getAllContact()
  }


  async addSpecialization(specializationData: { name: string, description: string }) {


    const specialization = await this._adminRepository.saveSpecialization({ ...specializationData })
    return specialization
  }

  async getAllSpecializations(page: number = 1, limit: number = 5) {
    const specializations = await this._adminRepository.getAllSpecializations(page, limit)
    return specializations
  }

  async updateSpecialisation(name: string, description: string, specializationId: string) {

    const specializationresponse = await this._adminRepository.saveUpdateSpecialization(name, description, specializationId)
    return specializationresponse
  }
  deleteSpecializationService = async (id: string): Promise<void> => {
    await this._adminRepository.deleteSpecializationRepository(id);
  };
  deleteSubmission = async (id: string): Promise<void> => {
    await this._adminRepository.deleteSubmission(id);
  };



  async blockUnblockUser(user_id: string, userState: boolean): Promise<any> {
    return await this._adminRepository.blockUnblockUser(user_id, userState);
  }

   async blockUnblockDoctor(doctor_id: string, doctorState: boolean): Promise<any> {
    return await this._adminRepository.blockUnblockDoctor(doctor_id, doctorState);
  }


  async doctorsKycData(): Promise<any> {
    try {
      const allDoctorsKycData =
        await this._adminRepository.getAllDoctorsKycDatas();


      return allDoctorsKycData;
    } catch (error) {
      console.error("Error fetching doctors KYC data:", error);
      throw error;
    }
  }

  async fetchKycData(doctorId: string): Promise<any> {
    try {
      let response = await this._adminRepository.fetchKycData(doctorId);
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
      const updatedKyc = await this._adminRepository.updateKycStatus(
        status,
        doctor_id,
        rejectionReason
      );


      if (status === "approved" || status === "rejected") {
        await this._adminRepository.deleteKyc(doctor_id);

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

        const email_Ht = kyTemplate(
          updatedKyc.reason,
          updatedKyc.doctorMail || "user",
          status
        );

        await sendMail("reject", updatedKyc.doctorMail, email_Ht);
      }
    } catch (error) {
      console.error("Error updating KYC status:", error);
    }
  }
  async getDashboardData() {
    try {
      return await this._adminRepository.getAllStatistics()
    } catch (error: any) {
      throw Error(error)
    }
  }

}
export default AdminService

