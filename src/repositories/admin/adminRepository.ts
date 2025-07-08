import mongoose from "mongoose";
import AdminModel from "../../models/adminModel";
import { LoginAdmin_interface } from "../../interface/admin/admin_interface";
import SpecializationModel from "../../models/specializationModel";
import userModel from "../../models/userModel";
import KYCModel from "../../models/kycModel";
import DoctorModel from "../../models/doctorModel";
import KycRejectionReasonModel from "../../models/KycRejectionReason";
import BookingModel from "../../models/bookingModel";
import ContactModel from "../../models/contactModel";
import { IAdminRepository } from "../../interface/admin/Admin.repository.interface";
import { IUser } from "../../interface/common";
import { MonthlyStats } from "../../interface/admin/admin_interface";
import BaseRepository from "../base/baseRepository";
type IUserDocument = IUser & Document;

class AdminRepository extends BaseRepository<any>  implements IAdminRepository{


private _adminModel = AdminModel;
private _specializationModel=SpecializationModel;
private _userModel=userModel;
private _kycModel = KYCModel
private _doctorModel=DoctorModel
private _kycRejectionReasonModel = KycRejectionReasonModel
private _bookingModel=BookingModel
private _contactModel=ContactModel

constructor() {
      super(AdminModel);  
    }

async findAdmin(email:string):Promise<LoginAdmin_interface|null>{
    console.log("admin repo find ethi");
    return await this._adminModel.findOne({ email });
 
}
async createAdmin(email:string,password:string):Promise<LoginAdmin_interface|null>{
console.log("admin repo create");

   try{
    console.log("creatil ethi");

    let data={email,password}
    
    const newAdmin = new this._adminModel(data);
    return await newAdmin.save()
   }catch(error){
    console.log("create admin",error);
    throw error
   }
}


async fetchAllUsers(): Promise<IUserDocument[] | undefined> {
  return await this._userModel.find().lean<IUserDocument[]>(); 
}
async getallcontact():Promise<any>{
  const contact= await this._contactModel.find()
  console.log("reppoo",contact);
  
  return contact
}

async saveSpecialization({name,description}:{name:string,description:string}){
    
    try{
   return await this._specializationModel.create({name,description})
}catch(error:any){
   console.error("Error in admin repository:", error);
 throw error
}
}

async getAllSpecializations() {
    return await this._specializationModel.find().sort({ createdAt: -1 }) 
  }
  async saveupdatespecialization(name:string,description:string,specializationId:string){
    try{

    const updatedSpecialization=await this._specializationModel.findByIdAndUpdate(specializationId,{name,description},{new:true})
    return updatedSpecialization
    }catch(error){
        console.log(error)

    }

  }
  

