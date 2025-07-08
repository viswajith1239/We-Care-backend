import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, {
  timestamps: true
});
 const ContactModel = mongoose.model('Contact', contactSchema);
 export default ContactModel