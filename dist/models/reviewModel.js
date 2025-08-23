"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor' },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });
const ReviewModel = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = ReviewModel;
