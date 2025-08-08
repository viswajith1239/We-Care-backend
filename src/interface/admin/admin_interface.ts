import mongoose from "mongoose";
export interface LoginAdmin_interface {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  email: string;
  password: string;

}

export interface ISpecialization extends Document {
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  isListed: boolean;
}


export interface ISpecializationPaginationResponse {
  specializations: ISpecialization[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MonthlyStats {
  users: number;
  doctor: number;
  revenue: number;
  amount: number;
  doctorRevenue: number;
  adminRevenue: number;
}