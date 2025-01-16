
import SpecializationModel from "../../models/specializationModel";
import {Interface_Doctor, IOtp} from "../../interface/doctor/doctor_interface"
import DoctorModel from "../../models/doctorModel";
import OtpModel from "../../models/otpModel";
import mongoose, { Types } from "mongoose";

class DoctorRepository{
    private specializationModel = SpecializationModel;
    private doctorModel=DoctorModel
    private otpModel=OtpModel
    
    async findAllSpecializations() {
        try {
          return await this.specializationModel.find({});
        } catch (error) {
          console.error("Error fetching specializations:", error);
          throw error;
        }
      }

      async existsDoctor(doctorData: Interface_Doctor) {
        try {
          let email = doctorData.email;
      
          return await this.doctorModel.findOne({ email });
        } catch (error) {
          console.log("error ", error);
          throw error;
        }
      }

      async saveOtp(email: string, OTP: string, OTPExpirey: Date) {
        try {
          const saveotp = await new this.otpModel({
            email,
            otp: OTP,
            expiresAt: OTPExpirey,
          });
          await saveotp.save();
        } catch (error) {
          console.log("Error in Saving The Otp", error);
          throw error;
        }
      }

      async getOtpByEmail(email: string): Promise<IOtp[] | []> {
       
        try {
          return await this.otpModel.find({ email });
        } catch (error) {
          console.error("error in otp getting:", error);
          throw error;
        }
      }
      async createNewUser(doctorData: Interface_Doctor): Promise<void> {
        try {
          console.log("doctor data have reached in repository",doctorData)
          const userexisted = await this.existsDoctor(doctorData);
          if (userexisted) {
            throw new Error("Email already exists");
          }
    
          let specializationIds: Types.ObjectId[] = [];
          console.log("Specializations before processing:", doctorData.specializations);
    
        if (doctorData.specializations && doctorData.specializations.length > 0) {
        
          specializationIds = await Promise.all(
            doctorData.specializations.map(async (specName: any) => {
              const specialization = await SpecializationModel.findOne({ name: specName });
              if (!specialization) {
                throw new Error(`Specialization '${specName}' not found`);
              }
              return specialization._id;
            })
          );
        }
    
         
        const trainer = new this.doctorModel({
          ...doctorData,
          specializations: specializationIds, 
        });
            
          await trainer.save();
        } catch (error) {
          console.log("Error in creating user", error);
          throw error;
        }
      }


          async deleteOtpById(otpId?: mongoose.Types.ObjectId): Promise<void> {
              try {
                if (!otpId) {
                  throw new Error("OTP ID is undefined");
                }
                await this.otpModel.findByIdAndDelete(otpId.toString());
                console.log(`OTP with ID ${otpId} deleted successfully.`);
              } catch (error) {
                console.error("Error in deleting OTP:", error);
                throw error;
              }
            }


            async findDoctor(email: string): Promise<Interface_Doctor | null> {
              try {
                return await this.doctorModel.findOne({ email });
              } catch (error) {
                console.log("error finding user login:", error);
                return null;
              }
            }
    


}
export default DoctorRepository