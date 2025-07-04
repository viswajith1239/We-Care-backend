import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl:{type:String,required:false},
    message: { type: String, required: false },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },

  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
export default Message;