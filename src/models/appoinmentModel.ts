// import {Schema,model} from "mongoose"
// import { IAppoinment } from "../interface/doctor/doctor_interface"

// const appoinmentSchema=new Schema<IAppoinment>({
//     doctorId: { type: Schema.Types.ObjectId, ref: "Doctor",},
//     specializationId: { type: Schema.Types.ObjectId, ref: "Specialization" },
//     // startDate: { type: Date },
//     // endDate: { type: Date },
//     selectedDate: { type: Date },
//     startTime: { type: String, },
//     endTime: { type: String, },
//     // type: { type: String },
//     price: { type: Number, required: false },
//     isBooked: { type: Boolean, default: false },
//     status: {
//         type: String,
//         enum: ["Pending", "Confirmed", "Completed", "Cancelled", "InProgress"],
//         default: "Pending",
        
//     },
//     paymentIntentId: { type: String, required: false },

// },{ timestamps: true })

// const AppoinmentModel=model<IAppoinment>("Appoinment",appoinmentSchema)

// export default AppoinmentModel;



import { Schema, model } from "mongoose";
import { IAppoinment } from "../interface/doctor/doctor_interface";

const appoinmentSchema = new Schema<IAppoinment>({
    doctorId: { 
        type: Schema.Types.ObjectId, 
        ref: "Doctor", 
        required: true 
    },
    specializationId: { 
        type: Schema.Types.ObjectId, 
        ref: "ISpecialization" 
    },
    selectedDate: { 
        type: Date, 
        required: true 
    },
    startTime: { 
        type: String, 
        required: true 
    },
    endTime: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    isBooked: { 
        type: Boolean, 
        default: false 
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled", "InProgress"],
        default: "Pending"
    },
    paymentIntentId: { 
        type: String, 
        required: false 
    },
    // New fields for recurring appointments
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrenceType: {
        type: String,
        enum: ["None", "Daily", "Weekly", "Monthly"],
        default: "None"
    },
    recurrenceInterval: {
        type: Number,
        default: 1,
        min: 1
    },
    recurrenceEnd: {
        type: Date,
        required: function() {
            return this.isRecurring === true;
        }
    },
    daysOfWeek: [{
        type: Number,
        min: 0,
        max: 6
    }]
}, { 
    timestamps: true 
});

// Add an index to improve query performance for conflict checking
appoinmentSchema.index({ 
    doctorId: 1, 
    selectedDate: 1, 
    startTime: 1, 
    endTime: 1 
});

const AppoinmentModel = model<IAppoinment>("Appoinment", appoinmentSchema);

export default AppoinmentModel;