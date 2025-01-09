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
    DOB: Date;
    address: string;
    image: IImage; // Updated type for image
    createdAt: Date;
    lastLogin: Date;
    referral?: string;
    isBlocked: boolean;
}

const userSchema = new Schema<Iuser>({
    userId: { 
        type: String, 
        required: true,
        unique: true ,
        default: uuidv4, // Automatically generate a unique ID

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
    // DOB: {
    //     type: Date,
    //     default: null
    // },
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
});

const userModel = model<Iuser>("User", userSchema);

export default userModel;
