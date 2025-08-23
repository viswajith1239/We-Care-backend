"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModel = void 0;
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    transactionType: { type: String, enum: ['credit', 'debit'], required: true },
    bookingId: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});
const walletSchema = new mongoose_1.Schema({
    doctorId: { type: String, },
    userId: { type: String },
    balance: { type: Number, required: true, default: 0 },
    transactions: [transactionSchema],
}, { timestamps: true });
exports.WalletModel = (0, mongoose_1.model)('Wallet', walletSchema);
exports.default = exports.WalletModel;
