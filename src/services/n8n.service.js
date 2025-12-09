import axios from 'axios';
import 'dotenv/config';

/**
 * خدمة التواصل مع n8n
 * لإرسال إشعارات لرفع الفيديوهات من S3 إلى Google Drive
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * إرسال إشعار لـ n8n لرفع فيديو من S3 إلى Google Drive
 * @param {Object} s3Data - معلومات الملف في S3
 * @param {string} s3Data.url - رابط الفيديو في S3
 * @param {string} s3Data.key - مفتاح الملف في S3
 * @param {string} s3Data.filename - اسم الملف
 * @param {number} s3Data.size - حجم الملف بالبايت
 * @param {string} username - اسم مستخدم TikTok
 * @param {number} chatId - معرف المحادثة في Telegram
 * @returns {Promise<Object>} استجابة n8n
 */
export async function notifyN8nToUpload(s3Data, username, chatId) {
    try {
        if (!N8N_WEBHOOK_URL) {
            throw new Error('N8N_WEBHOOK_URL غير محدد في Environment Variables');
        }

        console.log('[N8N] 📨 إرسال إشعار إلى n8n...');
        console.log(`[N8N] 📦 الملف: ${s3Data.filename}`);
        
        const payload = {
            s3Url: s3Data.url,
            s3Key: s3Data.key,
            filename: s3Data.filename,
            fileSize: s3Data.size,
            username: username,
            chatId: chatId,
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            timestamp: new Date().toISOString()
        };

        const response = await axios.post(N8N_WEBHOOK_URL, payload, {
            timeout: 10000, // 10 ثواني
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'TikTok-Recorder-Bot/1.0'
            }
        });
        
        console.log('[N8N] ✅ تم إرسال الإشعار بنجاح');
        console.log(`[N8N] 📊 حالة الاستجابة: ${response.status}`);
        
        return {
            success: true,
            status: response.status,
            data: response.data
        };
        
    } catch (error) {
        console.error('[N8N] ❌ فشل إرسال الإشعار إلى n8n:', error.message);
        
        // لا نرمي خطأ - الفيديو محفوظ في S3 على أي حال
        // يمكن إعادة المحاولة لاحقاً
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * اختبار الاتصال بـ n8n webhook
 * @returns {Promise<boolean>} true إذا نجح الاتصال
 */
export async function testN8nConnection() {
    try {
        if (!N8N_WEBHOOK_URL) {
            console.error('[N8N] ❌ N8N_WEBHOOK_URL غير محدد');
            return false;
        }

        console.log('[N8N] 🔍 اختبار الاتصال بـ n8n...');
        console.log(`[N8N] 🔗 URL: ${N8N_WEBHOOK_URL}`);
        
        const response = await axios.post(N8N_WEBHOOK_URL, {
            test: true,
            message: 'Connection test from TikTok Recorder Bot',
            timestamp: new Date().toISOString()
        }, {
            timeout: 5000
        });
        
        console.log('[N8N] ✅ الاتصال ناجح!');
        console.log(`[N8N] 📊 حالة: ${response.status}`);
        
        return true;
        
    } catch (error) {
        console.error('[N8N] ❌ فشل الاتصال:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('[N8N] 💡 تأكد من أن n8n يعمل وأن الـ Workflow مفعل');
        }
        
        return false;
    }
}
