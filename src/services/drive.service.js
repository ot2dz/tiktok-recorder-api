import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { getGoogleRefreshToken, updateTokenLastUsed } from './db.service.js';

// متغير لتخزين نسخة drive بعد تهيئتها لتجنب إعادة التهيئة مع كل عملية رفع
let drive = null;

/**
 * تهيئة Google Drive API باستخدام متغيرات البيئة (الطريقة الاحترافية).
 * يقوم بقراءة البيانات من .env وإنشاء عميل مصادقة جاهز للاستخدام.
 */
async function initializeDrive() {
    // إذا تم تهيئة drive من قبل، قم بإرجاعه مباشرة لتجنب العمليات المكررة
    if (drive) return drive;

    try {
        // 1. قراءة بيانات الاعتماد من process.env و DB
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = await getGoogleRefreshToken(); // قراءة من DB

        // التحقق من وجود جميع المتغيرات المطلوبة لضمان عدم حدوث أخطاء
        if (!clientId || !clientSecret) {
            throw new Error('متغيرات Google Drive (CLIENT_ID, CLIENT_SECRET) غير موجودة في Environment Variables');
        }
        
        if (!refreshToken) {
            throw new Error('GOOGLE_REFRESH_TOKEN غير موجود في قاعدة البيانات. استخدم /update_token لتعيينه.');
        }

        // 2. إنشاء عميل OAuth2 باستخدام بيانات الاعتماد
        const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);

        // 3. تعيين التوكن الدائم للعميل، مما يسمح له بتجديد صلاحية الوصول تلقائيًا
        oAuth2Client.setCredentials({
            refresh_token: refreshToken
        });

        // 4. إنشاء خدمة Drive وتخزينها في المتغير العام
        drive = google.drive({ version: 'v3', auth: oAuth2Client });
        console.log('[Google Drive] ✅ تم تهيئة Google Drive API بنجاح (Token من قاعدة البيانات).');
        return drive;

    } catch (error) {
        console.error('[Google Drive] ❌ فشل فادح في تهيئة Google Drive API:', error.message);
        // رمي الخطأ لإيقاف العملية إذا لم تنجح المصادقة
        throw error;
    }
}

/**
 * رفع ملف فيديو إلى Google Drive.
 * @param {string} filePath - المسار الكامل للملف المحلي المراد رفعه.
 * @param {string} username - اسم مستخدم تيك توك، يستخدم في تسمية الملف.
 * @returns {Promise<Object>} كائن يحتوي على معلومات الملف المرفوع.
 */
async function uploadVideoToDrive(filePath, username) {
    try {
        const driveClient = await initializeDrive(); // التأكد من أن المصادقة جاهزة
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!folderId) {
            throw new Error('متغير GOOGLE_DRIVE_FOLDER_ID غير محدد في ملف .env');
        }

        console.log(`[Google Drive] 📤 بدء رفع الملف: ${filePath}`);
        const fileStats = fs.statSync(filePath);
        const fileSizeInMB = (fileStats.size / 1024 / 1024).toFixed(2);
        console.log(`[Google Drive] 📊 حجم الملف: ${fileSizeInMB} MB`);

        // إعداد بيانات الملف (الاسم، والمجلد الأب)
        const fileMetadata = {
            name: `${username}_${new Date().toISOString()}.mp4`,
            parents: [folderId],
        };

        // إعداد محتوى الملف للرفع
        const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(filePath),
        };

        // تنفيذ عملية الرفع
        const response = await driveClient.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, size, webViewLink', // طلب الحقول المطلوبة فقط
            supportsAllDrives: true, // ضروري لدعم الرفع إلى Shared Drives
        });
        
        const uploadedFile = response.data;
        console.log(`[Google Drive] ✅ تم الرفع بنجاح! معرف الملف: ${uploadedFile.id}`);

        // تحديث آخر استخدام ناجح للـ Token
        await updateTokenLastUsed();

        // جعل الملف قابلاً للمشاهدة من قبل أي شخص لديه الرابط
        await makeFilePublic(uploadedFile.id);

        // إرجاع كائن منظم يحتوي على بيانات مفيدة للبوت
        return {
            id: uploadedFile.id,
            name: uploadedFile.name,
            size: uploadedFile.size,
            directLink: uploadedFile.webViewLink,
        };

    } catch (error) {
        console.error('[Google Drive] ❌ حدث خطأ فادح أثناء الرفع:', error.message);
        
        // إضافة معلومات إضافية للخطأ لمعرفة نوعه
        if (error.message && error.message.includes('invalid_grant')) {
            error.isTokenExpired = true;
            error.userMessage = '🔐 انتهت صلاحية Google Drive Token. يرجى تجديده.';
        }
        
        throw error;
    }
}

/**
 * جعل الملف عامًا (يمكن لأي شخص لديه الرابط الوصول إليه كـ "قارئ").
 * @param {string} fileId - معرف الملف على Google Drive.
 */
async function makeFilePublic(fileId) {
    try {
        const driveClient = await initializeDrive();
        await driveClient.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });
        console.log(`[Google Drive] 🔓 تم جعل الملف عامًا للمشاهدة.`);
    } catch (error) {
        // لا نرمي خطأ هنا، لأن الرفع قد نجح بالفعل، وهذا فشل ثانوي
        console.error('[Google Drive] ⚠️ فشل جعل الملف عامًا (لكن تم رفعه بنجاح):', error.message);
    }
}

/**
 * إعادة تعيين Drive Client (استخدم بعد تحديث Token)
 * هذه الدالة تُجبر النظام على إنشاء client جديد بـ Token الجديد
 */
function resetDriveClient() {
    drive = null;
    console.log('[Google Drive] 🔄 تم إعادة تعيين Drive Client - سيُستخدم Token الجديد في المرة القادمة');
}

// تصدير الدوال التي سيتم استخدامها في الملفات الأخرى (مثل bot.js)
export {
    uploadVideoToDrive,
    resetDriveClient
};