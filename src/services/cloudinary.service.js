import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadVideo(filePath, publicId) {
    try {
        console.log(`[Cloudinary] بدء رفع الملف: ${filePath}`);
        
        // ---  هذا هو السطر الذي تم تصحيحه ---
        // استدعاء دالة الرفع مباشرة من المتغير 'cloudinary' لأنه هو نفسه الكائن 'v2'
        const result = await cloudinary.uploader.upload(filePath, { 
            resource_type: "video",
            public_id: `tiktok_records/${publicId}_${Date.now()}`,
            overwrite: true,
        });
        // ------------------------------------

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