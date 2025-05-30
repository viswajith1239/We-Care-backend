
// import { IMessage } from "../interface/IMessage";
import { IMessage } from "../../interface/common";
import MessageModel from "../../models/messageModel"

export class MessageRepository {
  async saveMessage(data: IMessage) {
    console.log("reposs ethi");
    
    return await new MessageModel(data).save();
  }

  async getMessages(senderId: string, receiverId: string) {
    try {
      return await MessageModel.find({
        $or: [
          { senderId, receiverId }, // Messages sent by senderId to receiverId
          { senderId: receiverId, receiverId: senderId }, // Messages sent by receiverId to senderId
        ],
      }).sort({ createdAt: 1 });
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Could not fetch messages");
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const result = await MessageModel.findByIdAndDelete(messageId); // Use findByIdAndDelete to remove the message
      return result; // Returns the deleted document or null if not found
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Could not delete message");
    }
  }
  
}
