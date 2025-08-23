"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const uuid_1 = require("uuid");
const userSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        default: uuid_1.v4,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    image: {
        type: String,
        required: false
    },
    dob: {
        type: String,
        required: false
    },
    // address: {
    //     type: String,
    //     default: null
    // },
    // image: {
    //         url: { type: String, default: "" }, // Optional profileUrl
    //         type: { type: String, default: "" } // Optional type
    // },
    referral: {
        type: String
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        default: ''
    },
});
const userModel = (0, mongoose_1.model)("User", userSchema);
exports.default = userModel;
