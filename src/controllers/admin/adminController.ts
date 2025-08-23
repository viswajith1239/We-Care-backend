import { Request, Response, NextFunction } from "express";
import AdminService from "../../service/admin/adminService";
import { LoginAdmin_interface } from "../../interface/admin/admin_interface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import RESPONSE_MESSAGES from "../../enums/messages";



import { jwtDecode } from "jwt-decode";
import { IAdminService } from "../../interface/admin/Admin.service.interface";

class AdminController {
  private _adminService: IAdminService;
  constructor(adminService: IAdminService) {
    this._adminService = adminService;
  }

  async adminLogin(req: Request, res: Response, next: NextFunction): Promise<any> {


    try {


      const { email, password }: LoginAdmin_interface = req.body;

      const adminResponse = await this._adminService.adminLogin(email, password);



      if (adminResponse.status === 401) {
        return res.status(HTTP_statusCode.BadRequest).json({
          message: "Invalid credentials. Login failed.",
        });
      }


      res.cookie("RefreshToken", adminResponse.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });
      res.cookie("AccessToken", adminResponse.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string || '';
      const allUsers = await this._adminService.getAllUsers(page, limit,search);


      res
        .status(HTTP_statusCode.OK)
        .json({ message: RESPONSE_MESSAGES.FETCH_ALL_USERS_SUCCESS, users: allUsers });
    } catch (error) {
      console.log(error);
    }
  }
  async getAllDoctors(req: Request, res: Response, next: NextFunction) {
    try {

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
       const search = req.query.search as string || '';
      const allDoctors = await this._adminService.getAllDoctors(page, limit,search);


      res
        .status(HTTP_statusCode.OK)
        .json({ message: RESPONSE_MESSAGES.FETCH_ALL_USERS_SUCCESS, doctors: allDoctors });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllContact(req: Request, res: Response, Next: NextFunction) {
    try {
      const response = await this._adminService.getAllContact()

      res.status(HTTP_statusCode.OK).json({ response: response })
    } catch (error) {

    }
  }


  async addSpecialization(req: Request, res: Response, next: NextFunction) {
    try {
      const specializationData = req.body;

      const specializationresponse = await this._adminService.addSpecialization(specializationData)
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const allSpecializations = await this._adminService.getAllSpecializations(page, limit);

      res.status(HTTP_statusCode.OK).json(allSpecializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      next(error)
    }
  }

  async updateSpecialisation(req: Request, res: Response, next: NextFunction) {

    try {
      const { name, description } = req.body
      const specializationId = req.params.id
      const response = await this._adminService.updateSpecialisation(name, description, specializationId)
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
      const response = await this._adminService.deleteSpecializationService(id);
      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_DELETE_SUCCESS });
      return response
    } catch (error) {
      console.error('Error deleting specialization:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.SPECIALIZATION_DELETE_FAILED });
    }
  };

  deleteSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {


      const { id } = req.params;
      const response = await this._adminService.deleteSubmission(id);
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



      const responsestatus = await this._adminService.blockUnblockUser(user_id, userState)

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.USER_STATUS_UPDATE_SUCCESS, data: responsestatus?.isBlocked })


    } catch (error) {
      console.log("Error in controller userblockunblock ", error)
    }
  }

  async blockUnblockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor_id = req.params.doctor_id
      const doctorState = req.body.status



      const responsestatus = await this._adminService.blockUnblockDoctor(doctor_id, doctorState)

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.USER_STATUS_UPDATE_SUCCESS, data: responsestatus?.isBlocked })


    } catch (error) {
      console.log("Error in controller userblockunblock ", error)
    }
  }


  async getAllDoctorKycDatas(req: Request, res: Response, next: NextFunction) {
    try {

      const allDoctorsKycData = await this._adminService.doctorsKycData();


      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.DOCTOR_KYC_DATA_FETCH_SUCCESS, data: allDoctorsKycData });
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      next(error)
    }
  }

  async doctorsKycData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const doctorId = req.params.doctor_id;
      const doctorKycDetails = await this._adminService.fetchKycData(doctorId);
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

      await this._adminService.updateKycStatus(status, doctor_id, rejectionReason);

      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.DOCTOR_KYC_STATUS_UPDATE_SUCCESS, status });
    } catch (error) {
      console.error('Error updating doctor status:', error);
      next(error)
    }
  }




  async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this._adminService.getDashboardData()
      res.status(HTTP_statusCode.OK).json({ data: response })
    } catch (error) {
      next(error)
    }
  }





  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {



      res.clearCookie('AccessToken', { httpOnly: true, expires: new Date(0) });
      res.clearCookie('RefreshToken', { httpOnly: true, expires: new Date(0) });


      res.status(HTTP_statusCode.OK).json({ message: RESPONSE_MESSAGES.ADMIN_LOGOUT_SUCCESS });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.ADMIN_LOGOUT_FAILED });
    }
  }

}

export default AdminController;