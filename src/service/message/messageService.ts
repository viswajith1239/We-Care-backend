
import { IMessage } from "../../interface/common";
import { MessageRepository } from "../../repositories/message/messageRepository";


const messageRepository = new MessageRepository();


export class MessageService {
  async sendMessage(messageData: IMessage) {

    return await messageRepository.saveMessage(messageData);

  }

  async fetchMessages(id: string, ids: string) {
    return await messageRepository.getMessages(id, ids);
  }

  async deleteMessage(messageId: string) {
    return await messageRepository.deleteMessage(messageId);
  }
}
export default MessageService  
