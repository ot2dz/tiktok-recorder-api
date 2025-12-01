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
import { uploadVideoToDrive } from './services/drive.service.js';
import { setupDatabase, addUserToMonitor, removeUserFromMonitor, getMonitoredUsers } from './services/db.service.js';
import { startMonitoring, currentlyRecording } from './core/monitoring.service.js';
import { generateOAuthUrl, exchangeCodeForToken, saveRefreshTokenToEnv, pendingOAuthStates } from './services/oauth-telegram.service.js';
import { addToFailedQueue, getFailedQueue, retryAllFailedUploads, getQueueSize } from './services/upload-queue.service.js';


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
        'أهلاً بك! اختر أحد الخيارات من القائمة للبدء.\n\n' +
        '📌 أوامر إضافية:\n' +
        '/refresh_token - تجديد Google Drive Token\n' +
        '/reupload - إعادة رفع الملفات الفاشلة\n' +
        '/queue - عرض قائمة الملفات المنتظرة',
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

// ===== أوامر جديدة لإدارة Google Drive Token =====

// أمر تجديد Token
bot.command('refresh_token', async (ctx) => {
    try {
        const authUrl = generateOAuthUrl(ctx.chat.id);
        
        await ctx.reply(
            '🔐 *تجديد Google Drive Token*\n\n' +
            '📌 اتبع الخطوات التالية:\n\n' +
            '1️⃣ افتح الرابط أدناه في المتصفح\n' +
            '2️⃣ سجل الدخول بحساب Google\n' +
            '3️⃣ اسمح بالصلاحيات\n' +
            '4️⃣ انسخ الكود الذي سيظهر لك\n' +
            '5️⃣ أرسل الكود هنا في المحادثة\n\n' +
            `🔗 [اضغط هنا للتفويض](${authUrl})\n\n` +
            '⏰ لديك 15 دقيقة لإكمال العملية.',
            { parse_mode: 'Markdown', disable_web_page_preview: true }
        );
        
        userState[ctx.chat.id] = 'waiting_for_oauth_code';
    } catch (error) {
        console.error('[Bot] خطأ في أمر refresh_token:', error);
        await ctx.reply('❌ حدث خطأ أثناء توليد رابط التفويض.');
    }
});

