"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToDTO = mapUserToDTO;
exports.toUserDTO = toUserDTO;
exports.toBookedDoctorDTO = toBookedDoctorDTO;
function mapUserToDTO(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
    };
}
function toUserDTO(user) {
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
function toBookedDoctorDTO(doctor) {
    return {
        id: doctor._id.toString(),
        name: doctor.name,
        profileImage: doctor.profileImage,
    };
}
