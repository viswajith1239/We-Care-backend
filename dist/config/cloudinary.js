"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.default = cloudinary_1.v2;
const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        }).end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const extractPublicId = (url) => {
    const parts = url.split("/");
    // Find the index of the version string (starts with 'v')
    const versionIndex = parts.findIndex((part) => part.startsWith("v"));
    if (versionIndex === -1 || versionIndex + 1 >= parts.length) {
        throw new Error("Invalid Cloudinary URL. Cannot extract public_id.");
    }
    // Get the public ID with extension
    const publicIdWithExtension = parts.slice(versionIndex + 1).join("/");
    // Remove the extension from the public ID
    return publicIdWithExtension.split(".").slice(0, -1).join(".");
};
const deleteFromCloudinary = async (imageUrl) => {
    try {
        const publicId = extractPublicId(imageUrl);
        if (!publicId) {
            throw new Error("Invalid image URL. Cannot extract public_id.");
        }
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        if (result.result === "ok") {
            console.log("Image deleted successfully");
            return { success: true, message: "Image deleted successfully" };
        }
        else {
            console.warn("Image not found or already deleted:", result.result);
            return { success: false, message: "Image not found or already deleted" };
        }
    }
    catch (error) {
        console.error("Delete Image Error:", error);
        return { success: false, message: `Failed to delete image: ${error.message}` };
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
