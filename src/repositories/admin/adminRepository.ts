import mongoose from "mongoose";
import AdminModel from "../../models/adminModel";
import { LoginAdmin_interface } from "../../interface/admin/admin_interface";
import SpecializationModel from "../../models/specializationModel";
import userModel from "../../models/userModel";


class AdminRepository{


private adminModel = AdminModel;
private specializationModel=SpecializationModel;
private userModel=userModel;

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

}


export default AdminRepository