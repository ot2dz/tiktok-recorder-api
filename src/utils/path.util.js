import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * الحصول على مسار مجلد التنزيلات
 * يدعم بيئة التطوير المحلية و Docker/Coolify
 */
function getDownloadsPath() {
    // التحقق من متغير البيئة أولاً (للإنتاج/Docker)
    if (process.env.DOWNLOADS_PATH) {
        return process.env.DOWNLOADS_PATH;
    }
    
    // مسار Docker الخاص بـ Coolify
    const dockerPath = '/var/lib/docker/volumes/po0w0k884kocwgwkw08c40w0-tiktok-bot-downloads/_data';
    
    // التحقق من وجود مسار Docker
    if (fs.existsSync(dockerPath)) {
        console.log('[Path] 🐳 استخدام مسار Docker/Coolify:', dockerPath);
        return dockerPath;
    }
    
    // المسار المحلي للتطوير
    const localPath = path.join(__dirname, '..', '..', 'downloads');
    console.log('[Path] 💻 استخدام المسار المحلي:', localPath);
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
        console.log('[Path] ✅ تم إنشاء مجلد downloads');
    }
    
    return localPath;
}

/**
 * الحصول على مسار ملف .env
 * يدعم بيئة التطوير والإنتاج
 */
function getEnvPath() {
    // للإنتاج: ملف .env في المستوى الرئيسي
    const productionEnvPath = '/app/.env';
    if (fs.existsSync(productionEnvPath)) {
        return productionEnvPath;
    }
    
    // للتطوير المحلي
    return path.join(__dirname, '..', '..', '.env');
}

/**
 * التحقق من أن التطبيق يعمل في بيئة Docker
 */
function isDockerEnvironment() {
    return fs.existsSync('/.dockerenv') || 
           fs.existsSync('/var/lib/docker/volumes/');
}

export {
    getDownloadsPath,
    getEnvPath,
    isDockerEnvironment
};
