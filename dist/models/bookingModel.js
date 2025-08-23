"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    appoinmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Session", required: false },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Doctor" },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    specialization: { type: String, required: false },
    bookingDate: { type: Date, },
    startDate: { type: Date, required: true },
    // endDate: { type: Date, required: false }, 
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["Confirmed", "Cancelled", "Completed"], default: "Confirmed" },
    payment_intent: { type: String, required: false },
}, { timestamps: true });
const BookingModel = (0, mongoose_1.model)("Booking", bookingSchema);
exports.default = BookingModel;
