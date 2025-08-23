"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PrescriptionSchema = new mongoose_1.Schema({
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking', required: true },
    prescriptions: [
        {
            medicineName: { type: String, required: true },
            dosage: { type: String, required: true },
            frequency: { type: String, required: true },
            duration: { type: String, required: true },
            instruction: { type: String, required: true },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});
const PrescriptionModel = (0, mongoose_1.model)('Prescription', PrescriptionSchema);
exports.default = PrescriptionModel;
