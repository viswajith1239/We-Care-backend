// dto/doctor.dto.ts
export interface DoctorDTO {
  id: string;
  name: string;
  email: string;
  phone: number;
  profileImage: string;
  specializations: { _id: string; name: string }[];
  isBlocked: boolean;
  kycStatus: string;
  isKycApproved: boolean;
  createdAt: string;
  updatedAt: string;
  yearsOfExperience: number;

}


// dto/doctor.dto.ts
export interface DoctorProfileDTO {
  id: string;
  name: string;
  email: string;
  phone: number;
  specializationDetails: { _id: string; name: string }[];
  isBlocked: boolean;
  kycStatus: string;
  isKycApproved: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage: string;
  yearsOfExperience: number;
  gender: string;
}