// أمر إعادة رفع الملفات الفاشلة
bot.command('reupload', async (ctx) => {
    try {
        const queueSize = getQueueSize();
        
        if (queueSize === 0) {
            await ctx.reply('✅ لا توجد ملفات في قائمة الانتظار.');
            return;
        }
        
        await ctx.reply(`🔄 جاري إعادة رفع ${queueSize} ملف...`);
        
        const results = await retryAllFailedUploads(bot);
        
        await ctx.reply(
            `📊 *نتائج إعادة الرفع:*\n\n` +
            `✅ نجح: ${results.success}\n` +
            `❌ فشل: ${results.failed}\n\n` +
            `المتبقي في القائمة: ${getQueueSize()}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('[Bot] خطأ في أمر reupload:', error);
        await ctx.reply('❌ حدث خطأ أثناء إعادة رفع الملفات.');
    }
});

// أمر عرض قائمة الانتظار
bot.command('queue', async (ctx) => {
    try {
        const queue = getFailedQueue();
        
        if (queue.length === 0) {
            await ctx.reply('✅ قائمة الانتظار فارغة.');
            return;
        }
        
        let message = `📋 *قائمة الملفات المنتظرة:* (${queue.length})\n\n`;
        
        queue.forEach((item, index) => {
            const fileName = item.filePath.split('/').pop();
            const age = Math.floor((Date.now() - item.timestamp) / 1000 / 60); // بالدقائق
            message += `${index + 1}. \`${fileName}\`\n`;
            message += `   👤 ${item.username} | ⏱️ منذ ${age} دقيقة | 🔄 ${item.attempts} محاولة\n\n`;
        });
        
        message += '\n💡 استخدم /reupload لإعادة رفع الملفات';
        
        await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('[Bot] خطأ في أمر queue:', error);
        await ctx.reply('❌ حدث خطأ أثناء عرض القائمة.');
    }
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
    
    // معالجة كود OAuth
    if (currentState === 'waiting_for_oauth_code') {
        delete userState[chatId];
        
        try {
            await ctx.reply('⏳ جاري معالجة الكود...');
            
            const refreshToken = await exchangeCodeForToken(chatId, username);
            await saveRefreshTokenToEnv(refreshToken);
            
            await ctx.reply(
                '✅ *تم تجديد Token بنجاح!*\n\n' +
                '🔄 جاري إعادة محاولة رفع الملفات الفاشلة...',
                { parse_mode: 'Markdown' }
            );
            
            // إعادة محاولة رفع الملفات الفاشلة تلقائياً
            const queueSize = getQueueSize();
            if (queueSize > 0) {
                const results = await retryAllFailedUploads(bot);
                await ctx.reply(
                    `📊 نتائج إعادة الرفع:\n` +
                    `✅ نجح: ${results.success}\n` +
                    `❌ فشل: ${results.failed}`
                );
            } else {
                await ctx.reply('ℹ️ لا توجد ملفات منتظرة للرفع.');
            }
            
        } catch (error) {
            console.error('[Bot] خطأ في معالجة OAuth code:', error);
            await ctx.reply(`❌ فشل تجديد Token:\n${error.message}`);
        }
        
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

        // ---  منطق محسّن مع حماية من حذف الملفات قبل رفعها ---
        recordLiveStream(streamUrl, username, controller.signal)
            .then(async (finalMp4Path) => {
                let uploadSuccessful = false;
                let driveResult = null;

                try {
                    // الخطوة 1: إعلام المستخدم بانتهاء التسجيل
                    await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `✅ انتهى التسجيل. جاري أرشفة الفيديو ومعالجته...`);
                    
                    // الخطوة 2: الرفع إلى Google Drive
                    console.log(`[Upload] 📤 بدء رفع الملف إلى Google Drive: ${finalMp4Path}`);
                    const driveResult = await uploadVideoToDrive(finalMp4Path, username);
                    
                    // ✅ تأكيد نجاح الرفع
                    uploadSuccessful = true;
                    console.log(`[Upload] ✅ تم رفع الملف بنجاح إلى Google Drive`);
                    
                    // إرسال رابط Google Drive فقط
                    await ctx.reply(
                        `✅ تم رفع الفيديو بنجاح!\n\n` +
                        `📁 اسم الملف: ${driveResult.name}\n` +
                        `📊 الحجم: ${(driveResult.size / 1024 / 1024).toFixed(2)} MB\n\n` +
                        `🔗 رابط المشاهدة والتحميل:\n${driveResult.directLink}\n\n` +
                        `💡 يمكنك مشاهدة الفيديو مباشرة أو تحميله من Google Drive`
                    );

                } catch (processingError) {
                    console.error("❌ خطأ أثناء الرفع أو الإرسال بعد التسجيل:", processingError);
                    
                    if (!uploadSuccessful) {
                        // التحقق من نوع الخطأ
                        const isTokenError = processingError.isTokenExpired || 
                                           (processingError.message && processingError.message.includes('invalid_grant'));
                        
                        // إضافة الملف إلى قائمة الانتظار
                        addToFailedQueue(finalMp4Path, username, ctx.chat.id);
                        
                        if (isTokenError) {
                            // خطأ Token - إرسال رابط تجديد
                            const oauthUrl = generateOAuthUrl(ctx.chat.id);
                            
                            await ctx.reply(
                                `🔐 *انتهت صلاحية Google Drive Token*\n\n` +
                                `📁 تم الاحتفاظ بالملف وإضافته لقائمة الانتظار\n` +
                                `📊 الملفات المنتظرة: ${getQueueSize()}\n\n` +
                                `⚡ *لتجديد Token والرفع التلقائي:*\n` +
                                `1️⃣ [اضغط هنا للتفويض](${oauthUrl})\n` +
                                `2️⃣ سجل الدخول بحساب Google\n` +
                                `3️⃣ انسخ الكود وأرسله هنا\n\n` +
                                `💡 أو استخدم: /refresh_token`,
                                { parse_mode: 'Markdown', disable_web_page_preview: true }
                            );
                            
                            userState[ctx.chat.id] = 'waiting_for_oauth_code';
                        } else {
                            // خطأ آخر
                            await ctx.reply(
                                `⚠️ حدث خطأ أثناء رفع الفيديو.\n` +
                                `📁 تم إضافة الملف لقائمة الانتظار (${getQueueSize()} ملف)\n` +
                                `السبب: ${processingError.message}\n\n` +
                                `� استخدم /reupload لإعادة المحاولة`
                            );
                        }
                        
                        console.log(`[Safety] 🛡️ تم الاحتفاظ بالملف وإضافته للقائمة: ${finalMp4Path}`);
                        return; // الخروج بدون حذف الملف
                    } else {
                        // نجح الرفع
                        await ctx.reply(
                            `✅ تم رفع الفيديو بنجاح على Google Drive!\n` +
                            `🔗 الرابط: ${driveResult?.directLink}`
                        );
                    }
                } finally {
                    // الخطوة 5: الحذف فقط إذا تم الرفع بنجاح
                    if (uploadSuccessful && fs.existsSync(finalMp4Path)) {
                        console.log(`[Cleanup] 🗑️ حذف الملف المحلي بعد نجاح الرفع: ${finalMp4Path}`);
                        try {
                            fs.unlinkSync(finalMp4Path);
                            console.log(`[Cleanup] ✅ تم حذف الملف المحلي بنجاح`);
                        } catch (deleteError) {
                            console.error(`[Cleanup] ⚠️ فشل حذف الملف: ${deleteError.message}`);
                        }
                    }
                }
            })
            .catch(async (error) => {
                console.error(`❌ خطأ في عملية التسجيل لـ ${username}:`, error);
                await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `❌ حدث خطأ فادح أثناء تسجيل ${username}.`);
            })
            .finally(() => {
                // تنظيف حالة التسجيل
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