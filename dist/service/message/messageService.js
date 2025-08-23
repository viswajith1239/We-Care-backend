"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const messageRepository_1 = require("../../repositories/message/messageRepository");
const messageRepository = new messageRepository_1.MessageRepository();
class MessageService {
    async sendMessage(messageData) {
        return await messageRepository.saveMessage(messageData);
    }
    async fetchMessages(id, ids) {
        return await messageRepository.getMessages(id, ids);
    }
    async deleteMessage(messageId) {
        return await messageRepository.deleteMessage(messageId);
    }
}
exports.MessageService = MessageService;
exports.default = MessageService;
