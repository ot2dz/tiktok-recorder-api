import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import fs from 'fs';
import 'dotenv/config';

import { getRoomId, isUserLive, getLiveStreamUrl } from './services/tiktok.service.js';
import { recordLiveStream } from './core/recorder.service.js';
import { uploadVideo } from './services/cloudinary.service.js';
import { setupDatabase, addUserToMonitor, removeUserFromMonitor, getMonitoredUsers } from './services/db.service.js';
import { startMonitoring, currentlyRecording } from './core/monitoring.service.js';
import { BOT_BUTTONS, ERROR_MESSAGES, FILE_CONFIG } from './config/constants.js';

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error(ERROR_MESSAGES.MISSING_TOKEN);
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const userState = {};
const activeRecordings = {};

const mainKeyboard = Markup.keyboard([
    [BOT_BUTTONS.CHECK_STATUS, BOT_BUTTONS.RECORD_LIVE],
    [BOT_BUTTONS.MANAGE_MONITOR]
]).resize();


bot.start((ctx) => {
    ctx.reply(
        'أهلاً بك! اختر أحد الخيارات من القائمة للبدء.',
        mainKeyboard
    );
});

bot.hears(BOT_BUTTONS.CHECK_STATUS, (ctx) => {
    userState[ctx.chat.id] = 'check_status';
    ctx.reply('حسناً، أرسل الآن اسم المستخدم على تيك توك الذي تريد فحصه.');
});

bot.hears(BOT_BUTTONS.RECORD_LIVE, (ctx) => {
    userState[ctx.chat.id] = 'record_live';
    ctx.reply('حسناً، أرسل الآن اسم المستخدم على تيك توك الذي تريد بدء تسجيله.');
});

bot.hears(BOT_BUTTONS.MANAGE_MONITOR, (ctx) => {
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
        case 'add_monitor': {
            const validatedUsername = validateUsername(username);
            if (!validatedUsername) {
                await ctx.reply('❌ اسم المستخدم غير صالح. يرجى استخدام أحرف وأرقام فقط.');
                return;
            }
            await addUserToMonitor(validatedUsername, chatId);
            await ctx.reply(`✅ تم إضافة المستخدم "${validatedUsername}" إلى قائمة المراقبة.`);
            break;
        }
        case 'remove_monitor': {
            const validatedUsername = validateUsername(username);
            if (!validatedUsername) {
                await ctx.reply('❌ اسم المستخدم غير صالح.');
                return;
            }
            await removeUserFromMonitor(validatedUsername, chatId);
            await ctx.reply(`🗑️ تم حذف المستخدم "${validatedUsername}" من قائمة المراقبة.`);
            break;
        }
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

/**
 * Validates and sanitizes a TikTok username
 * @param {string} username - The username to validate
 * @returns {string|null} Sanitized username or null if invalid
 */
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return null;
    }
    // Remove potentially dangerous characters and limit length
    const sanitized = username.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, FILE_CONFIG.MAX_USERNAME_LENGTH);
    return sanitized.length > 0 ? sanitized : null;
}

/**
 * Handles checking the live status of a TikTok user
 * @param {Context} ctx - Telegram context
 * @param {string} username - TikTok username
 */
async function handleCheckStatus(ctx, username) {
    const validatedUsername = validateUsername(username);
    if (!validatedUsername) {
        await ctx.reply(ERROR_MESSAGES.INVALID_USERNAME);
        return;
    }

    await ctx.reply(`جاري فحص حالة المستخدم "${validatedUsername}"...`);
    try {
        const roomId = await getRoomId(validatedUsername);

        if (!roomId || !(await isUserLive(roomId))) {
            await ctx.reply(`❌ المستخدم "${validatedUsername}" ${ERROR_MESSAGES.NOT_LIVE}`);
            return;
        }
        await ctx.reply(`✅ المستخدم "${validatedUsername}" في بث مباشر الآن!`);
    } catch (error) {
        console.error('[Bot] Error in handleCheckStatus:', error);
        await ctx.reply(ERROR_MESSAGES.GENERAL_ERROR);
    }
}


/**
 * Handles recording a live stream
 * @param {Context} ctx - Telegram context
 * @param {string} username - TikTok username
 */
