"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDoctorDTO = toDoctorDTO;
exports.toDoctorProfileDTO = toDoctorProfileDTO;
exports.mapDoctorToDTO = mapDoctorToDTO;
function toDoctorDTO(doctor) {
    return {
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        profileImage: doctor.profileImage,
        specializations: doctor.specializations?.map((spec) => ({
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
function toDoctorProfileDTO(doctor) {
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
function mapDoctorToDTO(doctor) {
    return {
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        isAdmin: doctor.isAdmin,
    };
}
