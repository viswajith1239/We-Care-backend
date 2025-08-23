"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const doctorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, },
    password: { type: String, },
    specializations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ISpecialization' }],
    isBlocked: { type: Boolean, default: false },
    profileImage: { type: String, required: false },
    kycStatus: { type: String, enum: ["pending", "approved", "submitted", "rejected"], default: "pending" },
    isKycApproved: { type: Boolean, default: false },
    gender: { type: String, enum: ['male', 'female', 'other', ''], required: false },
    yearsOfExperience: { type: Number, required: false },
    language: { type: String, required: false },
    about: { type: String, required: false },
}, { timestamps: true, collection: 'doctors' });
const DoctorModel = (0, mongoose_1.model)('Doctor', doctorSchema);
exports.default = DoctorModel;
