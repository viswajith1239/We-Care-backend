"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const specializationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    image: { type: String, },
    isListed: { type: Boolean, default: true },
});
const specializationModel = (0, mongoose_1.model)("ISpecialization", specializationSchema);
exports.default = specializationModel;
