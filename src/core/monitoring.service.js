const tiktokService = require('../services/tiktok.service');
const dbService = require('../services/db.service');

// مجموعة لتتبع المستخدمين الذين يتم تسجيلهم حاليًا لمنع التسجيل المزدوج
const currentlyRecording = new Set();

let handleRecordLive; // متغير لتخزين الدالة

/**
 * دالة تقوم بفحص قائمة المراقبة مرة واحدة
 * @param {Telegraf} bot - نسخة البوت لإرسال الإشعارات والتسجيل
 */
async function checkMonitoredUsers(bot) {
    console.log('[Monitor] بدء جولة فحص جديدة...');
    const users = await dbService.getMonitoredUsers();

    for (const user of users) {
        if (currentlyRecording.has(user.username)) continue;

        try {
            const roomId = await tiktokService.getRoomId(user.username);
            if (roomId && await tiktokService.isUserLive(roomId)) {
                console.log(`[Monitor] اكتشاف بث مباشر للمستخدم: ${user.username}!`);
                
                await bot.telegram.sendMessage(user.chatId, `🔔 تم اكتشاف بث مباشر للمستخدم "${user.username}". بدء التسجيل التلقائي...`);
                currentlyRecording.add(user.username);
                
                // إنشاء كائن context مزيف يشبه الذي يرسله تليجرام
                const fakeContext = {
                    chat: { id: user.chatId },
                    reply: (text) => bot.telegram.sendMessage(user.chatId, text)
                };
                
                // استدعاء دالة التسجيل التي تم تمريرها
                handleRecordLive(fakeContext, user.username);
            }
        } catch (error) {
            console.error(`[Monitor] خطأ أثناء فحص المستخدم ${user.username}:`, error);
        }
    }
}

/**
 * تبدأ حلقة المراقبة الدورية
 * @param {Telegraf} bot 
 * @param {Function} recordFunction - دالة handleRecordLive من bot.js
 */
function startMonitoring(bot, recordFunction) {
    handleRecordLive = recordFunction; // تخزين الدالة للاستخدام
    console.log('[Monitor] تم تفعيل خدمة المراقبة.');
    setInterval(() => checkMonitoredUsers(bot), 300000);
    checkMonitoredUsers(bot);
}

module.exports = { startMonitoring, currentlyRecording };