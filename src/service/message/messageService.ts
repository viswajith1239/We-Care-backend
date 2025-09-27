
import { IMessage } from "../../interface/common";
import { IMessageRepository } from "../../interface/message/message.repository.interface";
import { IMessageService } from "../../interface/message/message.service.interface";
// import { MessageRepository } from "../../repositories/message/messageRepository";


// const messageRepository = new MessageRepository();


export class MessageService implements IMessageService {

   private _messageRepository: IMessageRepository;

   constructor(messageRepository: IMessageRepository) {
      this._messageRepository = messageRepository;
    }
  async sendMessage(messageData: IMessage) {

    return await this._messageRepository.saveMessage(messageData);

  }

  async fetchMessages(id: string, ids: string,limit?:number,sort?:string) {
    return await this. _messageRepository.getMessages(id, ids,limit,sort);
  }

  async deleteMessage(messageId: string) {
    return await this._messageRepository.deleteMessage(messageId);
  }
}
export default MessageService  
