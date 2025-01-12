 import AdminRepository from "../../repositories/admin/adminRepository"

import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

class AdminService{
    private adminRepository: AdminRepository;

  constructor(adminRepository: AdminRepository) {

    this.adminRepository = adminRepository;
  }
  async adminLogin({
    
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
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
}
export default AdminService
  
    