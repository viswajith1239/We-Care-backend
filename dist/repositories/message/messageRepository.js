"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const messageModel_1 = __importDefault(require("../../models/messageModel"));
class MessageRepository {
    async saveMessage(data) {
        return await new messageModel_1.default(data).save();
    }
    async getMessages(senderId, receiverId) {
        try {
            return await messageModel_1.default.find({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            }).sort({ createdAt: 1 });
        }
        catch (error) {
            console.error("Error fetching messages:", error);
            throw new Error("Could not fetch messages");
        }
    }
    async deleteMessage(messageId) {
        try {
            const result = await messageModel_1.default.findByIdAndDelete(messageId);
            return result;
        }
        catch (error) {
            console.error("Error deleting message:", error);
            throw new Error("Could not delete message");
        }
    }
}
exports.MessageRepository = MessageRepository;
