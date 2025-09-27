"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// const router = express.Router()
const messageController_1 = __importDefault(require("../controllers/message/messageController"));
const messageService_1 = __importDefault(require("../service/message/messageService"));
const messageRepository_1 = __importDefault(require("../repositories/message/messageRepository"));
const router = (0, express_1.Router)();
const messageRepository = new messageRepository_1.default();
const messageService = new messageService_1.default(messageRepository);
const messageController = new messageController_1.default(messageService);
router.post('/send', messageController.sendMessage.bind(messageController));
router.get('/:id/:ids', messageController.getMessages.bind(messageController));
router.delete('/:id', messageController.deleteMessage.bind(messageController));
exports.default = router;
