import { Router } from "express";
// const router = express.Router()
import MessageController from "../controllers/message/messageController"
import MessageService from "../service/message/messageService";
import MessageRepository from "../repositories/message/messageRepository"
const router = Router();


const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);


router.post('/send', messageController.sendMessage.bind(messageController))
router.get('/:id/:ids', messageController.getMessages.bind(messageController))
router.delete('/:id', messageController.deleteMessage.bind(messageController))


export default router