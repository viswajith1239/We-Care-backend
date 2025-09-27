import { IMessage } from "./messageInterface";

export interface IMessageService {
  sendMessage(data: {
    senderId: string;
    receiverId: string;
    message?: string;
    imageUrl?: string;
  }): Promise<IMessage>;

  fetchMessages(id: string, ids: string, limit?: number, sort?: string): Promise<IMessage[]>;

  deleteMessage(messageId: string): Promise<IMessage|null>;
}