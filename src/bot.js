import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import fs from 'fs';
import 'dotenv/config';
import dns from 'dns';

// --- الحل النهائي: تعيين خوادم DNS بشكل صريح للتطبيق بأكمله ---
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('[DNS Fix] تم تعيين خوادم DNS بشكل صريح إلى Google & Cloudflare.');

import { getRoomId, isUserLive, getLiveStreamUrl } from './services/tiktok.service.js';
import { recordLiveStream } from './core/recorder.service.js';
import { uploadVideo } from './services/cloudinary.service.js';
import { setupDatabase, addUserToMonitor, removeUserFromMonitor, getMonitoredUsers } from './services/db.service.js';
import { startMonitoring, currentlyRecording } from './core/monitoring.service.js';


if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN في ملف .env');
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const userState = {};
const activeRecordings = {};

const CHECK_STATUS_BTN = '🔍 فحص حالة البث';
const RECORD_LIVE_BTN = '🔴 بدء تسجيل بث';
const MANAGE_MONITOR_BTN = '⚙️ إدارة المراقبة';

const mainKeyboard = Markup.keyboard([
    [CHECK_STATUS_BTN, RECORD_LIVE_BTN],
    [MANAGE_MONITOR_BTN]
]).resize();

bot.start((ctx) => {
    ctx.reply(
        'أهلاً بك! اختر أحد الخيارات من القائمة للبدء.',
        mainKeyboard
    );
});

bot.hears(CHECK_STATUS_BTN, (ctx) => {
    userState[ctx.chat.id] = 'check_status';
    ctx.reply('حسناً، أرسل الآن اسم المستخدم على تيك توك الذي تريد فحصه.');
});

bot.hears(RECORD_LIVE_BTN, (ctx) => {
    userState[ctx.chat.id] = 'record_live';
    ctx.reply('حسناً، أرسل الآن اسم المستخدم على تيك توك الذي تريد بدء تسجيله.');
});

bot.hears(MANAGE_MONITOR_BTN, (ctx) => {
    const monitorKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('➕ إضافة مستخدم للمراقبة', 'add_monitor')],
        [Markup.button.callback('🗑️ حذف مستخدم من المراقبة', 'remove_monitor')],
        [Markup.button.callback('📋 عرض القائمة', 'list_monitor')]
    ]);
    ctx.reply('اختر الإجراء المطلوب:', monitorKeyboard);
});

bot.action('add_monitor', (ctx) => {
    userState[ctx.chat.id] = 'add_monitor';
    ctx.reply('أرسل الآن اسم المستخدم الذي تريد إضافته إلى قائمة المراقبة.');
    ctx.answerCbQuery();
});

bot.action('remove_monitor', (ctx) => {
    userState[ctx.chat.id] = 'remove_monitor';
    ctx.reply('أرسل الآن اسم المستخدم الذي تريد حذفه من قائمة المراقبة.');
    ctx.answerCbQuery();
});

bot.action('list_monitor', async (ctx) => {
    try {
        const users = await getMonitoredUsers();
        const userList = users
            .filter(u => u.chatId === ctx.chat.id)
            .map(u => `- @${u.username}`)
            .join('\n');
        
        await ctx.reply(userList ? `قائمة المستخدمين قيد المراقبة:\n${userList}` : 'قائمة المراقبة فارغة.');
    } catch (error) {
        console.error("Error listing monitored users:", error);
        await ctx.reply('حدث خطأ أثناء جلب القائمة.');
    }
    await ctx.answerCbQuery();
});

bot.on(message('text'), async (ctx) => {
    const chatId = ctx.chat.id;
    const currentState = userState[chatId];
    const username = ctx.message.text.trim().replace('@', '');

    if (!currentState) {
        ctx.reply('الرجاء اختيار أحد الخيارات من القائمة أولاً.', mainKeyboard);
        return;
    }
    delete userState[chatId];

    switch (currentState) {
        case 'check_status':
            await handleCheckStatus(ctx, username);
            break;
        case 'record_live':
            await handleRecordLive(ctx, username);
            break;
        case 'add_monitor':
            await addUserToMonitor(username, chatId);
            await ctx.reply(`✅ تم إضافة المستخدم "${username}" إلى قائمة المراقبة.`);
            break;
        case 'remove_monitor':
            await removeUserFromMonitor(username, chatId);
            await ctx.reply(`🗑️ تم حذف المستخدم "${username}" من قائمة المراقبة.`);
            break;
    }
});

bot.action(/stop_record_(.+)/, (ctx) => {
    const username = ctx.match[1];
    const recording = activeRecordings[username];
    if (recording && recording.controller) {
        ctx.answerCbQuery(`جاري إيقاف تسجيل ${username}...`);
        recording.controller.abort();
        ctx.editMessageText(`تم طلب إيقاف التسجيل للمستخدم ${username}. سيتم إرسال الفيديو المسجل قريبًا.`);
    } else {
        ctx.answerCbQuery('لم يتم العثور على عملية تسجيل نشطة لهذا المستخدم.');
    }
});

