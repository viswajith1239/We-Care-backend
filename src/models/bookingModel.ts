import mongoose, { Schema,model } from "mongoose";
import { IBooking } from "../interface/userInterface/interface";
const bookingSchema=new Schema<IBooking>({
    appoinmentId:{type:Schema.Types.ObjectId, ref:"Session",required:false},
    doctorId:{type:Schema.Types.ObjectId,ref:"Doctor"},
    userId:{type:Schema.Types.ObjectId,ref:"User"},
    specialization: { type: String, required: false },
   
    bookingDate: { type: Date, default: Date.now }, 
    startDate: { type: Date, required: true }, 
    // endDate: { type: Date, required: false }, 
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: [ "Confirmed", "Cancelled", "Completed"], default: "Confirmed" }, 
    payment_intent: {type: String, required: false },
    

},{ timestamps: true })
const BookingModel =model<IBooking>("Booking",bookingSchema)
export default BookingModel;