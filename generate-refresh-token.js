#!/usr/bin/env node
/**
 * سكريبت لتوليد Google Refresh Token جديد
 * 
 * الاستخدام:
 * 1. قم بتشغيل: node generate-refresh-token.js
 * 2. افتح الرابط في المتصفح
 * 3. سجل الدخول بحساب Google الخاص بك
 * 4. انسخ الكود من المتصفح
 * 5. الصقه في الترمنال
 * 6. احفظ الـ refresh_token الجديد في ملف .env
 */

import { google } from 'googleapis';
import readline from 'readline';
import 'dotenv/config';

// قراءة بيانات OAuth من ملف .env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// رابط إعادة التوجيه (يجب أن يكون مطابقاً للموجود في Google Cloud Console)
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // للتطبيقات المكتبية

// الصلاحيات المطلوبة
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// إنشاء OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

console.log('\n🔐 === توليد Google Drive Refresh Token === 🔐\n');

// الخطوة 1: توليد رابط المصادقة
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // مهم للحصول على refresh token
    scope: SCOPES,
    prompt: 'consent' // يجبر Google على إعطاء refresh token جديد
});

console.log('📌 الخطوة 1: افتح هذا الرابط في المتصفح:\n');
console.log('🔗', authUrl);
console.log('\n');

// الخطوة 2: طلب إدخال الكود من المستخدم
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('📝 الخطوة 2: الصق الكود هنا بعد تسجيل الدخول: ', async (code) => {
    try {
        // الخطوة 3: استبدال الكود بـ tokens
        const { tokens } = await oauth2Client.getToken(code.trim());
        
        console.log('\n✅ تم الحصول على الـ tokens بنجاح!\n');
        console.log('📋 انسخ هذه القيم إلى ملف .env:\n');
        console.log('─────────────────────────────────────────────');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('─────────────────────────────────────────────\n');
        
        if (tokens.access_token) {
            console.log('💡 معلومة: تم الحصول أيضاً على access_token صالح لمدة ساعة واحدة.');
        }
        
        if (!tokens.refresh_token) {
            console.log('\n⚠️  تحذير: لم يتم الحصول على refresh_token!');
            console.log('الحل: قم بإلغاء الصلاحيات من حسابك وأعد المحاولة:');
            console.log('https://myaccount.google.com/permissions');
        }
        
    } catch (error) {
        console.error('\n❌ خطأ في الحصول على الـ tokens:', error.message);
    } finally {
        rl.close();
    }
});
