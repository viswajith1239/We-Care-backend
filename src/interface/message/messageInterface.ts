export interface IMessage {
  senderId: string;
  receiverId: string;
  imageUrl?: string;
  message: string;
  createdAt?: Date;
}