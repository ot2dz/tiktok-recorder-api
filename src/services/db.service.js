import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

// الحصول على __dirname في ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// متغير لتخزين قاعدة البيانات بعد تحميلها بشكل غير متزامن
let db;

// دالة لتهيئة قاعدة البيانات بالقيمة الافتراضية إذا كانت فارغة
export async function setupDatabase() {
    const dbPath = path.join(__dirname, '..', '..', 'db.json');
    const adapter = new JSONFile(dbPath);
    db = new Low(adapter, { 
        monitoredUsers: [],
        settings: {
            googleRefreshToken: null,
            googleAccessToken: null,
            tokenExpiryDate: null,
            tokenLastUpdated: null,
            tokenLastUsed: null
        },
        failedUploads: [],
        stats: {
            totalUploads: 0,
            successfulUploads: 0,
            failedUploads: 0
        }
    });

    await db.read();
    
    // التأكد من وجود الهيكل الكامل
    db.data ||= { monitoredUsers: [], settings: {}, failedUploads: [], stats: {} };
    db.data.settings ||= { 
        googleRefreshToken: null, 
        googleAccessToken: null,
        tokenExpiryDate: null,
        tokenLastUpdated: null, 
        tokenLastUsed: null 
    };
    db.data.failedUploads ||= [];
    db.data.stats ||= { totalUploads: 0, successfulUploads: 0, failedUploads: 0 };
    
    // نقل Token من ENV إلى DB في أول تشغيل فقط
    if (!db.data.settings.googleRefreshToken && process.env.GOOGLE_REFRESH_TOKEN) {
        db.data.settings.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        db.data.settings.tokenLastUpdated = new Date().toISOString();
        console.log('[DB] ✅ تم نقل GOOGLE_REFRESH_TOKEN من ENV إلى قاعدة البيانات');
    }
    
    await db.write();
    console.log('[DB] تم إعداد قاعدة البيانات بنجاح.');
}

// دالة لإضافة مستخدم إلى قائمة المراقبة
export async function addUserToMonitor(username, chatId) {
    await db.read();
    const exists = db.data.monitoredUsers.some(u => u.username === username && u.chatId === chatId);
    if (!exists) {
        db.data.monitoredUsers.push({ username, chatId, isRecording: false });
        await db.write();
    }
}

// دالة لحذف مستخدم من قائمة المراقبة
export async function removeUserFromMonitor(username, chatId) {
    await db.read();
    db.data.monitoredUsers = db.data.monitoredUsers.filter(u => !(u.username === username && u.chatId === chatId));
    await db.write();
}

// دالة لجلب كل المستخدمين المراقبين
export async function getMonitoredUsers() {
    await db.read();
    return db.data.monitoredUsers;
}

// ==================== دوال إدارة Google Refresh Token ====================

// دالة للحصول على Google Refresh Token
export async function getGoogleRefreshToken() {
    await db.read();
    return db.data.settings?.googleRefreshToken || null;
}

// دالة لحفظ Google Refresh Token
export async function saveGoogleRefreshToken(token) {
    await db.read();
    db.data.settings = db.data.settings || {};
    db.data.settings.googleRefreshToken = token;
    db.data.settings.tokenLastUpdated = new Date().toISOString();
    await db.write();
    console.log('[DB] ✅ تم حفظ Google Refresh Token الجديد');
}

// دالة لحفظ كامل Tokens (Access + Refresh + Expiry)
export async function saveTokensToDb({ accessToken, refreshToken, expiryDate }) {
    await db.read();
    db.data.settings = db.data.settings || {};
    
    if (accessToken) db.data.settings.googleAccessToken = accessToken;
    if (refreshToken) db.data.settings.googleRefreshToken = refreshToken;
    if (expiryDate) db.data.settings.tokenExpiryDate = expiryDate;
    
    db.data.settings.tokenLastUpdated = new Date().toISOString();
    await db.write();
    console.log('[DB] ✅ تم حفظ Tokens (Access + Refresh + Expiry)');
}

// دالة للحصول على كامل Tokens
export async function getTokensFromDb() {
    await db.read();
    return {
        accessToken: db.data.settings?.googleAccessToken || null,
        refreshToken: db.data.settings?.googleRefreshToken || null,
        expiryDate: db.data.settings?.tokenExpiryDate || null
    };
}

// دالة لتحديث آخر استخدام ناجح للـ Token
export async function updateTokenLastUsed() {
    await db.read();
    db.data.settings = db.data.settings || {};
    db.data.settings.tokenLastUsed = new Date().toISOString();
    await db.write();
}

// دالة للحصول على حالة Token
export async function getTokenStatus() {
    await db.read();
    return {
        hasToken: !!db.data.settings?.googleRefreshToken,
        lastUpdated: db.data.settings?.tokenLastUpdated || null,
        lastUsed: db.data.settings?.tokenLastUsed || null,
        stats: db.data.stats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0 }
    };
}

// ==================== دوال إدارة الفيديوهات الفاشلة ====================

// دالة لإضافة فيديو فاشل إلى القائمة
export async function addFailedUpload(uploadInfo) {
    await db.read();
    
    const id = `${uploadInfo.username}_${Date.now()}`;
    const failedUpload = {
        id,
        username: uploadInfo.username,
        filepath: uploadInfo.filepath,
        chatId: uploadInfo.chatId,
        failedAt: new Date().toISOString(),
        error: uploadInfo.error || 'Unknown error',
        fileSize: uploadInfo.fileSize || 'Unknown',
        attempts: uploadInfo.attempts || 0
    };
    
    db.data.failedUploads = db.data.failedUploads || [];
    db.data.failedUploads.push(failedUpload);
    
    // تحديث الإحصائيات
    db.data.stats = db.data.stats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0 };
    db.data.stats.failedUploads++;
    
    await db.write();
    console.log(`[DB] ➕ تم إضافة فيديو فاشل: ${uploadInfo.username}`);
    return id;
}

// دالة للحصول على جميع الفيديوهات الفاشلة
export async function getFailedUploads() {
    await db.read();
    return db.data.failedUploads || [];
}

// دالة للحصول على الفيديوهات الفاشلة لمحادثة معينة
export async function getFailedUploadsByChatId(chatId) {
    await db.read();
    return (db.data.failedUploads || []).filter(upload => upload.chatId === chatId);
}

// دالة لحذف فيديو فاشل من القائمة
export async function removeFailedUpload(id) {
    await db.read();
    db.data.failedUploads = (db.data.failedUploads || []).filter(upload => upload.id !== id);
    await db.write();
    console.log(`[DB] ➖ تم حذف فيديو فاشل: ${id}`);
}

// دالة لتحديث عدد المحاولات لفيديو فاشل
export async function incrementFailedUploadAttempts(id) {
    await db.read();
    const upload = (db.data.failedUploads || []).find(u => u.id === id);
    if (upload) {
        upload.attempts = (upload.attempts || 0) + 1;
        upload.lastAttempt = new Date().toISOString();
        await db.write();
    }
}

// دالة لمسح جميع الفيديوهات الفاشلة
export async function clearFailedUploads() {
    await db.read();
    const count = (db.data.failedUploads || []).length;
    db.data.failedUploads = [];
    await db.write();
    console.log(`[DB] 🧹 تم مسح ${count} فيديو فاشل`);
    return count;
}

// دالة لتحديث إحصائيات الرفع
export async function updateUploadStats(success = true) {
    await db.read();
    db.data.stats = db.data.stats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0 };
    db.data.stats.totalUploads++;
    if (success) {
        db.data.stats.successfulUploads++;
    }
    await db.write();
}
