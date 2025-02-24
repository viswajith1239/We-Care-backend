
import SpecializationModel from "../../models/specializationModel";
import {Interface_Doctor, IOtp,IAppoinment} from "../../interface/doctor/doctor_interface"
import DoctorModel from "../../models/doctorModel";
import OtpModel from "../../models/otpModel";
import KYCModel from "../../models/kycModel";
import mongoose, { Types } from "mongoose";
import AppoinmentModel from "../../models/appoinmentModel";
import moment from "moment";
import BookingModel from "../../models/bookingModel";

class DoctorRepository{
    private specializationModel = SpecializationModel;
    private doctorModel=DoctorModel
    private otpModel=OtpModel
    private kycModel = KYCModel;
    private appoinmentModel=AppoinmentModel
    private bookingModel=BookingModel
    
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
    
         
        const doctor = new this.doctorModel({
          ...doctorData,
          specializations: specializationIds, 
        });
            
          await doctor.save();
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


            async saveKyc(formData: any, documents: any): Promise<any> {
                console.log("nnnn",documents);
                
  
              try {
                let doctor = await this.doctorModel.findOne({ _id: formData.doctor_id }).select('specializations');
                if (!doctor) {
                    throw new Error("Doctor not found for the given doctor ID");
                }
          
                console.log("-----specializations:", doctor.specializations);     
              
                const kycData = {
                  doctorId: new Types.ObjectId(formData.doctor_id),
                  specializationId: doctor.specializations,
                  profileImage: documents.profileImageUrl,
                  aadhaarFrontSide: documents.aadhaarFrontSideUrl,
                  aadhaarBackSide: documents.aadhaarBackSideUrl,
                  certificate: documents.certificateUrl,
                  kycStatus: "pending",
                  kycSubmissionDate: new Date(),
                };
                  
          
                const savedKyc = await this.kycModel.create(kycData);
                console.log("KYC Data saved successfully:", savedKyc);
                return savedKyc;
              } catch (error) {
                console.error("Error in saveKyc repository:", error);
                throw new Error("Failed to save KYC data");
              }
            }


            async changeKycStatus(doctorId: string, profileImage: string | undefined): Promise<string | undefined> {
              try {
                // Update the doctors profile image and KYC status
                const doctorUpdate = await this.doctorModel.findByIdAndUpdate(
                  doctorId,
                  {
                    kycStatus: "submitted",
                    profileImage: profileImage,
                  },
                  { new: true, runValidators: true }
                );
            
                if (!doctorUpdate) {
                  throw new Error("Doctor not found");
                }
            
          
                await this.kycModel.findOneAndUpdate(
                  { doctorId: doctorId },
                  { kycStatus: "submitted" },
                  { new: true, runValidators: true }
                )
                return
              } catch (error) {
                console.error("Error changing doctor KYC status:", error);
                throw new Error("Failed to change doctor KYC status");
              }
            }
 


  async getDoctorStatus(doctorId: string) {
    console.log("gggg",doctorId)
    try {
      const doctor = await this.doctorModel.findById(doctorId).select("kycStatus")
      console.log(",,,,,,,,,,,,,,,,,,",doctor)
      

        
      if (!doctor) {
        throw new Error(`Doctor with ID ${doctor} not found`);
      }
      
      console.log("..............doctorkycstatus",doctor.kycStatus)
      

      return doctor.kycStatus;
    } catch (error) {
      console.error("Error fetching doctor KYC status:", error);
      throw new Error("Failed to fetch doctor KYC status");
    }
  }
  async createUsers(user: {
    email: string;
    name: string;
    password: string | null;
    isKycApproved?: boolean;
  }): Promise<any> {
    const users = new this.doctorModel({ ...user, isKycApproved: false });
    return await users.save();
  }

  async existingUser(email: string): Promise<Interface_Doctor | null> {
      try {
        return await this.doctorModel.findOne({ email });
      } catch (error) {
        throw error;
      }
    }


    async getSpecialization(doctorid:string){
      try {
        if(!doctorid){
          console.log("doctor id is not found")
          return
        }
        const specialisations=await this.doctorModel.findById(doctorid).populate("specializations")
        console.log("specialisation sare....",specialisations?.specializations)
        return specialisations
      } catch (error) {
        console.log("Error in Repository specialisation fetch",error)
      }
  
    }
    async createNewAppoinment(appoinmentData: IAppoinment) {
      try {
        // Find doctor
        const findDoctor = await this.doctorModel.findById(appoinmentData.doctorId);
        console.log("Checking doctor ID:", appoinmentData.doctorId);
        console.log("Doctor found:", findDoctor);
        
        if (!findDoctor) {
          throw new Error("Doctor not found");
        }
    
        // Fetch existing appointments for the same doctor and date
        const existingAppointments = await this.appoinmentModel.find({
          doctorId: appoinmentData.doctorId,
          selectedDate: appoinmentData.selectedDate, // Ensure this matches frontend
          $or: [
            { startTime: { $lt: appoinmentData.endTime }, endTime: { $gt: appoinmentData.startTime } }
          ],
        });
    
        // Conflict checking
        const hasConflict = existingAppointments.some((existingApp) => {
          const existingStartTime = moment(existingApp.startTime, "HH:mm");
          const existingEndTime = moment(existingApp.endTime, "HH:mm");
    
          const newStartTime = moment(appoinmentData.startTime, "HH:mm");
          const newEndTime = moment(appoinmentData.endTime, "HH:mm");
    
          // Check time overlap
          return newStartTime.isBefore(existingEndTime) && newEndTime.isAfter(existingStartTime);
        });
    
        if (hasConflict) {
          throw new Error("Time conflict with an existing session.");
        }
    
        // Ensure price is a number
        appoinmentData.price = Number(appoinmentData.price);
    
        // Create appointment
        const createdSessionData = await this.appoinmentModel.create(appoinmentData);
        return createdSessionData.populate("specializationId");
    
      } catch (error) {
        console.log("Error in Repository", error);
        throw error;
      }
    }
    

    async fetchAppoinmentData(doctor_id: string) {
      try {
        const appoinmentData = await this.appoinmentModel
          .find({
            doctorId: doctor_id,
          })
          .populate("specializationId")
          .sort({ createdAt: -1 });
  
        return appoinmentData;
      } catch (error) {
        throw error;
      }
    }


    async fecthBookingDetails(doctorId: string){
      try {
        
        
        const bookingDetails=await  this.bookingModel.find({doctorId}).populate("userId","name").exec()
        
        const response = bookingDetails.map((booking: any) => {
          return {
            ...booking.toObject(),  
            userName: booking.userId ? booking.userId.name : 'user not found',
          
          };
        });
        
        return bookingDetails
       
      } catch (error) {
        console.log("ërror in fetching booking dewtails",error)
      }
        }


    


}
export default DoctorRepository