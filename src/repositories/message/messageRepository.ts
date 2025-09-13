
// import { IMessage } from "../interface/IMessage";
import { IMessage } from "../../interface/message/messageInterface";
import { IMessageRepository } from "../../interface/message/message.repository.interface";
import MessageModel from "../../models/messageModel"
import BaseRepository from "../base/baseRepository";
import exp from "constants";

 class MessageRepository extends BaseRepository<any> implements IMessageRepository {

  constructor() {
    super(MessageModel); 
  }
  async saveMessage(data: IMessage) {


   const saved = await new MessageModel(data).save();

    return saved.toObject<IMessage>(); 
  }

  async getMessages(senderId: string, receiverId: string) {
    try {
      return await MessageModel.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      }).sort({ createdAt: 1 })  .lean<IMessage[]>(); ;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Could not fetch messages");
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const result = await MessageModel.findByIdAndDelete(messageId).lean<IMessage>();
      return result;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Could not delete message");
    }
  }

}
export default MessageRepository
