const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
const fs = require('fs');
require('dotenv').config();

const tiktokService = require('./services/tiktok.service');
const recorderService = require('./core/recorder.service');
const cloudinaryService = require('./services/cloudinary.service');

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN في ملف .env');
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const userState = {};
const activeRecordings = {}; // لتتبع التسجيلات النشطة

const CHECK_STATUS_BTN = '🔍 فحص حالة البث';
const RECORD_LIVE_BTN = '🔴 بدء تسجيل بث';

const mainKeyboard = Markup.keyboard([
    [CHECK_STATUS_BTN],
    [RECORD_LIVE_BTN]
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

// معالج زر إيقاف التسجيل
bot.action(/stop_record_(.+)/, (ctx) => {
    const username = ctx.match[1];
    const recording = activeRecordings[username];

    if (recording && recording.controller) {
        ctx.answerCbQuery(`جاري إيقاف تسجيل ${username}...`);
        recording.controller.abort(); // إرسال إشارة الإيقاف
        delete activeRecordings[username];
        ctx.editMessageText(`تم طلب إيقاف التسجيل للمستخدم ${username}. سيتم إرسال الفيديو المسجل قريبًا.`);
    } else {
        ctx.answerCbQuery('لم يتم العثور على عملية تسجيل نشطة لهذا المستخدم.');
    }
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
    }
});

async function handleCheckStatus(ctx, username) {
    await ctx.reply(`جاري فحص حالة المستخدم "${username}"...`);
    try {
        const roomId = await tiktokService.getRoomId(username);
        if (!roomId || !(await tiktokService.isUserLive(roomId))) {
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
    // التحقق مما إذا كان هناك تسجيل جاري لنفس المستخدم
    if (activeRecordings[username]) {
        await ctx.reply(`يوجد بالفعل عملية تسجيل جارية للمستخدم ${username}.`);
        return;
    }

    const checkingMsg = await ctx.reply(`جاري التحقق من حالة ${username} قبل بدء التسجيل...`);
    
    try {
        // 1. التحقق من أن المستخدم في بث مباشر
        const roomId = await tiktokService.getRoomId(username);
        if (!roomId || !(await tiktokService.isUserLive(roomId))) {
            await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, `❌ لا يمكن بدء التسجيل. المستخدم "${username}" ليس في بث مباشر حالياً.`);
            return;
        }

        // 2. جلب رابط البث
        const streamUrl = await tiktokService.getLiveStreamUrl(roomId);
        if (!streamUrl) {
            await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, 'حدث خطأ: لم يتم العثور على رابط البث.');
            return;
        }

        const controller = new AbortController();
        const stopButton = Markup.inlineKeyboard([
            Markup.button.callback('⏹️ إيقاف التسجيل', `stop_record_${username}`)
        ]);

        const recordingMsg = await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, `🔴 بدأ تسجيل البث للمستخدم ${username}...`, stopButton);
        
        // حفظ معلومات العملية
        activeRecordings[username] = { controller, messageId: recordingMsg.message_id };

        // 3. بدء التسجيل (لا نستخدم await هنا لتجنب حجب البوت)
        recorderService.recordLiveStream(streamUrl, username, controller.signal)
            .then(async (finalMp4Path) => {
                try {
                    // 1. إعلام المستخدم بانتهاء التسجيل والبدء في الرفع
                    await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `✅ انتهى التسجيل. جاري رفع الفيديو إلى تليجرام...`);
                    
                    // 2. رفع الفيديو إلى تليجرام
                    await ctx.replyWithVideo({ source: finalMp4Path });

                    // 3. إعلام المستخدم بالبدء في الرفع إلى Cloudinary
                    await ctx.reply('تم الرفع إلى تليجرام بنجاح. جاري الآن أرشفة الفيديو على Cloudinary...');
                    
                    // 4. رفع الفيديو إلى Cloudinary
                    const cloudinaryResult = await cloudinaryService.uploadVideo(finalMp4Path, username);

                    // 5. إرسال تأكيد ورابط Cloudinary
                    await ctx.reply(`☁️ تمت أرشفة الفيديو بنجاح!\nالرابط الدائم: ${cloudinaryResult.secure_url}`);

                } catch (uploadError) {
                    // التعامل مع أخطاء الرفع
                    console.error("خطأ أثناء الرفع (تليجرام أو Cloudinary):", uploadError);
                    await ctx.reply('حدث خطأ أثناء رفع الفيديو بعد تسجيله.');
                } finally {
                    // 6. حذف الملف المحلي في كل الحالات (نجاح أو فشل الرفع)
                    // طالما أن التسجيل نفسه قد نجح
                    console.log(`[FS] جاري حذف الملف المحلي: ${finalMp4Path}`);
                    fs.unlinkSync(finalMp4Path);
                }
            })
            .catch(async (error) => {
                // 5. في حالة حدوث خطأ
                console.error(`خطأ في عملية التسجيل لـ ${username}:`, error);
                await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `حدث خطأ أثناء تسجيل ${username}.`);
            })
            .finally(() => {
                // 6. تنظيف الحالة بغض النظر عن النتيجة
                delete activeRecordings[username];
            });

    } catch (error) {
        console.error(error);
        await bot.telegram.editMessageText(ctx.chat.id, checkingMsg.message_id, undefined, 'حدث خطأ عام أثناء محاولة بدء التسجيل.');
    }
}

bot.launch();
console.log('البوت يعمل الآن...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));