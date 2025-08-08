
import { DoctorDTO, DoctorProfileDTO, DoctorResponseDTO } from "../../src/dtos/doctor.dto";
import { IDoctorDocument } from "../interface/doctor/doctor_interface";

export function toDoctorDTO(doctor: any): DoctorDTO {
  return {
    id: doctor._id.toString(),
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    profileImage: doctor.profileImage,
    specializations: doctor.specializations?.map((spec: any) => ({
      _id: spec._id,
      name: spec.name,
    })) || [],
    isBlocked: doctor.isBlocked,
    kycStatus: doctor.kycStatus,
    isKycApproved: doctor.isKycApproved,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
    yearsOfExperience: doctor.yearsOfExperience,
  };
}



export function toDoctorProfileDTO(doctor: any): DoctorProfileDTO {
  return {
    id: doctor._id.toString(),
    name: doctor.name,
    email: doctor.email,
    phone: doctor.phone,
    isBlocked: doctor.isBlocked,
    kycStatus: doctor.kycStatus,
    isKycApproved: doctor.isKycApproved,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
    profileImage: doctor.profileImage,
    yearsOfExperience: doctor.yearsOfExperience,
    gender: doctor.gender,
    specializationDetails: doctor.specializationDetails || [],
  };
}


export function mapDoctorToDTO(doctor: IDoctorDocument): DoctorResponseDTO {
  return {
    id: doctor._id.toString(),
    name: doctor.name,
    email: doctor.email,
    isAdmin: doctor.isAdmin,
  };
}
