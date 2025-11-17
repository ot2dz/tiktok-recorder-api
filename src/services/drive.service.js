// src/services/drive.service.js

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// متغير لتخزين نسخة drive بعد تهيئتها لتجنب إعادة التهيئة مع كل عملية رفع
let drive = null;

/**
 * تهيئة Google Drive API باستخدام OAuth 2.0 (المصادقة باسم المستخدم).
 * هذه هي الدالة الجديدة والمحدثة.
 */
async function initializeDrive() {
    // إذا تم تهيئة drive من قبل، قم بإرجاعه مباشرة
    if (drive) return drive;

    try {
        // 1. قراءة بيانات اعتماد OAuth من الملف
        const credentialsPath = path.resolve(process.cwd(), 'oauth-credentials.json');
        if (!fs.existsSync(credentialsPath)) {
            throw new Error('لم يتم العثور على ملف oauth-credentials.json. يرجى التأكد من وجوده في المجلد الرئيسي.');
        }
        const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(credentialsContent).installed;

        // 2. إنشاء عميل OAuth2
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // 3. قراءة التوكن الدائم الذي حصلنا عليه
        const tokenPath = path.resolve(process.cwd(), 'token.json');
        if (!fs.existsSync(tokenPath)) {
            throw new Error("لم يتم العثور على ملف token.json. يرجى تشغيل 'node generate-token.js' أولاً للحصول عليه.");
        }
        const tokenContent = fs.readFileSync(tokenPath, 'utf8');
        oAuth2Client.setCredentials(JSON.parse(tokenContent));

        // 4. إنشاء خدمة Drive باستخدام المصادقة الصحيحة
        drive = google.drive({ version: 'v3', auth: oAuth2Client });
        console.log('[Google Drive] ✅ تم تهيئة Google Drive API بنجاح (باسم المستخدم).');
        return drive;

    } catch (error) {
        console.error('[Google Drive] ❌ فشل تهيئة Google Drive API:', error.message);
        throw error; // إيقاف العملية إذا فشلت التهيئة
    }
}

/**
 * رفع فيديو إلى Google Drive.
 * هذه الدالة تبقى كما هي تقريبًا، لكنها ستستخدم الآن initializeDrive() المحدثة.
 */
async function uploadVideoToDrive(filePath, filename) {
    try {
        const driveClient = await initializeDrive(); // استدعاء دالة التهيئة الجديدة
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!folderId) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID غير محدد في ملف .env');
        }

        console.log(`[Google Drive] 📤 بدء رفع الملف: ${filePath}`);
        const fileStats = fs.statSync(filePath);
        const fileSizeInMB = (fileStats.size / 1024 / 1024).toFixed(2);
        console.log(`[Google Drive] 📊 حجم الملف: ${fileSizeInMB} MB`);

        const fileMetadata = {
            name: `${filename}_${Date.now()}.mp4`,
            parents: [folderId],
        };

        const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(filePath),
        };

        const response = await driveClient.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, size, webViewLink',
            supportsAllDrives: true, // مهم جدًا لدعم Shared Drives
        });
        
        const uploadedFile = response.data;
        console.log(`[Google Drive] ✅ تم الرفع بنجاح! معرف الملف: ${uploadedFile.id}`);

        // جعل الملف عامًا (اختياري ولكنه مفيد)
        await makeFilePublic(uploadedFile.id);

        return {
            id: uploadedFile.id,
            name: uploadedFile.name,
            size: uploadedFile.size,
            directLink: uploadedFile.webViewLink, // الرابط المباشر للمشاهدة
        };

    } catch (error) {
        console.error('[Google Drive] ❌ حدث خطأ فادح أثناء الرفع:', error.message);
        throw error;
    }
}

/**
 * جعل الملف عامًا (يمكن لأي شخص لديه الرابط الوصول إليه).
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
        console.error('[Google Drive] ⚠️ فشل جعل الملف عامًا:', error.message);
    }
}

// تصدير الدوال للاستخدام في bot.js
export {
    uploadVideoToDrive
};