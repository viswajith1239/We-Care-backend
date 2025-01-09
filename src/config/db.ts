import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const ConnectDB = async () => {
    try {
        // console.log(process.env.MONGO_URL)
        await mongoose.connect(process.env.MONGO_URL as string );
        console.log("Database connected successfully");
        
    } catch (error) {
        console.log("Database  disconnected");
        
    }
}


export default ConnectDB;