async function handleRecordLive(ctx, username) {
    const validatedUsername = validateUsername(username);
    if (!validatedUsername) {
        await ctx.reply(ERROR_MESSAGES.INVALID_USERNAME);
        return;
    }

    if (activeRecordings[validatedUsername]) {
        await ctx.reply(`${ERROR_MESSAGES.RECORDING_IN_PROGRESS} ${validatedUsername}.`);
        return;
    }

    const checkingMsg = await ctx.reply(`جاري التحقق من حالة ${validatedUsername} قبل بدء التسجيل...`);
    
    try {
        const roomId = await getRoomId(validatedUsername);
        if (!roomId || !(await isUserLive(roomId))) {
            await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, `❌ لا يمكن بدء التسجيل. المستخدم "${validatedUsername}" ${ERROR_MESSAGES.NOT_LIVE}`);
            return;
        }

        const streamUrl = await getLiveStreamUrl(roomId);
        if (!streamUrl) {
            await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, ERROR_MESSAGES.STREAM_NOT_FOUND);
            return;
        }

        const controller = new AbortController();
        const stopButton = Markup.inlineKeyboard([
            Markup.button.callback('⏹️ إيقاف التسجيل', `stop_record_${validatedUsername}`)
        ]);

        const recordingMsg = await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, `🔴 بدأ تسجيل البث للمستخدم ${validatedUsername}...`, stopButton);
        
        activeRecordings[validatedUsername] = { controller, messageId: recordingMsg.message_id, chatId: ctx.chat.id };

        recordLiveStream(streamUrl, validatedUsername, controller.signal)
            .then(async (finalMp4Path) => {
                await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `✅ انتهى التسجيل. جاري رفع الفيديو إلى تليجرام...`);
                await ctx.replyWithVideo({ source: finalMp4Path });
                await ctx.reply('تم الرفع إلى تليجرام بنجاح. جاري الآن أرشفة الفيديو على Cloudinary...');
                
                try {
                    const cloudinaryResult = await uploadVideo(finalMp4Path, validatedUsername);
                    await ctx.reply(`☁️ تمت أرشفة الفيديو بنجاح!\nالرابط الدائم: ${cloudinaryResult.secure_url}`);
                } catch (cloudinaryError) {
                    console.error('[Bot] Cloudinary upload failed:', cloudinaryError);
                    await ctx.reply('⚠️ تم إرسال الفيديو بنجاح ولكن فشلت الأرشفة على Cloudinary.');
                }
                
                // Safe file deletion with error handling
                try {
                    fs.unlinkSync(finalMp4Path);
                } catch (unlinkError) {
                    console.error('[Bot] Failed to delete file:', unlinkError);
                }
            })
            .catch(async (error) => {
                console.error(`[Bot] Error recording ${validatedUsername}:`, error);
                await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `حدث خطأ أثناء تسجيل ${validatedUsername}.`);
            })
            .finally(() => {
                delete activeRecordings[validatedUsername];
                if (currentlyRecording.has(validatedUsername)) {
                    currentlyRecording.delete(validatedUsername);
                }
            });

    } catch (error) {
        console.error('[Bot] Error in handleRecordLive:', error);
        await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, ERROR_MESSAGES.GENERAL_ERROR);
    }
}

/**
 * Initializes and starts the bot application
 */
async function startApp() {
    try {
        await setupDatabase();
        startMonitoring(bot, handleRecordLive);
        bot.launch();
        console.log('البوت وخدمة المراقبة يعملان الآن...');
        
        // Graceful shutdown handlers
        const shutdown = async (signal) => {
            console.log(`[Shutdown] Received ${signal}, shutting down gracefully...`);
            
            // Stop accepting new updates
            bot.stop(signal);
            
            // Clean up active recordings
            for (const [username, recording] of Object.entries(activeRecordings)) {
                console.log(`[Shutdown] Stopping recording for ${username}`);
                recording.controller.abort();
            }
            
            console.log('[Shutdown] Cleanup complete. Exiting...');
            process.exit(0);
        };
        
        process.once('SIGINT', () => shutdown('SIGINT'));
        process.once('SIGTERM', () => shutdown('SIGTERM'));
    } catch (error) {
        console.error("[Startup] Failed to start application:", error);
        process.exit(1);
    }
}

startApp();

export { handleRecordLive };