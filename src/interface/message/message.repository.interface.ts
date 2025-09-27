import { IMessage } from "./messageInterface";

export interface IMessageRepository {
  saveMessage(data: IMessage): Promise<IMessage>;

   getMessages(senderId: string, receiverId: string, limit?: number, sort?: string): Promise<IMessage[]>;

  deleteMessage(messageId: string): Promise<IMessage|null>;
}