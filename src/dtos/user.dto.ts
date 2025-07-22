export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface PaginatedUserResponse {
  users: UserResponseDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}




export interface UserDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  isBlocked: boolean;
  createdAt: string;
  dob: string;
  gender: string;
}



export interface BookedDoctorDTO {
  id: string;
  name: string;
  profileImage: string;
}

