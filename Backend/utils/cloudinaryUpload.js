import { v2 as cloudinary } from "cloudinary";

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} resourceType - Type of resource (default: "image")
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadImageToCloudinary = async (filePath, resourceType = "image") => {
    try {
        const imageUpload = await cloudinary.uploader.upload(filePath, { 
            resource_type: resourceType,
            folder: "medlink_doctors"
        });
        return imageUpload.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export default uploadImageToCloudinary;