async function handleCheckStatus(ctx, username) {
    await ctx.reply(`جاري فحص حالة المستخدم "${username}"...`);
    try {
        const roomId = await getRoomId(username);
        if (!roomId || !(await isUserLive(roomId))) {
            await ctx.reply(`❌ المستخدم "${username}" ليس في بث مباشر حالياً.`);
            return;
        }
        await ctx.reply(`✅ المستخدم "${username}" في بث مباشر الآن!`);
    } catch (error) {
        console.error(error);
        await ctx.reply('حدث خطأ أثناء محاولة فحص حالة المستخدم.');
    }
}

async function handleRecordLive(ctx, username) {
    if (activeRecordings[username]) {
        await ctx.reply(`يوجد بالفعل عملية تسجيل جارية للمستخدم ${username}.`);
        return;
    }

    const checkingMsg = await ctx.reply(`جاري التحقق من حالة ${username} قبل بدء التسجيل...`);
    
    try {
        const roomId = await getRoomId(username);
        if (!roomId || !(await isUserLive(roomId))) {
            await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, `❌ لا يمكن بدء التسجيل. المستخدم "${username}" ليس في بث مباشر حالياً.`);
            return;
        }

        const streamUrl = await getLiveStreamUrl(roomId);
        if (!streamUrl) {
            await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, 'حدث خطأ: لم يتم العثور على رابط البث.');
            return;
        }

        const controller = new AbortController();
        const stopButton = Markup.inlineKeyboard([
            Markup.button.callback('⏹️ إيقاف التسجيل', `stop_record_${username}`)
        ]);

        const recordingMsg = await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, `🔴 بدأ تسجيل البث للمستخدم ${username}...`, stopButton);
        
        activeRecordings[username] = { controller, messageId: recordingMsg.message_id, chatId: ctx.chat.id };

        // ---  هنا يبدأ المنطق الجديد والمحسن ---
        recordLiveStream(streamUrl, username, controller.signal)
            .then(async (finalMp4Path) => {
                try {
                    // الخطوة 1: إعلام المستخدم بانتهاء التسجيل
                    await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `✅ انتهى التسجيل. جاري أرشفة الفيديو ومعالجته...`);
                    
                    // الخطوة 2: الأرشفة أولاً - الرفع إلى Cloudinary
                    const cloudinaryResult = await uploadVideo(finalMp4Path, username);
                    await ctx.reply(`☁️ تمت أرشفة الفيديو بنجاح على Cloudinary.`);

                    // الخطوة 3: التحقق من الحجم
                    const fileStats = fs.statSync(finalMp4Path);
                    const fileSizeInMB = fileStats.size / (1024 * 1024);
                    const telegramLimitMB = 50;

                    // الخطوة 4: الإرسال المشروط إلى تليجرام
                    if (fileSizeInMB <= telegramLimitMB) {
                        await ctx.reply('حجم الملف مناسب، جاري إرساله مباشرة...');
                        await ctx.replyWithVideo({ source: finalMp4Path });
                    } else {
                        await ctx.reply(
                            `🎥 حجم الفيديو (${fileSizeInMB.toFixed(2)} MB) يتجاوز حد تليجرام (${telegramLimitMB} MB).\n\n` +
                            `يمكنك مشاهدته أو تحميله مباشرة من الرابط الدائم:\n${cloudinaryResult.secure_url}`
                        );
                    }

                } catch (processingError) {
                    console.error("خطأ أثناء الرفع أو الإرسال بعد التسجيل:", processingError);
                    await ctx.reply('حدث خطأ أثناء معالجة الفيديو بعد تسجيله. تم حفظه على Cloudinary.');
                } finally {
                    // الخطوة 5: التنظيف دائمًا بعد نجاح الأرشفة
                    console.log(`[FS] جاري حذف الملف المحلي: ${finalMp4Path}`);
                    fs.unlinkSync(finalMp4Path);
                }
            })
            .catch(async (error) => {
                console.error(`خطأ في عملية التسجيل لـ ${username}:`, error);
                await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `حدث خطأ فادح أثناء تسجيل ${username}.`);
            })
            .finally(() => {
                delete activeRecordings[username];
                if (currentlyRecording.has(username)) {
                    currentlyRecording.delete(username);
                }
            });

    } catch (error) {
        console.error(error);
        await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, 'حدث خطأ عام أثناء محاولة بدء التسجيل.');
    }
}

async function startApp() {
    try {
        await setupDatabase();
        startMonitoring(bot, handleRecordLive);
        bot.launch();
        console.log('البوت وخدمة المراقبة يعملان الآن...');
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } catch (error) {
        console.error("فشل بدء تشغيل التطبيق:", error);
        process.exit(1);
    }
}

startApp();

export { handleRecordLive };