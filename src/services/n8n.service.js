import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import 'dotenv/config';

export async function uploadDirectToN8n(filePath, username, chatId) {
    try {
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
        if (!N8N_WEBHOOK_URL) throw new Error('N8N_WEBHOOK_URL missing');

        console.log(`[n8n-Direct] 📤 بدء إرسال الملف مباشرة: ${path.basename(filePath)}`);

        const form = new FormData();
        // إرسال الملف كبيانات ثنائية
        form.append('video', fs.createReadStream(filePath));
        // إرسال البيانات الوصفية كحقول نصية
        form.append('username', username);
        form.append('chatId', chatId.toString());
        form.append('filename', path.basename(filePath));

        const response = await axios.post(N8N_WEBHOOK_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            // مهم جداً للفيديوهات الكبيرة: عدم تحديد وقت انتهاء قصير
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 0
        });

        console.log('[n8n-Direct] ✅ تم الاستلام من قبل n8n بنجاح');
        return { success: true, data: response.data };

    } catch (error) {
        console.error('[n8n-Direct] ❌ فشل الإرسال المباشر:', error.message);
        return { success: false, error: error.message };
    }
}