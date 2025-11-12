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
    db = new Low(adapter, { monitoredUsers: [] }); // إضافة البيانات الافتراضية هنا

    await db.read();
    db.data ||= { monitoredUsers: [] }; // القيمة الافتراضية
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