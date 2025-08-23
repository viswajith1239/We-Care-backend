"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationContentSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    bookingId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking" },
    read: { type: Boolean, default: false },
}, { timestamps: true });
const notificationSchema = new mongoose_1.Schema({
    receiverId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    notifications: [notificationContentSchema],
}, { timestamps: true });
notificationSchema.index({ receiverId: 1 }); // Index for fast retrieval by receiverId
const NotificationModel = (0, mongoose_1.model)("Notification", notificationSchema);
exports.default = NotificationModel;
