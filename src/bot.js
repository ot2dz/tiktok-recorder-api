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
import { setupDatabase, addUserToMonitor, removeUserFromMonitor, getMonitoredUsers, addFailedUpload, getFailedUploadsByChatId, removeFailedUpload, incrementFailedUploadAttempts, getTokenStatus, updateUploadStats } from './services/db.service.js';
import { startMonitoring, currentlyRecording } from './core/monitoring.service.js';
import { generateOAuthUrl, exchangeCodeForToken, saveRefreshToken, pendingOAuthStates } from './services/oauth-telegram.service.js';


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
        '/failed_videos - عرض الفيديوهات الفاشلة\n' +
        '/update_token - تحديث Google Drive Token\n' +
        '/token_status - حالة Token',
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

// أمر تحديث Token
bot.command('update_token', async (ctx) => {
    try {
        const authUrl = generateOAuthUrl(ctx.chat.id);
        
        await ctx.reply(
            '🔐 *تحديث Google Drive Token*\n\n' +
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
        console.error('[Bot] خطأ في أمر update_token:', error);
        await ctx.reply('❌ حدث خطأ أثناء توليد رابط التفويض.');
    }
});

// أمر عرض الفيديوهات الفاشلة
bot.command('failed_videos', async (ctx) => {
    try {
        const failedVideos = await getFailedUploadsByChatId(ctx.chat.id);
        
        if (failedVideos.length === 0) {
            await ctx.reply('✅ لا توجد فيديوهات فاشلة في قائمة الانتظار.');
            return;
        }
        
        let message = `� *قائمة الفيديوهات الفاشلة* (${failedVideos.length})\n\n`;
        
        const buttons = [];
        
        failedVideos.forEach((video, index) => {
            const fileName = video.filepath.split('/').pop();
            const failedDate = new Date(video.failedAt).toLocaleString('ar-EG');
            
            message += `${index + 1}️⃣ \`${fileName}\`\n`;
            message += `   � حجم: ${video.fileSize}\n`;
            message += `   ⏰ تاريخ: ${failedDate}\n`;
            message += `   ❌ سبب: ${video.error}\n`;
            message += `   🔄 محاولات: ${video.attempts}\n\n`;
            
            // إضافة أزرار لكل فيديو
            buttons.push([
                Markup.button.callback(`🔄 إعادة رفع #${index + 1}`, `retry_${video.id}`),
                Markup.button.callback(`🗑️ حذف #${index + 1}`, `delete_${video.id}`)
            ]);
        });
        
        // أزرار إضافية
        buttons.push([
            Markup.button.callback('🔄 إعادة رفع الكل', 'retry_all'),
            Markup.button.callback('🗑️ حذف الكل', 'delete_all')
        ]);
        
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons)
        });
    } catch (error) {
        console.error('[Bot] خطأ في أمر failed_videos:', error);
        await ctx.reply('❌ حدث خطأ أثناء عرض القائمة.');
    }
});

