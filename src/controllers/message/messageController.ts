import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';

import MessageService from "../../service/message/messageService";

const messageService = new MessageService();



export class MessageController {
  async sendMessage(req: Request, res: Response): Promise<any> {
    try {
      const { senderId, receiverId, message, mediaUrl, read } = req.body;




      if (!receiverId || receiverId.length !== 24) {
        return res.status(400).json({ success: false, message: "Invalid receiverId" });
      }



      const newMessage = await messageService.sendMessage({ senderId, receiverId, message, imageUrl: mediaUrl });



      res.status(201).json({ success: true, message: "Message sent!", data: newMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }


  async getMessages(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { ids } = req.params


      const messages = await messageService.fetchMessages(id, ids);


      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }



  async deleteMessage(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid message ID" });
      }


      const result = await messageService.deleteMessage(id);

      if (!result) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }

      res.status(200).json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }


}



export default MessageController;