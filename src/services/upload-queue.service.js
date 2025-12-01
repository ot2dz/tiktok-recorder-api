import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadVideoToDrive } from './drive.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * قائمة الملفات التي فشل رفعها
 * Structure: { filePath, username, chatId, timestamp, attempts }
 */
const failedUploadsQueue = [];

/**
 * إضافة ملف إلى قائمة الانتظار
 * @param {string} filePath - مسار الملف
 * @param {string} username - اسم المستخدم
 * @param {number} chatId - معرف المحادثة
 */
function addToFailedQueue(filePath, username, chatId) {
    // التحقق من عدم وجود نفس الملف مسبقاً
    const exists = failedUploadsQueue.find(item => item.filePath === filePath);
    if (exists) {
        console.log(`[Upload Queue] ⚠️ الملف موجود بالفعل في القائمة: ${filePath}`);
        return;
    }

    const item = {
        filePath,
        username,
        chatId,
        timestamp: Date.now(),
        attempts: 0
    };

    failedUploadsQueue.push(item);
    console.log(`[Upload Queue] ➕ تم إضافة ملف إلى قائمة الانتظار: ${path.basename(filePath)}`);
    console.log(`[Upload Queue] 📊 عدد الملفات في الانتظار: ${failedUploadsQueue.length}`);
}

/**
 * الحصول على جميع الملفات في قائمة الانتظار
 * @returns {Array} قائمة الملفات الفاشلة
 */
function getFailedQueue() {
    return failedUploadsQueue;
}

/**
 * إعادة محاولة رفع جميع الملفات في القائمة
 * @param {Object} bot - نسخة البوت
 * @returns {Promise<Object>} نتائج عملية إعادة الرفع
 */
async function retryAllFailedUploads(bot) {
    if (failedUploadsQueue.length === 0) {
        return { success: 0, failed: 0, message: 'لا توجد ملفات في قائمة الانتظار' };
    }

    console.log(`[Upload Queue] 🔄 بدء إعادة رفع ${failedUploadsQueue.length} ملف...`);

    const results = {
        success: 0,
        failed: 0,
        details: []
    };

    // نسخ القائمة لتجنب مشاكل التعديل أثناء التكرار
    const itemsToRetry = [...failedUploadsQueue];

    for (const item of itemsToRetry) {
        // التحقق من وجود الملف
        if (!fs.existsSync(item.filePath)) {
            console.log(`[Upload Queue] ❌ الملف غير موجود: ${item.filePath}`);
            removeFromQueue(item.filePath);
            results.failed++;
            results.details.push({
                file: path.basename(item.filePath),
                status: 'failed',
                reason: 'الملف غير موجود'
            });
            continue;
        }

        item.attempts++;

        try {
            // إرسال إشعار للمستخدم
            await bot.telegram.sendMessage(
                item.chatId,
                `🔄 إعادة محاولة رفع الملف: ${path.basename(item.filePath)}\n` +
                `📊 المحاولة رقم: ${item.attempts}`
            );

            // محاولة الرفع
            const driveResult = await uploadVideoToDrive(item.filePath, item.username);

            // نجح الرفع
            console.log(`[Upload Queue] ✅ تم رفع الملف بنجاح: ${path.basename(item.filePath)}`);
            
            await bot.telegram.sendMessage(
                item.chatId,
                `✅ تم رفع الفيديو بنجاح بعد إعادة المحاولة!\n\n` +
                `📁 اسم الملف: ${driveResult.name}\n` +
                `📊 الحجم: ${(driveResult.size / 1024 / 1024).toFixed(2)} MB\n\n` +
                `🔗 رابط المشاهدة والتحميل:\n${driveResult.directLink}`
            );

            // حذف الملف المحلي بعد نجاح الرفع
            try {
                fs.unlinkSync(item.filePath);
                console.log(`[Upload Queue] 🗑️ تم حذف الملف المحلي: ${path.basename(item.filePath)}`);
            } catch (deleteError) {
                console.error(`[Upload Queue] ⚠️ فشل حذف الملف: ${deleteError.message}`);
            }

            // إزالة من القائمة
            removeFromQueue(item.filePath);
            results.success++;
            results.details.push({
                file: path.basename(item.filePath),
                status: 'success',
                link: driveResult.directLink
            });

        } catch (error) {
            console.error(`[Upload Queue] ❌ فشل رفع الملف: ${path.basename(item.filePath)}`, error.message);
            
            await bot.telegram.sendMessage(
                item.chatId,
                `❌ فشل رفع الملف: ${path.basename(item.filePath)}\n` +
                `السبب: ${error.message}\n` +
                `📊 المحاولة: ${item.attempts}`
            );

            results.failed++;
            results.details.push({
                file: path.basename(item.filePath),
                status: 'failed',
                reason: error.message
            });

            // إذا تجاوز عدد المحاولات 3، نقوم بإشعار المستخدم
            if (item.attempts >= 3) {
                await bot.telegram.sendMessage(
                    item.chatId,
                    `⚠️ تم تجاوز الحد الأقصى للمحاولات (3) للملف: ${path.basename(item.filePath)}\n` +
                    `الملف محفوظ في: ${item.filePath}`
                );
            }
        }
    }

    console.log(`[Upload Queue] 📊 نتائج إعادة الرفع: نجح ${results.success} | فشل ${results.failed}`);
    return results;
}

/**
 * إزالة ملف من قائمة الانتظار
 * @param {string} filePath - مسار الملف
 */
function removeFromQueue(filePath) {
    const index = failedUploadsQueue.findIndex(item => item.filePath === filePath);
    if (index !== -1) {
        failedUploadsQueue.splice(index, 1);
        console.log(`[Upload Queue] ➖ تم إزالة ملف من القائمة: ${path.basename(filePath)}`);
    }
}

/**
 * مسح جميع الملفات من القائمة
 */
function clearQueue() {
    const count = failedUploadsQueue.length;
    failedUploadsQueue.length = 0;
    console.log(`[Upload Queue] 🧹 تم مسح ${count} ملف من القائمة`);
}

/**
 * الحصول على حجم القائمة
 * @returns {number} عدد الملفات في الانتظار
 */
function getQueueSize() {
    return failedUploadsQueue.length;
}

export {
    addToFailedQueue,
    getFailedQueue,
    retryAllFailedUploads,
    removeFromQueue,
    clearQueue,
    getQueueSize
};