// أمر عرض حالة Token
bot.command('token_status', async (ctx) => {
    try {
        const status = await getTokenStatus();
        
        const statusEmoji = status.hasToken ? '✅' : '❌';
        const statusText = status.hasToken ? 'نشط' : 'غير موجود';
        
        const lastUpdated = status.lastUpdated 
            ? new Date(status.lastUpdated).toLocaleString('ar-EG')
            : 'غير معروف';
            
        const lastUsed = status.lastUsed
            ? new Date(status.lastUsed).toLocaleString('ar-EG')
            : 'لم يُستخدم بعد';
        
        const failedCount = await getFailedUploadsByChatId(ctx.chat.id);
        
        const message = 
            `📊 *حالة Google Drive Token*\n\n` +
            `الحالة: ${statusEmoji} ${statusText}\n` +
            `آخر تحديث: ${lastUpdated}\n` +
            `آخر استخدام: ${lastUsed}\n\n` +
            `📈 *الإحصائيات:*\n` +
            `✅ رفع ناجح: ${status.stats.successfulUploads}\n` +
            `❌ رفع فاشل: ${status.stats.failedUploads}\n` +
            `� إجمالي: ${status.stats.totalUploads}\n\n` +
            `🎬 فيديوهات فاشلة حالياً: ${failedCount.length}`;
        
        const buttons = [];
        if (!status.hasToken) {
            buttons.push([Markup.button.callback('� تحديث Token', 'update_token_now')]);
        }
        if (failedCount.length > 0) {
            buttons.push([Markup.button.callback('📋 عرض الفيديوهات الفاشلة', 'show_failed')]);
        }
        
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons)
        });
    } catch (error) {
        console.error('[Bot] خطأ في أمر token_status:', error);
        await ctx.reply('❌ حدث خطأ أثناء جلب حالة Token.');
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

// ===== معالجات الأزرار للفيديوهات الفاشلة =====

// زر إعادة رفع فيديو واحد
bot.action(/^retry_(.+)$/, async (ctx) => {
    const videoId = ctx.match[1];
    
    if (videoId === 'all') {
        // إعادة رفع الكل
        const failedVideos = await getFailedUploadsByChatId(ctx.chat.id);
        if (failedVideos.length === 0) {
            await ctx.answerCbQuery('لا توجد فيديوهات للرفع');
            return;
        }
        
        await ctx.answerCbQuery(`جاري إعادة رفع ${failedVideos.length} فيديو...`);
        await retryUploadVideos(failedVideos, ctx);
    } else {
        // إعادة رفع فيديو واحد
        const failedVideos = await getFailedUploadsByChatId(ctx.chat.id);
        const video = failedVideos.find(v => v.id === videoId);
        
        if (!video) {
            await ctx.answerCbQuery('الفيديو غير موجود');
            return;
        }
        
        await ctx.answerCbQuery('جاري إعادة الرفع...');
        await retryUploadVideos([video], ctx);
    }
});

// زر حذف فيديو
bot.action(/^delete_(.+)$/, async (ctx) => {
    const videoId = ctx.match[1];
    
    if (videoId === 'all') {
        // حذف الكل
        const failedVideos = await getFailedUploadsByChatId(ctx.chat.id);
        for (const video of failedVideos) {
            await removeFailedUpload(video.id);
        }
        await ctx.answerCbQuery(`تم حذف ${failedVideos.length} فيديو`);
        await ctx.editMessageText('✅ تم حذف جميع الفيديوهات الفاشلة');
    } else {
        // حذف فيديو واحد
        await removeFailedUpload(videoId);
        await ctx.answerCbQuery('تم الحذف');
        
        // تحديث القائمة
        const failedVideos = await getFailedUploadsByChatId(ctx.chat.id);
        if (failedVideos.length === 0) {
            await ctx.editMessageText('✅ لا توجد فيديوهات فاشلة');
        }
    }
});

// زر تحديث Token
bot.action('update_token_now', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.deleteMessage();
    // إعادة توجيه لأمر update_token
    bot.command('update_token')(ctx);
});

