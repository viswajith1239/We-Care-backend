"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageService_1 = __importDefault(require("../../service/message/messageService"));
const messageService = new messageService_1.default();
class MessageController {
    async sendMessage(req, res) {
        try {
            const { senderId, receiverId, message, mediaUrl, read } = req.body;
            if (!receiverId || receiverId.length !== 24) {
                return res.status(400).json({ success: false, message: "Invalid receiverId" });
            }
            const newMessage = await messageService.sendMessage({ senderId, receiverId, message, imageUrl: mediaUrl });
            res.status(201).json({ success: true, message: "Message sent!", data: newMessage });
        }
        catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
    async getMessages(req, res) {
        try {
            const { id } = req.params;
            const { ids } = req.params;
            const messages = await messageService.fetchMessages(id, ids);
            res.status(200).json(messages);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "Invalid message ID" });
            }
            const result = await messageService.deleteMessage(id);
            if (!result) {
                return res.status(404).json({ success: false, message: "Message not found" });
            }
            res.status(200).json({ success: true, message: "Message deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
}
exports.MessageController = MessageController;
exports.default = MessageController;
