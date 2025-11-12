// استيراد مكتبات التعامل مع الملفات والمسارات
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { convertFlvToMp4 } from '../utils/video.util.js';

/**
 * يقوم بتسجيل بث مباشر من تيك توك وحفظه كملف MP4.
 * @param {string} streamUrl - رابط بث FLV المباشر.
 * @param {string} username - اسم المستخدم (لتسمية الملف).
 * @param {AbortSignal} signal - إشارة لإلغاء عملية التحميل.
 * @returns {Promise<string>} المسار الكامل لملف MP4 المسجل بعد التحويل.
 */
async function recordLiveStream(streamUrl, username, signal) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const outputDir = path.join(__dirname, '..', '..', 'downloads');
    const tempFilePath = path.join(outputDir, `${username}_${timestamp}.flv`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const writer = fs.createWriteStream(tempFilePath);
    console.log(`[Recorder] بدء تسجيل المستخدم: ${username}...`);
    console.log(`[Recorder] سيتم حفظ الملف في: ${tempFilePath}`);

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            responseType: 'stream',
            signal, // تمرير إشارة الإلغاء إلى axios
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            const cleanup = () => {
                 // التأكد من إزالة المستمعين لتجنب تسريب الذاكرة
                writer.removeListener('finish', onFinish);
                writer.removeListener('error', onError);
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            };
            
            const onFinish = async () => {
                console.log(`[Recorder] انتهى التسجيل. حجم الملف المؤقت: ${(writer.bytesWritten / 1024 / 1024).toFixed(2)} MB`);
                try {
                    const finalMp4Path = await convertFlvToMp4(tempFilePath);
                    resolve(finalMp4Path);
                } catch (conversionError) {
                    reject(conversionError);
                }
            };
            
            const onError = (err) => {
                cleanup();
                console.error('[Recorder] حدث خطأ أثناء كتابة الملف:', err);
                reject(err);
            };

            signal.addEventListener('abort', () => {
                console.log(`[Recorder] تم طلب إيقاف التسجيل للمستخدم: ${username}`);
                writer.end(); // إنهاء الكتابة في الملف
                response.data.destroy(); // إيقاف تحميل البيانات
                // لا نرفض البروميس هنا، بل نتركه ينتهي بشكل طبيعي عبر 'finish'
            });

            writer.on('finish', onFinish);
            writer.on('error', onError);
        });
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('[Recorder] تم إلغاء طلب التحميل بنجاح.');
            // إذا كان الإلغاء ناجحًا، يجب أن نحول ما تم تحميله
             return convertFlvToMp4(tempFilePath);
        }
        writer.close();
         if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        throw new Error('فشل الاتصال برابط البث.');
    }
}

export { recordLiveStream };