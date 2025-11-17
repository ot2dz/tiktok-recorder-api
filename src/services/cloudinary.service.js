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
        
        // upload_large يحتاج Promise wrapper لأنه يستخدم callback
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(
                filePath,
                {
                    resource_type: "video",
                    public_id: `tiktok_records/${publicId}_${Date.now()}`,
                    chunk_size: 20000000, // 20 MB لكل جزء
                    timeout: 600000, // 10 دقائق timeout
                    overwrite: true,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });

        console.log(`[Cloudinary] ✅ تم الرفع بنجاح. الرابط: ${result.secure_url}`);
        console.log(`[Cloudinary] 🆔 معرف الملف: ${result.public_id}`);
        console.log(`[Cloudinary] 📊 الحجم: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
        console.log(`[Cloudinary] ⏱️ المدة: ${result.duration ? result.duration.toFixed(2) + 's' : 'N/A'}`);
        return result;

    } catch (error) {
        console.error("[Cloudinary] ❌ حدث خطأ أثناء الرفع:", error);
        throw error;
    }
}

export {
    uploadVideo
};