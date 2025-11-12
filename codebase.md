# .gitignore

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Video recordings and downloads
downloads/
*.mp4
*.flv
*.avi
*.mov
*.wmv
*.mkv

# Temporary files
tmp/
temp/
*.tmp
*.temp

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Project specific
recordings/
archived_videos/
processed_videos/

# Cloudinary temp files (if any)
cloudinary_temp/

# FFmpeg temporary files
ffmpeg_temp/
```

# check_live.js

```js
// استيراد مكتبة axios لإجراء طلبات الويب
const axios = require('axios');

/**
 * دالة للتحقق مما إذا كان مستخدم تيك توك في بث مباشر أم لا
 * @param {string} username - اسم المستخدم على تيك توك
 */
async function checkLiveStatus(username) {
    try {
        console.log(`[*] جاري التحقق من حالة المستخدم: ${username}...`);

        // --- الخطوة الأولى: الحصول على Room ID ---
        // تيك توك يتطلب "طلبات موقعة" معقدة. نستخدم واجهة برمجة تطبيقات (API) وسيطة
        // للحصول على رابط صالح لجلب معلومات المستخدم، بما في ذلك Room ID.
        const signedUrlResponse = await axios.get(`https://tikrec.com/tiktok/room/api/sign?unique_id=${username}`);
        const signedPath = signedUrlResponse.data.signed_path;

        if (!signedPath) {
            console.log(`[!] لم يتم العثور على المستخدم أو حدث خطأ أثناء الحصول على الرابط.`);
            return;
        }

        const tiktokApiUrl = `https://www.tiktok.com${signedPath}`;

        // الآن نستخدم الرابط الموقع لجلب معلومات المستخدم
        const roomInfoResponse = await axios.get(tiktokApiUrl, {
            // إضافة هيدر مقلد للمتصفح لتجنب الحظر
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });
        
        // استخراج Room ID من الرد
        // نستخدم optional chaining (?.) للتأكد من عدم حدوث خطأ إذا كانت البيانات غير موجودة
        const roomId = roomInfoResponse.data?.data?.user?.roomId;
        
        // إذا لم يكن هناك Room ID، فالمستخدم غالباً ليس في بث مباشر
        if (!roomId || roomId === "0") {
            console.log(`[-] المستخدم "${username}" ليس في بث مباشر حالياً.`);
            return;
        }

        console.log(`[*] تم العثور على Room ID: ${roomId}. جاري التحقق من حالة البث...`);

        // --- الخطوة الثانية: التحقق من أن الغرفة نشطة (is_room_alive) ---
        // هذه هي الخطوة النهائية للتأكد من أن البث فعال الآن
        const liveCheckUrl = `https://webcast.tiktok.com/webcast/room/check_alive/?aid=1988&room_ids=${roomId}`;
        const aliveCheckResponse = await axios.get(liveCheckUrl);
        
        const isLive = aliveCheckResponse.data?.data?.[0]?.alive;

        if (isLive) {
            console.log(`[+] المستخدم "${username}" في بث مباشر الآن! ✅`);
        } else {
            console.log(`[-] المستخدم "${username}" ليس في بث مباشر حالياً.`);
        }

    } catch (error) {
        // التعامل مع أي أخطاء قد تحدث (مشاكل في الشبكة، تغيير في API تيك توك، الخ)
        if (error.response) {
            // إذا كان الخطأ من الخادم (مثل 404, 500)
            console.error(`[!] حدث خطأ في الطلب: ${error.response.status} - ${error.response.statusText}`);
        } else {
            // إذا كان الخطأ في الشبكة أو أي شيء آخر
            console.error('[!] حدث خطأ:', error.message);
        }
    }
}

// --- نقطة بداية تشغيل السكربت ---

// الحصول على اسم المستخدم من سطر الأوامر
const username = process.argv[2];

// التحقق من أن المستخدم أدخل اسم مستخدم
if (!username) {
    console.log("Usage: node check_live.js <username>");
    console.log("Example: node check_live.js michele0303");
    process.exit(1); // الخروج من البرنامج
}

