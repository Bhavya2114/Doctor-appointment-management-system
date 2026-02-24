import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = () => {
    if (!process.env.CLOUDINARY_NAME) {
        throw new Error("CLOUDINARY_NAME not set");
    }
    
    cloudinary.config({
        
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    });

}

export default connectCloudinary;