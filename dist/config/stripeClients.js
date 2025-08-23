"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripeSecretKey = process.env.REACT_STRIPE_SECRET_KEY;
const stripeClient = new stripe_1.default(stripeSecretKey, {
    apiVersion: '2022-11-15',
});
exports.default = stripeClient;
