"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageModel_1 = __importDefault(require("../../models/messageModel"));
const baseRepository_1 = __importDefault(require("../base/baseRepository"));
class MessageRepository extends baseRepository_1.default {
    constructor() {
        super(messageModel_1.default);
    }
    async saveMessage(data) {
        const saved = await new messageModel_1.default(data).save();
        return saved.toObject();
    }
    async getMessages(senderId, receiverId, limit, sort) {
        try {
            let query = messageModel_1.default.find({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            });
            if (sort === 'desc') {
                query = query.sort({ createdAt: -1 });
            }
            else {
                query = query.sort({ createdAt: 1 });
            }
            if (limit) {
                query = query.limit(limit);
            }
            return await query.lean();
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            throw new Error("Could not fetch messages");
        }
    }
    async deleteMessage(messageId) {
        try {
            const result = await messageModel_1.default.findByIdAndDelete(messageId).lean();
            return result;
        }
        catch (error) {
            console.error("Error deleting message:", error);
            throw new Error("Could not delete message");
        }
    }
}
exports.default = MessageRepository;
