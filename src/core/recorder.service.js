import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { convertFlvToMp4 } from '../utils/video.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Records a live stream from TikTok and saves it as an MP4 file
 * @param {string} streamUrl - The FLV stream URL
 * @param {string} username - TikTok username (used for file naming)
 * @param {AbortSignal} signal - Signal to cancel the recording
 * @returns {Promise<string>} Path to the final MP4 file
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
            signal,
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            let isCleanedUp = false;

            const cleanup = () => {
                if (isCleanedUp) return;
                isCleanedUp = true;

                writer.removeListener('finish', onFinish);
                writer.removeListener('error', onError);
                signal.removeEventListener('abort', onAbort);
            };

            const onFinish = async () => {
                cleanup();
                console.log(`[Recorder] انتهى التسجيل. حجم الملف المؤقت: ${(writer.bytesWritten / 1024 / 1024).toFixed(2)} MB`);
                try {
                    const finalMp4Path = await convertFlvToMp4(tempFilePath);
                    resolve(finalMp4Path);
                } catch (conversionError) {
                    console.error('[Recorder] Error during conversion:', conversionError);
                    // Clean up temp file on conversion failure
                    if (fs.existsSync(tempFilePath)) {
                        try {
                            fs.unlinkSync(tempFilePath);
                        } catch (unlinkErr) {
                            console.error('[Recorder] Failed to clean up temp file:', unlinkErr);
                        }
                    }
                    reject(conversionError);
                }
            };
            
            const onError = (err) => {
                cleanup();
                console.error('[Recorder] حدث خطأ أثناء كتابة الملف:', err);
                if (fs.existsSync(tempFilePath)) {
                    try {
                        fs.unlinkSync(tempFilePath);
                    } catch (unlinkErr) {
                        console.error('[Recorder] Failed to clean up temp file:', unlinkErr);
                    }
                }
                reject(err);
            };

            const onAbort = () => {
                console.log(`[Recorder] تم طلب إيقاف التسجيل للمستخدم: ${username}`);
                writer.end();
                response.data.destroy();
            };

            signal.addEventListener('abort', onAbort);
            writer.on('finish', onFinish);
            writer.on('error', onError);
        });
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('[Recorder] تم إلغاء طلب التحميل بنجاح.');
            // Only convert if file has content
            if (fs.existsSync(tempFilePath) && fs.statSync(tempFilePath).size > 0) {
                return convertFlvToMp4(tempFilePath);
            }
            throw new Error('Recording was cancelled before any data was received.');
        }
        writer.close();
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (unlinkErr) {
                console.error('[Recorder] Failed to clean up temp file:', unlinkErr);
            }
        }
        throw new Error('فشل الاتصال برابط البث.');
    }
}

export { recordLiveStream };