"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ConnectDB = async () => {
    try {
        console.log('Aloooooooooo');
        console.log(process.env.MONGO_URL);
        // await mongoose.connect(process.env.MONGO_URL as string );
        await mongoose_1.default.connect(process.env.MONGO_URL, {
            retryWrites: true,
            w: "majority",
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            tls: true,
            //   minTLSVersion: "TLSv1.2",  // Force TLS 1.2+
            tlsAllowInvalidCertificates: true, // For testing only; remove in production
        });
        console.log("Database connected successfully");
    }
    catch (error) {
        console.log('Error area');
        console.log(process.env.MONGO_URL);
        console.log("Database  disconnected");
        console.log('Error', error);
    }
};
exports.default = ConnectDB;
