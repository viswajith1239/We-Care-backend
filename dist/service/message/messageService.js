"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
// import { MessageRepository } from "../../repositories/message/messageRepository";
// const messageRepository = new MessageRepository();
class MessageService {
    constructor(messageRepository) {
        this._messageRepository = messageRepository;
    }
    async sendMessage(messageData) {
        return await this._messageRepository.saveMessage(messageData);
    }
    async fetchMessages(id, ids, limit, sort) {
        return await this._messageRepository.getMessages(id, ids, limit, sort);
    }
    async deleteMessage(messageId) {
        return await this._messageRepository.deleteMessage(messageId);
    }
}
exports.MessageService = MessageService;
exports.default = MessageService;
