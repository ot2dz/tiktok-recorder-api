// استيراد مكتبات التعامل مع المسارات والملفات
const fs = require('fs');
const path = require('path');

// استيراد مكتبة FFmpeg
const ffmpeg = require('fluent-ffmpeg');
// تحديد مسار FFmpeg الثابت الذي قمنا بتثبيته
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * يحول ملف فيديو من صيغة FLV إلى MP4.
 * @param {string} flvFilePath - المسار الكامل لملف FLV المدخل.
 * @returns {Promise<string>} المسار الكامل لملف MP4 الناتج.
 */
function convertFlvToMp4(flvFilePath) {
    // نغلف العملية داخل Promise للتعامل معها بشكل غير متزامن
    return new Promise((resolve, reject) => {
        // تحديد مسار واسم الملف الناتج (نفس الاسم ولكن بصيغة mp4)
        const outputFilePath = flvFilePath.replace('.flv', '.mp4');

        console.log(`[FFmpeg] بدء تحويل الملف: ${path.basename(flvFilePath)}`);

        ffmpeg(flvFilePath)
            // استخدام 'copy' codec لنسخ مسارات الفيديو والصوت بدون إعادة ترميز
            // هذا يجعل العملية سريعة جدًا ويحافظ على الجودة الأصلية
            .videoCodec('copy')
            .audioCodec('copy')
            
            // عند انتهاء التحويل بنجاح
            .on('end', () => {
                console.log(`[FFmpeg] انتهى التحويل بنجاح: ${path.basename(outputFilePath)}`);
                // حذف ملف FLV الأصلي لتوفير المساحة
                fs.unlink(flvFilePath, (err) => {
                    if (err) console.error(`[FS] لم يتمكن من حذف الملف المؤقت ${flvFilePath}:`, err);
                });
                // إرجاع مسار الملف النهائي
                resolve(outputFilePath);
            })
            // عند حدوث خطأ أثناء التحويل
            .on('error', (err) => {
                console.error('[FFmpeg] حدث خطأ أثناء التحويل:', err);
                reject(err);
            })
            // حفظ الملف الناتج
            .save(outputFilePath);
    });
}

module.exports = {
    convertFlvToMp4
};