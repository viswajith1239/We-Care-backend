import { Schema, model } from "mongoose"
import { ISpecialization } from "../interface/admin/admin_interface";

const specializationSchema = new Schema<ISpecialization>({

  name: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, },
  isListed: { type: Boolean, default: true },
});
const specializationModel = model<ISpecialization>("ISpecialization", specializationSchema)
export default specializationModel