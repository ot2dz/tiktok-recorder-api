import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { convertFlvToMp4 } from '../utils/video.util.js';
import { getDownloadsPath } from '../utils/path.util.js';

async function recordLiveStream(streamUrl, username, signal) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const outputDir = getDownloadsPath();
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
            signal,
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
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
                console.error('[Recorder] حدث خطأ أثناء كتابة الملف:', err);
                reject(err);
            };

            signal.addEventListener('abort', () => {
                console.log(`[Recorder] تم طلب إيقاف التسجيل للمستخدم: ${username}`);
                writer.end();
                response.data.destroy();
            });

            writer.on('finish', onFinish);
            writer.on('error', onError);
        });
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('[Recorder] تم إلغاء طلب التحميل بنجاح.');
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