// استدعاء الدالة الرئيسية
checkLiveStatus(username);
```

# package.json

```json
{
  "name": "tiktok-recorder-bot",
  "version": "1.0.0",
  "description": "Telegram bot for recording TikTok live streams",
  "main": "src/bot.js",
  "scripts": {
    "start": "node src/bot.js",
    "dev": "nodemon src/bot.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "telegram",
    "bot",
    "tiktok",
    "recorder",
    "live-stream"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0",
    "cloudinary": "^2.8.0",
    "dotenv": "^16.3.1",
    "ffmpeg-static": "^5.2.0",
    "fluent-ffmpeg": "^2.1.2",
    "telegraf": "^4.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

```

# src/bot.js

```js
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
```

# src/config/env.js

```js

```

# src/core/recorder.service.js

```js
// استيراد مكتبات التعامل مع الملفات والمسارات
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { convertFlvToMp4 } = require('../utils/video.util');

/**
 * يقوم بتسجيل بث مباشر من تيك توك وحفظه كملف MP4.
 * @param {string} streamUrl - رابط بث FLV المباشر.
 * @param {string} username - اسم المستخدم (لتسمية الملف).
 * @param {AbortSignal} signal - إشارة لإلغاء عملية التحميل.
 * @returns {Promise<string>} المسار الكامل لملف MP4 المسجل بعد التحويل.
 */
async function recordLiveStream(streamUrl, username, signal) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const outputDir = path.join(__dirname, '..', '..', 'downloads');
    const tempFilePath = path.join(outputDir, `${username}_${timestamp}.flv`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const writer = fs.createWriteStream(tempFilePath);
    console.log(`[Recorder] بدء تسجيل المستخدم: ${username}...`);
    console.log(`[Recorder] سيتم حفظ الملف في: ${tempFilePath}`);

    try {
        const response = await axios({
            method: 'get',
            url: streamUrl,
            responseType: 'stream',
            signal, // تمرير إشارة الإلغاء إلى axios
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            const cleanup = () => {
                 // التأكد من إزالة المستمعين لتجنب تسريب الذاكرة
                writer.removeListener('finish', onFinish);
                writer.removeListener('error', onError);
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            };
            
            const onFinish = async () => {
                console.log(`[Recorder] انتهى التسجيل. حجم الملف المؤقت: ${(writer.bytesWritten / 1024 / 1024).toFixed(2)} MB`);
                try {
                    const finalMp4Path = await convertFlvToMp4(tempFilePath);
                    resolve(finalMp4Path);
                } catch (conversionError) {
                    reject(conversionError);
                }
            };
            
            const onError = (err) => {
                cleanup();
                console.error('[Recorder] حدث خطأ أثناء كتابة الملف:', err);
                reject(err);
            };

            signal.addEventListener('abort', () => {
                console.log(`[Recorder] تم طلب إيقاف التسجيل للمستخدم: ${username}`);
                writer.end(); // إنهاء الكتابة في الملف
                response.data.destroy(); // إيقاف تحميل البيانات
                // لا نرفض البروميس هنا، بل نتركه ينتهي بشكل طبيعي عبر 'finish'
            });

            writer.on('finish', onFinish);
            writer.on('error', onError);
        });
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('[Recorder] تم إلغاء طلب التحميل بنجاح.');
            // إذا كان الإلغاء ناجحًا، يجب أن نحول ما تم تحميله
             return convertFlvToMp4(tempFilePath);
        }
        writer.close();
         if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        throw new Error('فشل الاتصال برابط البث.');
    }
}

module.exports = { recordLiveStream };
```

# src/index.js

```js

```

# src/services/cloudinary.service.js

```js
// استيراد مكتبة cloudinary
const cloudinary = require('cloudinary');
// استيراد dotenv للتأكد من تحميل متغيرات البيئة
require('dotenv').config();

// إعداد Cloudinary باستخدام متغيرات البيئة
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * يقوم برفع ملف فيديو إلى Cloudinary.
 * @param {string} filePath - المسار المحلي لملف الفيديو.
 * @param {string} publicId - اسم فريد للملف على Cloudinary (مثل اسم المستخدم).
 * @returns {Promise<object>} كائن يحتوي على معلومات الفيديو المرفوع، بما في ذلك الرابط الآمن.
 */
async function uploadVideo(filePath, publicId) {
    try {
        console.log(`[Cloudinary] بدء رفع الملف: ${filePath}`);
        
        // استدعاء دالة الرفع من Cloudinary
        const result = await cloudinary.v2.uploader.upload(filePath, {
            resource_type: "video", // تحديد نوع المورد كـ "فيديو" (مهم جدًا)
            public_id: `tiktok_records/${publicId}_${Date.now()}`, // تنظيم الملفات في مجلد
            overwrite: true,
        });

        console.log(`[Cloudinary] تم الرفع بنجاح. الرابط: ${result.secure_url}`);
        return result;

    } catch (error) {
        console.error("[Cloudinary] حدث خطأ أثناء الرفع:", error);
        // إلقاء الخطأ للسماح للكود الذي استدعى الدالة بالتعامل معه
        throw error;
    }
}

module.exports = {
    uploadVideo
};
```

# src/services/tiktok.service.js

```js
const axios = require('axios');
// --- تطبيق مبدأ DRY ---
// إنشاء نسخة من axios مهيأة مسبقًا لاستخدامها في جميع الطلبات
// هذا يمنع تكرار كتابة الهيدرز (Headers) في كل مرة
const apiClient = axios.create({
headers: {
// تزييف 'User-Agent' لتقليد متصفح حقيقي وتجنب الحظر
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
}
});
/**
يجلب Room ID الخاص ببث المستخدم المباشر.
@param {string} username - اسم المستخدم على تيك توك.
@returns {Promise<string|null>} Room ID إذا كان المستخدم في بث، وإلا null.
*/
async function getRoomId(username) {
try {
// الخطوة 1: نستخدم خدمة وسيطة للحصول على رابط موقّع صالح
const signResponse = await apiClient.get(`https://tikrec.com/tiktok/room/api/sign?unique_id=${username}`);
const signedPath = signResponse.data.signed_path;
if (!signedPath) {
     // إذا لم يتم العثور على المسار، فربما اسم المستخدم غير صحيح
     throw new Error(`لم يتم العثور على مسار موقّع للمستخدم: ${username}`);
 }

 const tiktokApiUrl = `https://www.tiktok.com${signedPath}`;

 // الخطوة 2: نستخدم الرابط الموقّع لجلب معلومات المستخدم من تيك توك
 const roomInfoResponse = await apiClient.get(tiktokApiUrl);
 
 // استخراج Room ID. نستخدم optional chaining (?.) لضمان عدم حدوث خطأ
 const roomId = roomInfoResponse.data?.data?.user?.roomId;
 
 // إذا كان Room ID غير موجود أو قيمته "0"، فالمستخدم ليس في بث مباشر
 if (!roomId || roomId === "0") {
     return null;
 }

 return roomId;
} catch (error) {
console.error(`[TikTok Service] خطأ في getRoomId للمستخدم ${username}:`, error.message);
// إرجاع null للإشارة إلى فشل العملية
return null;
}
}
/**
يتحقق مما إذا كانت غرفة البث المباشر نشطة حاليًا.
@param {string} roomId - الـ Room ID الخاص بالبث.
@returns {Promise<boolean>} true إذا كان البث مباشرًا، وإلا false.
*/
async function isUserLive(roomId) {
try {
const liveCheckUrl = `https://webcast.tiktok.com/webcast/room/check_alive/?aid=1988&room_ids=${roomId}`;
const response = await apiClient.get(liveCheckUrl);
// التحقق من أن البيانات موجودة وأن حالة البث 'alive'
 const isLive = response.data?.data?.[0]?.alive ?? false;

 return isLive;
} catch (error) {
console.error(`[TikTok Service] خطأ في isUserLive للغرفة ${roomId}:`, error.message);
return false;
}
}
/**
يجلب رابط تحميل البث المباشر (FLV Stream URL).
@param {string} roomId - الـ Room ID الخاص بالبث.
@returns {Promise<string|null>} رابط البث إذا وجد، وإلا null.
*/
async function getLiveStreamUrl(roomId) {
try {
const roomInfoUrl = `https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=${roomId}`;
const response = await apiClient.get(roomInfoUrl);
// رابط البث موجود في مكان عميق داخل بيانات الرد
 const streamDataString = response.data?.data?.stream_url?.live_core_sdk_data?.pull_data?.stream_data;
 if (!streamDataString) {
      // طريقة احتياطية في حال غيرت تيك توك الـ API
      const flvUrl = response.data?.data?.stream_url?.flv_pull_url?.FULL_HD1;
      if(flvUrl) return flvUrl;

     throw new Error('لم يتم العثور على بيانات البث (stream_data).');
 }

 // البيانات تأتي على شكل نص JSON داخل نص JSON آخر، لذا نحتاج لتحليلها
 const streamData = JSON.parse(streamDataString);
 
 // استخراج رابط FLV بأفضل جودة متاحة
 const streamUrl = streamData?.data?.origin?.main?.flv;
 
 if (!streamUrl) {
     throw new Error('لم يتم العثور على رابط FLV في بيانات البث.');
 }

 return streamUrl;
} catch (error) {
console.error(`[TikTok Service] خطأ في getLiveStreamUrl للغرفة ${roomId}:`, error.message);
return null;
}
}
// تصدير الدوال لجعلها متاحة للاستخدام في ملفات أخرى
module.exports = {
getRoomId,
isUserLive,
getLiveStreamUrl,
};
```

# src/utils/logger.util.js

```js

```

# src/utils/video.util.js

```js
// استيراد مكتبات التعامل مع المسارات والملفات
const fs = require('fs');
const path = require('path');

// استيراد مكتبة FFmpeg
const ffmpeg = require('fluent-ffmpeg');
// تحديد مسار FFmpeg الثابت الذي قمنا بتثبيته
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * يحول ملف فيديو من صيغة FLV إلى MP4.
 * @param {string} flvFilePath - المسار الكامل لملف FLV المدخل.
 * @returns {Promise<string>} المسار الكامل لملف MP4 الناتج.
 */
function convertFlvToMp4(flvFilePath) {
    // نغلف العملية داخل Promise للتعامل معها بشكل غير متزامن
    return new Promise((resolve, reject) => {
        // تحديد مسار واسم الملف الناتج (نفس الاسم ولكن بصيغة mp4)
        const outputFilePath = flvFilePath.replace('.flv', '.mp4');

        console.log(`[FFmpeg] بدء تحويل الملف: ${path.basename(flvFilePath)}`);

        ffmpeg(flvFilePath)
            // استخدام 'copy' codec لنسخ مسارات الفيديو والصوت بدون إعادة ترميز
            // هذا يجعل العملية سريعة جدًا ويحافظ على الجودة الأصلية
            .videoCodec('copy')
            .audioCodec('copy')
            
            // عند انتهاء التحويل بنجاح
            .on('end', () => {
                console.log(`[FFmpeg] انتهى التحويل بنجاح: ${path.basename(outputFilePath)}`);
                // حذف ملف FLV الأصلي لتوفير المساحة
                fs.unlink(flvFilePath, (err) => {
                    if (err) console.error(`[FS] لم يتمكن من حذف الملف المؤقت ${flvFilePath}:`, err);
                });
                // إرجاع مسار الملف النهائي
                resolve(outputFilePath);
            })
            // عند حدوث خطأ أثناء التحويل
            .on('error', (err) => {
                console.error('[FFmpeg] حدث خطأ أثناء التحويل:', err);
                reject(err);
            })
            // حفظ الملف الناتج
            .save(outputFilePath);
    });
}

module.exports = {
    convertFlvToMp4
};
```

