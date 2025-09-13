import { IMessage } from "./messageInterface";

export interface IMessageService {
  sendMessage(data: {
    senderId: string;
    receiverId: string;
    message?: string;
    imageUrl?: string;
  }): Promise<IMessage>;

  fetchMessages(senderId: string, receiverId: string): Promise<IMessage[]>;

  deleteMessage(messageId: string): Promise<IMessage|null>;
}