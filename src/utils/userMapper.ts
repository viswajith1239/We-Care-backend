import { IUserDocument } from "../../src/models/userModel";
import { UserResponseDTO, UserDTO, BookedDoctorDTO } from "../../src/dtos/user.dto";

export function mapUserToDTO(user: IUserDocument): UserResponseDTO {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };
}



export function toUserDTO(user: any): UserDTO {
  return {
    id: user._id.toString(),
    userId: user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
    dob: user.dob,
    gender: user.gender
  };
}


export function toBookedDoctorDTO(doctor: any): BookedDoctorDTO {
  return {
    id: doctor._id.toString(),
    name: doctor.name,
    profileImage: doctor.profileImage,
  };
}

