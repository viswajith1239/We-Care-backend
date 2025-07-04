import { Request, Response, NextFunction } from "express";
import AdminService from "../../service/admin/adminService";
import { LoginAdmin_interface } from "../../interface/admin/admin_interface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import RESPONSE_MESSAGES from "../../enums/messages";



import { jwtDecode } from "jwt-decode";
import { IAdminService } from "../../interface/admin/Admin.service.interface";

class AdminController {
  private adminService: IAdminService;
  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    console.log("admin controller ethi");

    try {
      const { email, password }: LoginAdmin_interface = req.body;

      const adminResponse = await this.adminService.adminLogin(email, password);


      if (adminResponse.status === 401) {
        return res.status(HTTP_statusCode.BadRequest).json({
          message: "Invalid credentials. Login failed.",
        });
      }


      res.cookie("RefreshToken", adminResponse.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("AccessToken", adminResponse.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      return res.status(HTTP_statusCode.OK).json({
        message: RESPONSE_MESSAGES.ADMIN_LOGIN_SUCCESS,
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
        .status(HTTP_statusCode.OK)
        .json({ message: RESPONSE_MESSAGES.FETCH_ALL_USERS_SUCCESS, users: allUsers });
    } catch (error) {
      console.log(error);
    }
  }


  async addspecialization(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("reached controller")
      const specializationData = req.body;

      const specializationresponse = await this.adminService.addSpecialization(specializationData)
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_ADD_SUCCESS, specializationresponse });
      if (!specializationData) {
        res.status(HTTP_statusCode.BadRequest).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_NAME_REQUIRED });
      }
    } catch (error) {
      console.log("Error adding specialization", error);
    }
  }

  async getAllSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
      const allSpecializations = await this.adminService.getAllSpecializations();

      res.status(HTTP_statusCode.OK).json(allSpecializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      next(error)
    }
  }

  async updatespecialisation(req: Request, res: Response, next: NextFunction) {

    try {
      const { name, description } = req.body
      const specializationId = req.params.id
      const response = await this.adminService.updatespecialisation(name, description, specializationId)
      // const specialization={name: response?.name,description: response?.description,}
      //  console.log("response what",response?.name,response?.description)
      const specialization = response
      res.status(HTTP_statusCode.updated).json({ message: RESPONSE_MESSAGES.UPDATED_SUCCESS, specialization })

    } catch (error) {
      console.log("the error in controller", error)
    }
  }

  deleteSpecialization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const response = await this.adminService.deleteSpecializationService(id);
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_DELETE_SUCCESS });
      return response
    } catch (error) {
      console.error('Error deleting specialization:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_DELETE_FAILED });
    }
  };

  async blockUnblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.params.user_id
      const userState = req.body.status

      const responsestatus = await this.adminService.blockUnblockUser(user_id, userState)
      console.log("response data issssss", responsestatus)
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.USER_STATUS_UPDATE_SUCCESS, data: responsestatus?.isBlocked })


    } catch (error) {
      console.log("Error in controller userblockunblock ", error)
    }
  }


  async getAllDoctorKycDatas(req: Request, res: Response, next: NextFunction) {
    try {

      const allDoctorsKycData = await this.adminService.DoctorsKycData();
      // 

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.DOCTOR_KYC_DATA_FETCH_SUCCESS, data: allDoctorsKycData });
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      next(error)
    }
  }

  async doctorsKycData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const doctorId = req.params.doctor_id;
      const doctorKycDetails = await this.adminService.fetchKycData(doctorId);
      console.log("response check", doctorKycDetails)
      return res.json({ kycData: doctorKycDetails });


    } catch (error) {
      console.log("error in controller", error)

    }


  }

  async changeKycStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = String(req.body.status);
      const doctor_id = req.params.doctor_id;
      const rejectionReason = req.body.rejectionReason || null;

      await this.adminService.updateKycStatus(status, doctor_id, rejectionReason);

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.DOCTOR_KYC_STATUS_UPDATE_SUCCESS, status });
    } catch (error) {
      console.error('Error updating doctor status:', error);
      next(error)
    }
  }




  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminService.getDashboardData()
      res.status(HTTP_statusCode.OK).json({ data: response })
    } catch (error) {
      next(error)
    }
  }





  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      // Clear the access token and refresh token cookies
      res.clearCookie('AccessToken', { httpOnly: true, expires: new Date(0) });
      res.clearCookie('RefreshToken', { httpOnly: true, expires: new Date(0) });

      // Send success response
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.ADMIN_LOGOUT_SUCCESS });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.ADMIN_LOGOUT_FAILED });
    }
  }

}

export default AdminController;