  deleteSpecializationRepository = async (id: string): Promise<void> => {
  const result = await this. _specializationModel.findByIdAndDelete(id);
  if (!result) {
    throw new Error(`Specialization with id ${id} not found`);
  }
};
deletesubmission = async (id: string): Promise<void> => {
  const result = await this. _contactModel.findByIdAndDelete(id);
  if (!result) {
    throw new Error(`contact with id ${id} not found`);
  }
};

async blockUnblockUser(user_id: string, userState: boolean): Promise<IUser> {
  const updatedUser = await this._userModel.findByIdAndUpdate(
      user_id,  
      { isBlocked: userState },
      { new: true }
  ).lean<IUser>();

  if (!updatedUser) {
      throw new Error("User not found"); 
  }

  return updatedUser;
}


async getAllDoctorsKycDatas() {
  return await this._doctorModel.aggregate([
    {
      $lookup: {
        from: this._kycModel.collection.name, 
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
      const kycData=await this._kycModel.findOne({doctorId}).populate("specializationId").populate("doctorId")
      console.log("final reached///////",kycData)
      return kycData
  } catch (error) {
      console.error('Error fetching KYC data:', error);

      
  }



}

async updateKycStatus(status: string, doctor_id: string, rejectionReason: string | null): Promise<any> {
  try {
    console.log('update kyc status repo', rejectionReason);
    
    const updatedDoctor = await this._doctorModel.findByIdAndUpdate(
      doctor_id,
      { kycStatus: status },
      { new: true, runValidators: true }
    );

    if (updatedDoctor) {
      console.log('Doctor KYC status updated successfully:', updatedDoctor);

      const updatedKyc = await this._kycModel.findOneAndUpdate(
        { doctorId: doctor_id },
        { kycStatus: status },
        { new: true, runValidators: true }
      );

      if (updatedKyc) {
        console.log('KYC model status updated successfully:', updatedKyc);

       
        if (status === 'rejected' && rejectionReason) {
         const reason =  await this._kycRejectionReasonModel.create({
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
      console.log('Doctor not found with the given ID:', doctor_id);
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
    
    const result = await this._kycModel.findOneAndDelete({ doctorId: doctor_id });
    if (result) {
      console.log('KYC record deleted successfully:', result);
    } else {
      console.log('No KYC record found for deletion with doctor ID:', doctor_id);
    }
  } catch (error) {
    console.error('Error deleting KYC record:', error);
  }
}


async getAllStatistics(){
  const totalDoctors=await this._doctorModel.countDocuments()
  const activeDoctors = await this._doctorModel.countDocuments({ isBlocked: false });
  const totalUsers = await this._userModel.countDocuments();
  const activeUsers = await this._userModel.countDocuments({ isBlocked: false });
  const totalBookings=await this._bookingModel.countDocuments()
  const revenueData=await this._bookingModel.aggregate([
    {$match:{paymentStatus:"Confirmed"}},
    {
      $group:{
         _id:null,amount:{$sum:"$amount"},
         doctorRevenue:{$sum:{$multiply:["$amount",0.9]}},
         adminRevenue: { $sum: { $multiply: ["$amount", 0.1] } }

      }
    }
  ])

  const amount = revenueData.length > 0 ? revenueData[0].amount : 0;
  const doctorRevenue = revenueData.length > 0 ? revenueData[0].doctorRevenue : 0;
  const adminRevenue = revenueData.length > 0 ? revenueData[0].adminRevenue : 0;
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setMonth(currentDate.getMonth()-12)//past month

  const userAndDoctorRegistartionData=await Promise.all([
    this._userModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),

    this._doctorModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ])
  const monthlyStatistics: { [key: string]: MonthlyStats } = {};
  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const monthDate = new Date();
    monthDate.setMonth(currentDate.getMonth() - monthOffset);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1; 
    const key = `${year}-${month < 10 ? '0' : ''}${month}`;

    monthlyStatistics[key] = {
      users: 0,
      doctor: 0,
      revenue: 0,
      amount: 0,
      doctorRevenue: 0,
      adminRevenue: 0
    };
  }

  userAndDoctorRegistartionData[0].forEach(userData => {
    const key = `${userData._id.year}-${userData._id.month < 10 ? '0' : ''}${userData._id.month}`;
    if (monthlyStatistics[key]) {
      monthlyStatistics[key].users = userData.count;
    }
  });

  userAndDoctorRegistartionData[1].forEach(doctorData => {
    const key = `${doctorData._id.year}-${doctorData._id.month < 10 ? '0' : ''}${doctorData._id.month}`;
    if (monthlyStatistics[key]) {
      monthlyStatistics[key].doctor = doctorData.count;
    }
  });
  const revenueByMonth = await BookingModel.aggregate([
    { $match: { paymentStatus: "Confirmed", bookingDate: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: "$bookingDate" },
          month: { $month: "$bookingDate" }
        },
        amount: { $sum: "$amount" },
        doctorRevenue: { $sum: { $multiply: ["$amount", 0.9] } },
        adminRevenue: { $sum: { $multiply: ["$amount", 0.1] } }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  
  revenueByMonth.forEach(revenueData => {
    const key = `${revenueData._id.year}-${revenueData._id.month < 10 ? '0' : ''}${revenueData._id.month}`;
    if (monthlyStatistics[key]) {
      monthlyStatistics[key].revenue = revenueData.amount;
      monthlyStatistics[key].amount = revenueData.amount;
      monthlyStatistics[key].doctorRevenue = revenueData.doctorRevenue;
      monthlyStatistics[key].adminRevenue = revenueData.adminRevenue;
    }
});
const userDoctorChartData = Object.keys(monthlyStatistics).map(key => {
  const [year, month] = key.split('-');
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    users: monthlyStatistics[key].users,
    doctor: monthlyStatistics[key].doctor,
    revenue: monthlyStatistics[key].revenue,
    amount: monthlyStatistics[key].amount,
    doctorRevenue: monthlyStatistics[key].doctorRevenue,
    adminRevenue: monthlyStatistics[key].adminRevenue
  };
});
  return{
    totalDoctors,
    activeDoctors,
    totalUsers,
    activeUsers,
    doctorRevenue,
    adminRevenue,
    totalRevenue:amount,
    userDoctorChartData,
    totalBookings
  }
}

}


export default AdminRepository