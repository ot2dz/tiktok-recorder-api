import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.warn(`[Cloudinary] Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('[Cloudinary] Video upload functionality will not work without proper configuration.');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a video file to Cloudinary
 * @param {string} filePath - Path to the video file
 * @param {string} publicId - Public ID for the video
 * @returns {Promise<object>} Upload result from Cloudinary
 */
async function uploadVideo(filePath, publicId) {
    // Check configuration before attempting upload
    if (missingVars.length > 0) {
        throw new Error(`Cannot upload video: Missing Cloudinary configuration (${missingVars.join(', ')})`);
    }

    try {
        console.log(`[Cloudinary] بدء رفع الملف: ${filePath}`);
        
        const result = await cloudinary.uploader.upload(filePath, { 
            resource_type: "video",
            public_id: `tiktok_records/${publicId}_${Date.now()}`,
            overwrite: true,
        });

        console.log(`[Cloudinary] تم الرفع بنجاح. الرابط: ${result.secure_url}`);
        return result;

    } catch (error) {
        console.error("[Cloudinary] حدث خطأ أثناء الرفع:", error);
        throw error;
    }
}

export {
    uploadVideo
};