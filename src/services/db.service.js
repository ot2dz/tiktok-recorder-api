const path = require('path');
const { JSONFile } = require('lowdb/node');

// متغير لتخزين قاعدة البيانات بعد تحميلها بشكل غير متزامن
let db;

// دالة لتهيئة قاعدة البيانات بالقيمة الافتراضية إذا كانت فارغة
async function setupDatabase() {
    // نستخدم dynamic import() لأن lowdb هي ES Module
    const { Low } = await import('lowdb');
    
    const dbPath = path.join(__dirname, '..', '..', 'db.json');
    const adapter = new JSONFile(dbPath);
    db = new Low(adapter, { monitoredUsers: [] }); // إضافة البيانات الافتراضية هنا

    await db.read();
    db.data ||= { monitoredUsers: [] }; // القيمة الافتراضية
    await db.write();
    console.log('[DB] تم إعداد قاعدة البيانات بنجاح.');
}

// دالة لإضافة مستخدم إلى قائمة المراقبة
async function addUserToMonitor(username, chatId) {
    await db.read();
    const exists = db.data.monitoredUsers.some(u => u.username === username && u.chatId === chatId);
    if (!exists) {
        db.data.monitoredUsers.push({ username, chatId, isRecording: false });
        await db.write();
    }
}

// دالة لحذف مستخدم من قائمة المراقبة
async function removeUserFromMonitor(username, chatId) {
    await db.read();
    db.data.monitoredUsers = db.data.monitoredUsers.filter(u => !(u.username === username && u.chatId === chatId));
    await db.write();
}

// دالة لجلب كل المستخدمين المراقبين
async function getMonitoredUsers() {
    await db.read();
    return db.data.monitoredUsers;
}

module.exports = {
    setupDatabase,
    addUserToMonitor,
    removeUserFromMonitor,
    getMonitoredUsers
};