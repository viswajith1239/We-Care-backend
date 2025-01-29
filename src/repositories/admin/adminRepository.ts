import mongoose from "mongoose";
import AdminModel from "../../models/adminModel";
import { LoginAdmin_interface } from "../../interface/admin/admin_interface";
import SpecializationModel from "../../models/specializationModel";
import userModel from "../../models/userModel";
import KYCModel from "../../models/kycModel";
import DoctorModel from "../../models/doctorModel";
import KycRejectionReasonModel from "../../models/KycRejectionReason";


class AdminRepository{


private adminModel = AdminModel;
private specializationModel=SpecializationModel;
private userModel=userModel;
private kycModel = KYCModel
private doctorModel=DoctorModel
private kycRejectionReasonModel = KycRejectionReasonModel

async findAdmin(email:string):Promise<LoginAdmin_interface|null>{
    console.log("admin repo find ethi");
    return await AdminModel.findOne({ email });
 
}
async createAdmin(email:string,password:string):Promise<LoginAdmin_interface|null>{
console.log("admin repo create");

   try{
    console.log("creatil ethi");

    let data={email,password}
    
    const newAdmin = new AdminModel(data);
    return await newAdmin.save()
   }catch(error){
    console.log("create admin",error);
    throw error
   }
}


async fetchAllUsers(){
  return await this.userModel.find()

}
async saveSpecialization({name,description}:{name:string,description:string}){
    
    try{
   return await this.specializationModel.create({name,description})
}catch(error:any){
   console.error("Error in admin repository:", error);
 throw error
}
}

async getAllSpecializations() {
    return await this.specializationModel.find()
  }
  async saveupdatespecialization(name:string,description:string,specializationId:string){
    try{

    const updatedSpecialization=await this.specializationModel.findByIdAndUpdate(specializationId,{name,description},{new:true})
    return updatedSpecialization
    }catch(error){
        console.log(error)

    }

  }
  

  deleteSpecializationRepository = async (id: string): Promise<void> => {
  const result = await this. specializationModel.findByIdAndDelete(id);
  if (!result) {
    throw new Error(`Specialization with id ${id} not found`);
  }
};

async blockUnblockUser(user_id:string,userState:boolean){
    
  return await this.userModel.findByIdAndUpdate({_id:user_id},{isBlocked:userState},{new:true})

}

async getAllDoctorsKycDatas() {
  return await this.doctorModel.aggregate([
    {
      $lookup: {
        from: this.kycModel.collection.name, 
        localField: '_id', 
        foreignField: 'doctorId', 
        as: 'kycData', 
      },
    },
    {
      $unwind: {
        path: '$kycData', 
        // preserveNullAndEmptyArrays: true, 
      },
    },
    {
      $project: {
        _id: 1,
        name: 1, 
        email: 1, 
        kycData: 1,
      },
    },
  ]);
}


async fetchKycData(doctorId:string){
  console.log("here alsoo")
  try {
      const kycData=await this.kycModel.findOne({doctorId}).populate("specializationId").populate("doctorId")
      console.log("final reached///////",kycData)
      return kycData
  } catch (error) {
      console.error('Error fetching KYC data:', error);

      
  }



}

async updateKycStatus(status: string, doctor_id: string, rejectionReason: string | null): Promise<any> {
  try {
    console.log('update kyc status repo', rejectionReason);
    
    const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
      doctor_id,
      { kycStatus: status },
      { new: true, runValidators: true }
    );

    if (updatedDoctor) {
      console.log('Trainer KYC status updated successfully:', updatedDoctor);

      const updatedKyc = await this.kycModel.findOneAndUpdate(
        { doctorId: doctor_id },
        { kycStatus: status },
        { new: true, runValidators: true }
      );

      if (updatedKyc) {
        console.log('KYC model status updated successfully:', updatedKyc);

        // Save the rejection reason if the status is 'rejected'
        if (status === 'rejected' && rejectionReason) {
         const reason =  await this.kycRejectionReasonModel.create({
          doctorId: doctor_id,
            reason: rejectionReason,
          });
          console.log('Rejection reason saved successfully.');
          const response = {
            doctorMail : updatedDoctor.email,
            reason: reason.reason
          }
          return response
        } 

        if(status === 'approved') {
          console.log('approve hit with',updatedDoctor.email);

          
          
          if(updatedDoctor.email) {
            return updatedDoctor.email
          }
        }
        

      } else {
        console.log('KYC record not found for the given doctor ID:', doctor_id);
        return null;
      }
    } else {
      console.log('Trainer not found with the given ID:', doctor_id);
      return null;
    }
  } catch (error) {
    console.error('Error updating KYC status:', error);
    throw error;
  }
}

async deleteKyc(doctor_id: string) {
  try {
    console.log('-------------------------->',doctor_id);
    
    const result = await this.kycModel.findOneAndDelete({ doctorId: doctor_id });
    if (result) {
      console.log('KYC record deleted successfully:', result);
    } else {
      console.log('No KYC record found for deletion with trainer ID:', doctor_id);
    }
  } catch (error) {
    console.error('Error deleting KYC record:', error);
  }
}

}


export default AdminRepository