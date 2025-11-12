/**
 * Application constants and configuration
 */

// Monitoring configuration
export const MONITORING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Bot button labels
export const BOT_BUTTONS = {
    CHECK_STATUS: '🔍 فحص حالة البث',
    RECORD_LIVE: '🔴 بدء تسجيل بث',
    MANAGE_MONITOR: '⚙️ إدارة المراقبة'
};

// TikTok API configuration
export const TIKTOK_API = {
    SIGN_URL: 'https://tikrec.com/tiktok/room/api/sign',
    BASE_URL: 'https://www.tiktok.com',
    WEBCAST_URL: 'https://webcast.tiktok.com',
    AID: '1988'
};

// File and path configuration
export const FILE_CONFIG = {
    MAX_USERNAME_LENGTH: 30,
    USERNAME_PATTERN: /^[a-zA-Z0-9._-]+$/,
    DOWNLOADS_DIR: 'downloads'
};

// Error messages
export const ERROR_MESSAGES = {
    INVALID_USERNAME: '❌ اسم المستخدم غير صالح. يرجى استخدام أحرف وأرقام فقط.',
    NOT_LIVE: 'ليس في بث مباشر حالياً.',
    RECORDING_IN_PROGRESS: 'يوجد بالفعل عملية تسجيل جارية للمستخدم',
    GENERAL_ERROR: 'حدث خطأ أثناء معالجة الطلب.',
    MISSING_TOKEN: 'خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN في ملف .env',
    STREAM_NOT_FOUND: 'حدث خطأ: لم يتم العثور على رابط البث.',
    CLOUDINARY_MISSING: 'Cannot upload video: Missing Cloudinary configuration'
};

// Success messages
export const SUCCESS_MESSAGES = {
    USER_LIVE: 'في بث مباشر الآن!',
    RECORDING_STARTED: 'بدأ تسجيل البث للمستخدم',
    RECORDING_STOPPED: 'انتهى التسجيل',
    USER_ADDED: 'تم إضافة المستخدم إلى قائمة المراقبة.',
    USER_REMOVED: 'تم حذف المستخدم من قائمة المراقبة.',
    CLOUDINARY_UPLOADED: 'تمت أرشفة الفيديو بنجاح!'
};
