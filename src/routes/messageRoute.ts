import express from "express";
const router=express.Router()
import MessageController from "../controllers/message/messageController"
const messagecontroller =new MessageController()


router.post('/send',  messagecontroller.sendMessage)
router.get('/:id/:ids', messagecontroller.getMessages)

export default router