// زر عرض الفيديوهات الفاشلة
bot.action('show_failed', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.deleteMessage();
    // إعادة توجيه لأمر failed_videos
    bot.command('failed_videos')(ctx);
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
            await saveRefreshToken(refreshToken);
            
            await ctx.reply(
                '✅ *تم تحديث Token بنجاح!*\n\n' +
                '🔄 هل تريد إعادة رفع الفيديوهات الفاشلة؟',
                {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback('✅ نعم، أعد الرفع', 'retry_all')],
                        [Markup.button.callback('❌ لا، لاحقاً', 'cancel_retry')]
                    ])
                }
            );
            
        } catch (error) {
            console.error('[Bot] خطأ في معالجة OAuth code:', error);
            await ctx.reply(`❌ فشل تحديث Token:\n${error.message}`);
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
                    
                    // تحديث الإحصائيات
                    await updateUploadStats(true);
                    
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
                        
                        // حساب حجم الملف
                        const fileStats = fs.existsSync(finalMp4Path) ? fs.statSync(finalMp4Path) : null;
                        const fileSize = fileStats ? `${(fileStats.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
                        
                        // إضافة الملف إلى قائمة الانتظار في DB
                        await addFailedUpload({
                            username,
                            filepath: finalMp4Path,
                            chatId: ctx.chat.id,
                            error: processingError.message || 'Unknown error',
                            fileSize,
                            attempts: 0
                        });
                        
                        if (isTokenError) {
                            // خطأ Token - إرسال رابط تجديد
                            const oauthUrl = generateOAuthUrl(ctx.chat.id);
                            
                            await ctx.reply(
                                `🔐 *انتهت صلاحية Google Drive Token*\n\n` +
                                `📁 تم حفظ الفيديو وإضافته لقائمة الانتظار\n` +
                                `� الحجم: ${fileSize}\n\n` +
                                `⚡ *لتجديد Token والرفع التلقائي:*\n` +
                                `1️⃣ [اضغط هنا للتفويض](${oauthUrl})\n` +
                                `2️⃣ سجل الدخول بحساب Google\n` +
                                `3️⃣ انسخ الكود وأرسله هنا\n\n` +
                                `💡 أو استخدم: /update_token`,
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

// دالة مساعدة لإعادة رفع الفيديوهات
async function retryUploadVideos(videos, ctx) {
    let successCount = 0;
    let failedCount = 0;
    
    for (const video of videos) {
        // التحقق من وجود الملف
        if (!fs.existsSync(video.filepath)) {
            console.log(`[Retry] ❌ الملف غير موجود: ${video.filepath}`);
            await removeFailedUpload(video.id);
            failedCount++;
            await ctx.reply(`❌ الملف غير موجود: ${video.filepath.split('/').pop()}`);
            continue;
        }
        
        // تحديث عدد المحاولات
        await incrementFailedUploadAttempts(video.id);
        
        try {
            await ctx.reply(`🔄 جاري رفع: ${video.filepath.split('/').pop()}...`);
            
            // محاولة الرفع
            const driveResult = await uploadVideoToDrive(video.filepath, video.username);
            
            // نجح الرفع
            console.log(`[Retry] ✅ تم رفع الملف بنجاح: ${video.filepath}`);
            await updateUploadStats(true);
            
            await ctx.reply(
                `✅ تم رفع الفيديو بنجاح!\n\n` +
                `📁 اسم الملف: ${driveResult.name}\n` +
                `📊 الحجم: ${(driveResult.size / 1024 / 1024).toFixed(2)} MB\n\n` +
                `🔗 رابط المشاهدة:\n${driveResult.directLink}`
            );
            
            // حذف الملف المحلي بعد نجاح الرفع
            try {
                fs.unlinkSync(video.filepath);
                console.log(`[Retry] 🗑️ تم حذف الملف المحلي: ${video.filepath}`);
            } catch (deleteError) {
                console.error(`[Retry] ⚠️ فشل حذف الملف: ${deleteError.message}`);
            }
            
            // إزالة من قائمة الانتظار
            await removeFailedUpload(video.id);
            successCount++;
            
        } catch (error) {
            console.error(`[Retry] ❌ فشل رفع الملف: ${video.filepath}`, error.message);
            failedCount++;
            
            await ctx.reply(
                `❌ فشل رفع: ${video.filepath.split('/').pop()}\n` +
                `السبب: ${error.message}`
            );
        }
    }
    
    // إرسال ملخص نهائي
    await ctx.reply(
        `📊 *ملخص إعادة الرفع:*\n\n` +
        `✅ نجح: ${successCount}\n` +
        `❌ فشل: ${failedCount}\n` +
        `📦 إجمالي: ${videos.length}`,
        { parse_mode: 'Markdown' }
    );
}

// زر إلغاء إعادة الرفع
bot.action('cancel_retry', async (ctx) => {
    await ctx.answerCbQuery('تم الإلغاء');
    await ctx.editMessageText('✅ تم إلغاء إعادة الرفع. يمكنك استخدام /failed_videos لاحقاً.');
});

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