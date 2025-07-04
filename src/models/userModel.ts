import { Document, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";


interface IImage {
    url: string;
    type: string;
}

interface Iuser extends Document {
    userId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    dob: string;
    address: string;
    image: IImage; 
    createdAt: Date;
    lastLogin: Date;
    referral?: string;
    isBlocked: boolean;
    gender:string
    profileImage:String
}

const userSchema = new Schema<Iuser>({
    userId: { 
        type: String, 
        required: true,
        unique: true ,
        default: uuidv4, 

    },
    name: { 
        type: String,
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        
    },
    password: {
        type: String, 
       
    },
    createdAt: {
        type: Date, 
        default: Date.now 
    },
    lastLogin: {
        type: Date 
    },
    image:{
        type:String,
        required:false
    },
    dob: {
        type: String,
        required: false
    },
    // address: {
    //     type: String,
    //     default: null
    // },
    // image: {
        
    //         url: { type: String, default: "" }, // Optional profileUrl
    //         type: { type: String, default: "" } // Optional type
        
        
    // },
    referral: {
        type: String 
    },
    isBlocked: {
        type: Boolean, 
        default: false 
    },
    gender:{
        type:String,
        required:false
    },
    profileImage: {
         type: String, 
         default: ''
    },
});

const userModel = model<Iuser>("User", userSchema);

export default userModel;
