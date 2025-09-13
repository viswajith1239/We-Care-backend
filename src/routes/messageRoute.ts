import { Router } from "express";
// const router = express.Router()
import MessageController from "../controllers/message/messageController"
import MessageService from "../service/message/messageService";
import MessageRepository from "../repositories/message/messageRepository"
const router = Router();

// dependency injection
const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);


router.post('/send', messageController.sendMessage.bind(MessageController))
router.get('/:id/:ids', messageController.getMessages.bind(MessageController))
router.delete('/:id', messageController.deleteMessage.bind(MessageController))


export default router