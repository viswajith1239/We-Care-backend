"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const kycSchema = new mongoose_1.Schema({
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: false },
    specializationId: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ISpecialization', required: false }],
    profileImage: { type: String, required: true },
    aadhaarFrontSide: { type: String, required: true },
    aadhaarBackSide: { type: String, required: true },
    certificate: { type: String, required: true },
    kycStatus: { type: String, enum: ['pending', 'approved', 'submitted', 'rejected'], default: 'pending' },
    kycSubmissionDate: { type: Date, default: Date.now },
    kycComments: { type: String, required: false },
}, { timestamps: true });
const KYCModel = (0, mongoose_1.model)("KYC", kycSchema);
exports.default = KYCModel;
