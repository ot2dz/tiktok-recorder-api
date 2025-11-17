// test-oauth-upload.js
import { google } from 'googleapis';
import fs from 'fs/promises';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import path from 'path';
import 'dotenv/config';

async function testOAuthUpload() {
    console.log('🚀 بدء سكربت اختبار الرفع باستخدام OAuth 2.0...');

    const tempFilePath = path.join(process.cwd(), 'test-oauth-file.txt');

    try {
        // --- 1. التحقق من الإعدادات ---
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const credentialsPath = path.join(process.cwd(), 'oauth-credentials.json');
        const tokenPath = path.join(process.cwd(), 'token.json');

        if (!folderId) throw new Error('❌ متغير GOOGLE_DRIVE_FOLDER_ID غير موجود في ملف .env');
        if (!existsSync(credentialsPath)) throw new Error('❌ لم يتم العثور على ملف oauth-credentials.json');
        if (!existsSync(tokenPath)) throw new Error("❌ لم يتم العثور على ملف token.json. يرجى تشغيل 'node generate-token.js' أولاً.");
        
        console.log('✅ تم العثور على جميع الملفات والإعدادات المطلوبة.');

        // --- 2. المصادقة باستخدام OAuth 2.0 ---
        const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(credentialsContent).installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        const tokenContent = await fs.readFile(tokenPath, 'utf8');
        oAuth2Client.setCredentials(JSON.parse(tokenContent));

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        console.log('✅ تمت المصادقة بنجاح (باسم المستخدم).');

        // --- 3. إنشاء ورفع الملف ---
        await fs.writeFile(tempFilePath, `Test upload successful at ${new Date().toISOString()}`);
        console.log(`📝 تم إنشاء ملف اختبار مؤقت: ${tempFilePath}`);

        const fileMetadata = {
            name: 'oauth-test-success.txt',
            parents: [folderId], // استخدم المجلد العادي أو Shared Drive ID
        };
        const media = {
            mimeType: 'text/plain',
            body: createReadStream(tempFilePath),
        };

        console.log(`📤 جاري رفع الملف إلى المجلد ID: ${folderId}...`);
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
            supportsAllDrives: true, // ضروري إذا كان المجلد في Shared Drive
        });

        // --- 4. عرض النتيجة ---
        console.log('\n' + '🎉'.repeat(20));
        console.log('🎉 نجاح! تم رفع الملف بنجاح باستخدام OAuth 2.0!');
        console.log('🎉'.repeat(20));
        console.log(`📄 معرف الملف: ${response.data.id}`);
        console.log(`🏷️ اسم الملف: ${response.data.name}`);
        console.log(`🔗 رابط الملف (اذهب إليه للتأكد): ${response.data.webViewLink}`);
        console.log('\n✅ بما أن هذا السكربت نجح، فالبوت الرئيسي سيعمل الآن بالتأكيد.');

    } catch (error) {
        console.error('\n' + '❌'.repeat(20));
        console.error('❌ فشل الاختبار! حدث خطأ أثناء الرفع.');
        console.error('❌'.repeat(20));
        console.error('السبب:', error.message);
    } finally {
        // --- 5. تنظيف ---
        if (existsSync(tempFilePath)) {
            unlinkSync(tempFilePath);
            console.log('🗑️ تم حذف ملف الاختبار المؤقت.');
        }
    }
}

testOAuthUpload();