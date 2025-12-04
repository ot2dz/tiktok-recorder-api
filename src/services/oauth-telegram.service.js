import { google } from 'googleapis';
import fs from 'fs';
import 'dotenv/config';
import { saveGoogleRefreshToken, getTokenStatus } from './db.service.js';

/**
 * خدمة لإدارة OAuth عبر التليجرام
 * تسمح للمستخدم بتجديد Refresh Token من خلال محادثة التليجرام
 */

// متغير لتخزين حالة الـ OAuth للمستخدمين
const pendingOAuthStates = new Map();

/**
 * توليد رابط OAuth للمستخدم
 * @param {number} chatId - معرف المحادثة
 * @returns {string} رابط التفويض
 */
function generateOAuthUrl(chatId) {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';
    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });

    // حفظ حالة OAuth للمستخدم
    pendingOAuthStates.set(chatId, {
        oauth2Client,
        timestamp: Date.now()
    });

    return authUrl;
}

/**
 * استبدال الكود بـ Refresh Token
 * @param {number} chatId - معرف المحادثة
 * @param {string} code - الكود من Google
 * @returns {Promise<string>} Refresh Token الجديد
 */
async function exchangeCodeForToken(chatId, code) {
    const state = pendingOAuthStates.get(chatId);
    
    if (!state) {
        throw new Error('لم يتم العثور على طلب OAuth نشط. الرجاء البدء من جديد.');
    }

    // التحقق من أن الطلب لم ينتهي وقته (15 دقيقة)
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - state.timestamp > fifteenMinutes) {
        pendingOAuthStates.delete(chatId);
        throw new Error('انتهت صلاحية الطلب. الرجاء البدء من جديد.');
    }

    try {
        const { tokens } = await state.oauth2Client.getToken(code.trim());
        
        if (!tokens.refresh_token) {
            throw new Error('لم يتم الحصول على refresh_token. قد تحتاج لإلغاء الصلاحيات من: https://myaccount.google.com/permissions');
        }

        // تنظيف الحالة
        pendingOAuthStates.delete(chatId);
        
        return tokens.refresh_token;
    } catch (error) {
        pendingOAuthStates.delete(chatId);
        throw new Error(`فشل استبدال الكود: ${error.message}`);
    }
}

/**
 * حفظ Refresh Token الجديد في قاعدة البيانات
 * @param {string} refreshToken - الـ Refresh Token الجديد
 * @returns {Promise<void>}
 */
async function saveRefreshToken(refreshToken) {
    try {
        await saveGoogleRefreshToken(refreshToken);
        console.log('[OAuth Telegram] ✅ تم حفظ Refresh Token الجديد في قاعدة البيانات');
    } catch (error) {
        console.error('[OAuth Telegram] ❌ فشل حفظ Token:', error.message);
        throw error;
    }
}

/**
 * التحقق من صلاحية Refresh Token
 * @returns {Promise<boolean>} true إذا كان Token صالح
 */
async function validateRefreshToken() {
    try {
        const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        const tokenStatus = await getTokenStatus();

        if (!CLIENT_ID || !CLIENT_SECRET || !tokenStatus.hasToken) {
            return false;
        }

        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        const REFRESH_TOKEN = await require('./db.service.js').getGoogleRefreshToken();
        oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        // محاولة الحصول على Access Token
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        return !!credentials.access_token;
    } catch (error) {
        console.error('[OAuth Telegram] ⚠️ Token غير صالح:', error.message);
        return false;
    }
}

/**
 * تنظيف الطلبات القديمة (يتم استدعاؤها دورياً)
 */
function cleanupExpiredStates() {
    const fifteenMinutes = 15 * 60 * 1000;
    const now = Date.now();
    
    for (const [chatId, state] of pendingOAuthStates.entries()) {
        if (now - state.timestamp > fifteenMinutes) {
            pendingOAuthStates.delete(chatId);
            console.log(`[OAuth Telegram] 🧹 تم تنظيف OAuth state منتهي لـ chatId: ${chatId}`);
        }
    }
}

// تنظيف تلقائي كل 30 دقيقة
setInterval(cleanupExpiredStates, 30 * 60 * 1000);

export {
    generateOAuthUrl,
    exchangeCodeForToken,
    saveRefreshToken,
    validateRefreshToken,
    pendingOAuthStates
};
