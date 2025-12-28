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
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'Referer': 'https://www.tiktok.com/',
        };

        if (process.env.TIKTOK_COOKIE) {
            headers['Cookie'] = process.env.TIKTOK_COOKIE;
        }

        const response = await axios({
            method: 'get',
            url: streamUrl,
            responseType: 'stream',
            headers,
            signal,
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            // --- مراقبة نشاط البث (Watchdog) ---
            let lastDataTime = Date.now();
            const WATCHDOG_INTERVAL = 10000; // فحص كل 10 ثواني
            const INACTIVITY_TIMEOUT = 30000; // اعتبار البث متوقف بعد 30 ثانية من الصمت

            const watchdogTimer = setInterval(() => {
                const timeSinceLastData = Date.now() - lastDataTime;
                if (timeSinceLastData > INACTIVITY_TIMEOUT) {
                    console.warn(`[Recorder] ⚠️ لم يتم استلام بيانات منذ ${timeSinceLastData / 1000} ثانية. إنهاء التسجيل قسرياً.`);
                    clearInterval(watchdogTimer);
                    response.data.destroy(); // قطع الاتصال
                    writer.end(); // إنهاء الملف
                }
            }, WATCHDOG_INTERVAL);

            response.data.on('data', () => {
                lastDataTime = Date.now();
            });

            const onFinish = async () => {
                clearInterval(watchdogTimer); // إيقاف المؤقت
                console.log(`[Recorder] انتهى التسجيل. حجم الملف المؤقت: ${(writer.bytesWritten / 1024 / 1024).toFixed(2)} MB`);
                try {
                    const finalMp4Path = await convertFlvToMp4(tempFilePath);
                    resolve(finalMp4Path);
                } catch (conversionError) {
                    reject(conversionError);
                }
            };

            const onError = (err) => {
                clearInterval(watchdogTimer);
                console.error('[Recorder] حدث خطأ أثناء كتابة الملف:', err);
                reject(err);
            };

            signal.addEventListener('abort', () => {
                clearInterval(watchdogTimer);
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

        // تفاصيل الخطأ
        if (error.response) {
            console.error(`[Recorder] خطأ من الخادم: ${error.response.status} - ${error.response.statusText}`);
            console.error('[Recorder] Headers:', error.response.headers);
        } else if (error.request) {
            console.error('[Recorder] لم يتم استلام رد من الخادم.');
        } else {
            console.error('[Recorder] خطأ في إعداد الطلب:', error.message);
        }

        throw new Error(`فشل الاتصال برابط البث: ${error.message}`);
    }
}

export { recordLiveStream };