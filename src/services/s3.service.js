import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * خدمة التعامل مع Cloudflare R2 (S3-compatible)
 * للرفع والحذف المؤقت للفيديوهات قبل نقلها إلى Google Drive
 */

// إعداد S3 Client للـ Cloudflare R2
const s3Client = new S3Client({
    region: 'auto', // Cloudflare R2 يستخدم 'auto'
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'tiktok-videos-temp';

/**
 * رفع فيديو إلى Cloudflare R2
 * @param {string} filePath - المسار الكامل للملف المحلي
 * @param {string} username - اسم مستخدم TikTok
 * @returns {Promise<Object>} معلومات الملف المرفوع (url, key, size)
 */
export async function uploadVideoToS3(filePath, username) {
    try {
        const fileName = path.basename(filePath);
        const fileStream = fs.createReadStream(filePath);
        const fileStats = fs.statSync(filePath);
        
        console.log(`[S3] 📤 بدء رفع: ${fileName}`);
        console.log(`[S3] 📊 حجم الملف: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);

        // مسار الملف في S3: tiktok-videos/username/filename.mp4
        const s3Key = `tiktok-videos/${username}/${fileName}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileStream,
            ContentType: 'video/mp4',
            Metadata: {
                'uploaded-by': 'tiktok-recorder-bot',
                'username': username,
                'upload-date': new Date().toISOString()
            }
        };

        // رفع الملف
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // بناء الـ URL العام
        const s3Url = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${s3Key}`;
        
        console.log(`[S3] ✅ تم الرفع بنجاح!`);
        console.log(`[S3] 🔗 URL: ${s3Url}`);
        
        // حذف الملف المحلي لتوفير المساحة
        try {
            fs.unlinkSync(filePath);
            console.log(`[S3] 🗑️ تم حذف الملف المحلي: ${fileName}`);
        } catch (deleteError) {
            console.warn(`[S3] ⚠️ تحذير: فشل حذف الملف المحلي: ${deleteError.message}`);
        }
        
        return {
            url: s3Url,
            key: s3Key,
            size: fileStats.size,
            filename: fileName
        };
        
    } catch (error) {
        console.error('[S3] ❌ فشل رفع الفيديو إلى S3:', error.message);
        throw new Error(`فشل رفع الفيديو إلى S3: ${error.message}`);
    }
}

/**
 * حذف فيديو من Cloudflare R2
 * @param {string} s3Key - مفتاح الملف في S3
 */
export async function deleteVideoFromS3(s3Key) {
    try {
        console.log(`[S3] 🗑️ جاري حذف الملف: ${s3Key}`);
        
        await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key
        }));
        
        console.log(`[S3] ✅ تم حذف الملف من S3 بنجاح`);
        
    } catch (error) {
        console.error(`[S3] ⚠️ فشل حذف الملف: ${error.message}`);
        // لا نرمي خطأ هنا - الحذف ليس حرجاً (Lifecycle سيحذفه لاحقاً)
    }
}

/**
 * اختبار الاتصال بـ S3
 * @returns {Promise<boolean>} true إذا نجح الاتصال
 */
export async function testS3Connection() {
    try {
        console.log('[S3] 🔍 اختبار الاتصال بـ Cloudflare R2...');
        
        // محاولة رفع ملف اختبار صغير
        const testKey = 'test/connection-test.txt';
        const testContent = `Test connection at ${new Date().toISOString()}`;
        
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain'
        }));
        
        console.log('[S3] ✅ الاتصال ناجح!');
        
        // حذف ملف الاختبار
        await deleteVideoFromS3(testKey);
        
        return true;
        
    } catch (error) {
        console.error('[S3] ❌ فشل الاتصال:', error.message);
        return false;
    }
}
