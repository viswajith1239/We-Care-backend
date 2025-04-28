
import { IMessage } from "../../interface/common";
import { MessageRepository } from "../../repositories/message/messageRepository";


const messageRepository = new MessageRepository();


export class MessageService {
    async sendMessage(messageData: IMessage) {
      console.log("sss enthi");
      return await messageRepository.saveMessage(messageData);
      
    }
  
    async fetchMessages(id:string,ids:string) {
      return await messageRepository.getMessages(id,ids);
    }
  }
export default MessageService  
