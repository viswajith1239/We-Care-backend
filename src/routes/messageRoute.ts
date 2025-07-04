import express from "express";
const router=express.Router()
import MessageController from "../controllers/message/messageController"
const messagecontroller =new MessageController()


router.post('/send',  messagecontroller.sendMessage)
router.get('/:id/:ids', messagecontroller.getMessages)
router.delete('/:id',messagecontroller.deleteMessage)


export default router