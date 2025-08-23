
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

export interface DoctorResponseDTO {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}


export interface PaginatedDoctorResponse {
  doctors: DoctorResponseDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDoctors: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

