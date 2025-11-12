// استيراد مكتبة cloudinary
import { v2 as cloudinary } from 'cloudinary';
// استيراد dotenv للتأكد من تحميل متغيرات البيئة
import 'dotenv/config';

// إعداد Cloudinary باستخدام متغيرات البيئة
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * يقوم برفع ملف فيديو إلى Cloudinary.
 * @param {string} filePath - المسار المحلي لملف الفيديو.
 * @param {string} publicId - اسم فريد للملف على Cloudinary (مثل اسم المستخدم).
 * @returns {Promise<object>} كائن يحتوي على معلومات الفيديو المرفوع، بما في ذلك الرابط الآمن.
 */
async function uploadVideo(filePath, publicId) {
    try {
        console.log(`[Cloudinary] بدء رفع الملف: ${filePath}`);
        
        // استدعاء دالة الرفع من Cloudinary
        const result = await cloudinary.v2.uploader.upload(filePath, {
            resource_type: "video", // تحديد نوع المورد كـ "فيديو" (مهم جدًا)
            public_id: `tiktok_records/${publicId}_${Date.now()}`, // تنظيم الملفات في مجلد
            overwrite: true,
        });

        console.log(`[Cloudinary] تم الرفع بنجاح. الرابط: ${result.secure_url}`);
        return result;

    } catch (error) {
        console.error("[Cloudinary] حدث خطأ أثناء الرفع:", error);
        // إلقاء الخطأ للسماح للكود الذي استدعى الدالة بالتعامل معه
        throw error;
    }
}

export {
    uploadVideo
};