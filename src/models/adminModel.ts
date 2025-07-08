import { Schema,model } from "mongoose";
import { LoginAdmin_interface } from "../../src/interface/admin/admin_interface";

const adminSchema=new Schema<LoginAdmin_interface>({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    
}, { timestamps: true})

const AdminModel = model("Admin", adminSchema);
export default AdminModel;