import {Schema,model} from "mongoose"
import { IAppoinment } from "../interface/doctor/doctor_interface"

const appoinmentSchema=new Schema<IAppoinment>({
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor",},
    specializationId: { type: Schema.Types.ObjectId, ref: "Specialization" },
    // startDate: { type: Date },
    // endDate: { type: Date },
    selectedDate: { type: Date },
    startTime: { type: String, },
    endTime: { type: String, },
    // type: { type: String },
    price: { type: Number, required: false },
    isBooked: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled", "InProgress"],
        default: "Pending",
        
    },
    paymentIntentId: { type: String, required: false },

},{ timestamps: true })

const AppoinmentModel=model<IAppoinment>("Appoinment",appoinmentSchema)

export default AppoinmentModel;