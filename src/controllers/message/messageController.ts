import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';

import MessageService from "../../service/message/messageService";

const messageService = new MessageService();



export class MessageController {
  async sendMessage(req: Request, res: Response): Promise<any> {
    try {
      const { senderId, receiverId, message,mediaUrl } = req.body;
      console.log("uuu",receiverId);
      console.log("Media URL received:", mediaUrl);

      if (!receiverId || receiverId.length !== 24) {
        return res.status(400).json({ success: false, message: "Invalid receiverId" });
      }

      // Assuming messageService.sendMessage exists
      const newMessage = await messageService.sendMessage({ senderId, receiverId,message,imageUrl:mediaUrl});

      res.status(201).json({ success: true, message: "Message sent!", data: newMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }


  async getMessages(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {ids}=req.params

      console.log(")))))))))",ids)
      const messages = await messageService.fetchMessages(id,ids);
      console.log("lll",messages);
      
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

}



export default MessageController;