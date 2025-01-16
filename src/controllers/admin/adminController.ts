import { Request, Response, NextFunction } from "express";
import AdminService from "../../service/admin/adminService";
import { LoginAdmin_interface } from "../../interface/admin/admin_interface";



import { jwtDecode } from "jwt-decode";

class AdminController {
  private adminService: AdminService;
  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    console.log("admin controller ethi");
    
    try {
      const { email, password }: LoginAdmin_interface = req.body;
  
      const adminResponse = await this.adminService.adminLogin({
        email,
        password,
      });
  
      // Handle invalid credentials
      if (adminResponse.status === 401) {
        return res.status(401).json({
          message: "Invalid credentials. Login failed.",
        });
      }
  
     
      res.cookie("Admin_RefreshToken", adminResponse.refreshToken, {
        httpOnly: true, 
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie("Admin_AccessToken", adminResponse.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      });
  
      return res.status(200).json({
        message: "Admin login successful",
        admin: adminResponse.admin,
      });
    } catch (error: any) {
      console.error("Admin login controller error:", error);
      next(error); 
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const allUsers = await this.adminService.getAllUsers();
      res
        .status(200)
        .json({ message: "Fetch All users successfully", users: allUsers });
    } catch (error) {
      console.log(error);
    }
  }


  async addspecialization(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("reached controller")
      const specializationData = req.body;
          
      const specializationresponse = await this.adminService.addSpecialization(specializationData)
      res.status(200).json({ message: "Specialization Added sucessfuly", specializationresponse});
      if (!specializationData) {
        res.status(400).json({ message: "Specialization name is required" });
      }
    } catch (error) {
      console.log("Error adding specialization", error);
    }
  }

  async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
      const allSpecializations = await this.adminService.getAllSpecializations();

      res.status(200).json(allSpecializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      next(error)
    }
  }

  async updatespecialisation(req: Request, res: Response, next: NextFunction){
    
    try {
     const {name,description}=req.body
       const specializationId=req.params.id
     const response= await this.adminService.updatespecialisation(name,description,specializationId)
  // const specialization={name: response?.name,description: response?.description,}
     console.log("response what",response?.name,response?.description)
     const specialization=response
     res.status(200).json({message:"updatedsuccessfully",specialization})
     
    } catch (error) {
     console.log("the error in controller",error)
    }
}

 deleteSpecialization =  async (req: Request, res: Response,next: NextFunction) => {
 

  try {
    const { id } = req.params;
    const response=await this.adminService.deleteSpecializationService(id);
    res.status(200).json({ message: 'Specialization deleted successfully' });
    return response
  } catch (error) {
    console.error('Error deleting specialization:', error);
    res.status(500).json({ message: 'Failed to delete specialization' });
  }
};

async blockUnblockUser(req: Request, res: Response, next: NextFunction){
  try{
  const user_id=req.params.user_id
  const userState=req.body.status

  const responsestatus=await this.adminService.blockUnblockUser(user_id,userState)
  console.log("response data issssss",responsestatus)
  res.status(200).json({message:"user status updated successfully",data:responsestatus?.isBlocked})
  

  }catch(error){
  console.log("Error in controller userblockunblock ",error)
  }
}


  

 


  
}

export default AdminController;