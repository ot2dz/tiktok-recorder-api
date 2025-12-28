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

token.json
oauth-credentials.json
google-credentials.json
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

# CHANGELOG.md

```md
# 📝 سجل التغييرات (Changelog)

جميع التغييرات المهمة في هذا المشروع سيتم توثيقها في هذا الملف.

---

## [2.0.0] - 2025-12-04

### ✨ مميزات جديدة كبرى

#### 🔐 نظام إدارة Token محسّن
- **حفظ Token في قاعدة البيانات**: لم يعد Token محفوظاً في Environment Variables
- **تحديث Token من التليجرام**: يمكنك تحديث Token مباشرة من البوت بدون إعادة تشغيل
- **كشف تلقائي للأخطاء**: البوت يكتشف انتهاء Token تلقائياً ويرسل رابط التحديث
- **نقل تلقائي عند أول تشغيل**: ينقل Token من ENV إلى DB تلقائياً

#### 📊 نظام قائمة الانتظار الذكي
- **حفظ الفيديوهات الفاشلة**: جميع الفيديوهات التي فشل رفعها تُحفظ في قائمة انتظار
- **إعادة رفع مرنة**: يمكن إعادة رفع فيديو واحد أو جميع الفيديوهات دفعة واحدة
- **معلومات تفصيلية**: كل فيديو يحتوي على (التاريخ، الحجم، السبب، عدد المحاولات)
- **إحصائيات شاملة**: إحصائيات لكل عمليات الرفع (نجح/فشل/إجمالي)

#### 🎮 أوامر جديدة
- `/update_token` - تحديث Google Drive Refresh Token
- `/failed_videos` - عرض وإدارة الفيديوهات الفاشلة  
- `/token_status` - عرض حالة Token والإحصائيات

#### 🖱️ أزرار تفاعلية (Inline Buttons)
- أزرار لإعادة رفع/حذف فيديو واحد أو جميع الفيديوهات
- زر تحديث Token السريع
- زر إلغاء إعادة الرفع

#### 🐳 دعم محسّن لـ Docker/Coolify
- مسارات ديناميكية تكتشف بيئة Docker تلقائياً
- دعم Docker volumes الخاصة بـ Coolify
- يعمل محلياً وعلى السيرفر بدون تعديل الكود

### 🔄 تحسينات

#### قاعدة البيانات (db.json)
- **هيكل جديد منظم**:
  \`\`\`json
  {
    "settings": { /* إعدادات Token */ },
    "failedUploads": [ /* قائمة الفيديوهات الفاشلة */ ],
    "stats": { /* إحصائيات */ },
    "monitoredUsers": [ /* ... */ ]
  }
  \`\`\`

#### خدمة Drive
- قراءة Token من قاعدة البيانات بدلاً من ENV
- تحديث تلقائي لآخر استخدام ناجح
- رسائل خطأ أوضح ومفيدة أكثر

#### خدمة OAuth
- حفظ Token في DB بدلاً من ملف .env
- تنظيف تلقائي للـ OAuth states القديمة (كل 30 دقيقة)
- دعم إعادة المحاولة التلقائية بعد التحديث

### 🗑️ تم الإزالة
- ❌ ملف `upload-queue.service.js` (تم استبداله بنظام DB)
- ❌ دالة `saveRefreshTokenToEnv()` (لم تعد مطلوبة)
- ❌ أوامر `/refresh_token`, `/reupload`, `/queue` (تم استبدالها بأوامر أفضل)

### 📚 توثيق
- ✅ إضافة `README.md` شامل بالعربية
- ✅ إضافة `CHANGELOG.md` (هذا الملف)
- ✅ تحديث `GOOGLE_OAUTH_GUIDE.md`
- ✅ تحسين التعليقات في الكود

### 🐛 إصلاحات
- إصلاح مشكلة حذف الملفات قبل نجاح الرفع
- إصلاح مشكلة فقدان الملفات عند فشل الرفع
- إصلاح مشكلة مسار .env في Docker
- تحسين معالجة الأخطاء في جميع الخدمات

---

## [1.0.0] - 2025-11-30

### ✨ الإصدار الأول
- 🔴 تسجيل البث المباشر من TikTok
- ⚙️ مراقبة تلقائية للمستخدمين
- 📤 رفع تلقائي إلى Google Drive
- 🤖 بوت تليجرام تفاعلي
- 🎬 تحويل FLV إلى MP4
- 📊 لوحة تحكم بسيطة

---

## 🔜 الإصدارات القادمة

### [2.1.0] - قريباً
- [ ] ضغط الفيديوهات قبل الرفع (توفير المساحة)
- [ ] إشعارات عند اقتراب انتهاء Token
- [ ] تنظيف تلقائي للفيديوهات القديمة

### [2.2.0] - في المستقبل
- [ ] دعم أكثر من حساب Google Drive
- [ ] جدولة تسجيل تلقائية
- [ ] واجهة ويب للإدارة
- [ ] تشفير Token في قاعدة البيانات
- [ ] دعم Cloudflare R2 / AWS S3

---

## 📊 إحصائيات الإصدار

| الإصدار | الملفات المضافة | الملفات المعدلة | الأسطر المضافة | الأسطر المحذوفة |
|---------|-----------------|-----------------|----------------|------------------|
| 2.0.0   | 3               | 6               | +850           | -200             |
| 1.0.0   | 15              | -               | +1500          | -                |

---

## 🙏 شكر خاص

- المجتمع العربي للمطورين
- جميع من ساهم في الاختبار والإبلاغ عن الأخطاء

---

**للمزيد من المعلومات، راجع [README.md](README.md)**

```

# check_live.js

```js
// استيراد مكتبة axios لإجراء طلبات الويب
import axios from 'axios';

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

# db.json

```json
{
  "monitoredUsers": [
    {
      "username": "benz.marketing",
      "chatId": 1077656944,
      "isRecording": false
    }
  ],
  "settings": {
    "googleAccessToken": null,
    "tokenExpiryDate": null,
    "tokenLastUpdated": "2025-12-23T17:08:33.078Z",
    "tokenLastUsed": null
  },
  "failedUploads": [],
  "stats": {
    "totalUploads": 2,
    "successfulUploads": 2,
    "failedUploads": 0
  }
}
```

# extract_usernames_session.session

This is a binary file of the type: Binary

# leave_channels_session.session

This is a binary file of the type: Binary

# nodemon.json

```json
{
    "ignore": [
        "db.json",
        "downloads/*",
        "node_modules/*",
        "*.log",
        ".git"
    ],
    "watch": [
        "src/"
    ],
    "ext": "js,json,mjs"
}
```

# package.json

```json
{
  "name": "tiktok-recorder-bot",
  "version": "1.0.0",
  "description": "Telegram bot for recording TikTok live streams",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
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
  "engines": {
    "node": ">=20.0.0"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.948.0",
    "axios": "^1.6.0",
    "cloudinary": "^2.8.0",
    "dotenv": "^16.3.1",
    "express": "^5.2.1",
    "ffmpeg-static": "^5.2.0",
    "fluent-ffmpeg": "^2.1.2",
    "fs": "^0.0.1-security",
    "googleapis": "^166.0.0",
    "lowdb": "^7.0.1",
    "telegraf": "^4.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

```

# session_name.session

This is a binary file of the type: Binary

# src/bot.js

```js
import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import fs from 'fs';
import 'dotenv/config';
import dns from 'dns';
import { uploadDirectToN8n } from './services/n8n.service.js';

// --- الحل النهائي: تعيين خوادم DNS بشكل صريح للتطبيق بأكمله ---
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('[DNS Fix] تم تعيين خوادم DNS بشكل صريح إلى Google & Cloudflare.');

import { getRoomId, isUserLive, getLiveStreamUrl } from './services/tiktok.service.js';
import { recordLiveStream } from './core/recorder.service.js';
import { uploadVideoToS3 } from './services/s3.service.js';
import { setupDatabase, addUserToMonitor, removeUserFromMonitor, getMonitoredUsers, addFailedUpload, getFailedUploadsByChatId, removeFailedUpload, incrementFailedUploadAttempts, getTokenStatus, updateUploadStats } from './services/db.service.js';
import { startMonitoring, currentlyRecording } from './core/monitoring.service.js';
import { generateOAuthUrl, exchangeCodeForTokenLegacy, saveRefreshToken, pendingOAuthStates } from './services/oauth-telegram.service.js';
import { uploadVideoToDrive } from './services/drive.service.js';


if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('خطأ: لم يتم العثور على TELEGRAM_BOT_TOKEN في ملف .env');
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const userState = {};

// إعادة هيكلة لدعم التسجيلات المتعددة
const activeRecordings = new Map(); // Map<recordingId, recordingData>
const userRecordings = new Map(); // Map<chatId, Set<recordingId>>

// دالة مساعدة لتوليد recordingId فريد
function generateRecordingId(username, chatId) {
    return `${username}_${chatId}_${Date.now()}`;
}

// دالة للحصول على تسجيلات المستخدم
function getUserRecordings(chatId) {
    if (!userRecordings.has(chatId)) {
        userRecordings.set(chatId, new Set());
    }
    return userRecordings.get(chatId);
}

// دالة للتحقق من وجود تسجيل لنفس username
function isUsernameAlreadyRecording(chatId, username) {
    const recordings = getUserRecordings(chatId);
    for (const recordingId of recordings) {
        const recording = activeRecordings.get(recordingId);
        if (recording && recording.username === username) {
            return true;
        }
    }
    return false;
}

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
        '/list - عرض التسجيلات النشطة\n' +
        '/stop <username> - إيقاف تسجيل محدد\n' +
        '/stop all - إيقاف جميع التسجيلات\n' +
        '/failed_videos - عرض الفيديوهات الفاشلة\n' +
        '/update_token - تحديث Google Drive Token\n' +
        '/token_status - حالة Token',
        mainKeyboard
    );
});

// أمر /list: عرض التسجيلات النشطة
bot.command('list', (ctx) => {
    const userRecs = getUserRecordings(ctx.chat.id);

    if (userRecs.size === 0) {
        ctx.reply('📋 لا توجد تسجيلات نشطة حالياً.');
        return;
    }

    let message = `📋 *التسجيلات النشطة* (${userRecs.size}/3):\n\n`;

    for (const recordingId of userRecs) {
        const recording = activeRecordings.get(recordingId);
        if (recording) {
            const duration = Math.floor((Date.now() - recording.startTime) / 1000);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;

            message += `🔴 *${recording.username}*\n`;
            message += `⏱️ المدة: ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
            message += `📝 ID: \`${recording.username}\`\n\n`;
        }
    }

    message += `💡 لإيقاف تسجيل: /stop <username>\n`;
    message += `💡 لإيقاف الكل: /stop all`;

    ctx.reply(message, { parse_mode: 'Markdown' });
});

// أمر /stop: إيقاف تسجيل محدد أو الكل
bot.command('stop', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length === 0) {
        ctx.reply(
            '❌ يجب تحديد اسم المستخدم أو "all"\n\n' +
            'الاستخدام:\n' +
            '/stop <username> - إيقاف تسجيل محدد\n' +
            '/stop all - إيقاف جميع التسجيلات\n\n' +
            'استخدم /list لعرض التسجيلات النشطة'
        );
        return;
    }

    const target = args[0].toLowerCase();
    const userRecs = getUserRecordings(ctx.chat.id);

    if (userRecs.size === 0) {
        ctx.reply('📋 لا توجد تسجيلات نشطة لإيقافها.');
        return;
    }

    if (target === 'all') {
        // إيقاف جميع التسجيلات
        let stoppedCount = 0;
        const recordingsToStop = Array.from(userRecs);

        for (const recordingId of recordingsToStop) {
            const recording = activeRecordings.get(recordingId);
            if (recording && recording.controller) {
                recording.controller.abort();
                stoppedCount++;
            }
        }

        ctx.reply(`⏹️ تم إيقاف ${stoppedCount} تسجيل(ات). سيتم معالجة الفيديوهات قريباً.`);
    } else {
        // إيقاف تسجيل محدد
        const username = target;
        let found = false;

        for (const recordingId of userRecs) {
            const recording = activeRecordings.get(recordingId);
            if (recording && recording.username === username) {
                if (recording.controller) {
                    recording.controller.abort();
                    ctx.reply(`⏹️ تم إيقاف تسجيل ${username}. سيتم معالجة الفيديو قريباً.`);
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            ctx.reply(`❌ لم يتم العثور على تسجيل نشط للمستخدم "${username}".\n\nاستخدم /list لعرض التسجيلات النشطة.`);
        }
    }
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
        const redirectUri = process.env.OAUTH_REDIRECT_URI;
        const authUrl = generateOAuthUrl(ctx.chat.id);

        // التحقق من نوع OAuth المستخدم
        const isAutomatic = redirectUri && !redirectUri.includes('urn:ietf:wg:oauth');

        if (isAutomatic) {
            // طريقة OAuth التلقائية (مثل n8n)
            await ctx.reply(
                '🔐 *تحديث Google Drive Token*\n\n' +
                '✨ *طريقة سهلة وسريعة!*\n\n' +
                '📌 الخطوات:\n\n' +
                '1️⃣ اضغط على الرابط أدناه\n' +
                '2️⃣ سجل الدخول بحساب Google\n' +
                '3️⃣ اسمح بالصلاحيات\n' +
                '4️⃣ انتهى! 🎉\n\n' +
                '🔄 *Token سيتم تجديده تلقائياً كل 50 دقيقة*\n\n' +
                `🔗 [اضغط هنا للربط](${authUrl})\n\n` +
                '💡 بعد الموافقة، ستصلك رسالة تأكيد هنا تلقائياً.',
                { parse_mode: 'Markdown', disable_web_page_preview: true }
            );
        } else {
            // الطريقة اليدوية (التوافق مع القديم)
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
        }
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

    // معالجة كود OAuth (للتوافق مع الطريقة القديمة)
    if (currentState === 'waiting_for_oauth_code') {
        delete userState[chatId];

        try {
            await ctx.reply('⏳ جاري معالجة الكود...');

            const refreshToken = await exchangeCodeForTokenLegacy(chatId, username);

            await ctx.reply(
                '✅ *تم تحديث Token بنجاح!*\n\n' +
                '🔄 *Token يتم تجديده تلقائياً كل 50 دقيقة*\n\n' +
                'هل تريد إعادة رفع الفيديوهات الفاشلة؟',
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
    const recordingId = ctx.match[1];
    const recording = activeRecordings.get(recordingId);

    if (recording && recording.controller) {
        ctx.answerCbQuery(`جاري إيقاف تسجيل ${recording.username}...`);
        recording.controller.abort();
        ctx.editMessageText(`تم طلب إيقاف التسجيل للمستخدم ${recording.username}. سيتم إرسال الفيديو المسجل قريبًا.`);
    } else {
        ctx.answerCbQuery('لم يتم العثور على عملية تسجيل نشطة.');
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
    const chatId = ctx.chat.id;
    const userRecs = getUserRecordings(chatId);

    // فحص 1: الحد الأقصى للتسجيلات المتزامنة
    if (userRecs.size >= 3) {
        await ctx.reply(
            `❌ لقد وصلت للحد الأقصى من التسجيلات المتزامنة (3).\n\n` +
            `استخدم /list لعرض التسجيلات النشطة\n` +
            `استخدم /stop <username> لإيقاف تسجيل محدد`
        );
        return;
    }

    // فحص 2: منع تسجيل نفس المستخدم مرتين
    if (isUsernameAlreadyRecording(chatId, username)) {
        await ctx.reply(`❌ يوجد بالفعل تسجيل نشط للمستخدم ${username}.`);
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

        // إنشاء recordingId فريد
        const recordingId = generateRecordingId(username, chatId);
        const controller = new AbortController();

        const stopButton = Markup.inlineKeyboard([
            Markup.button.callback('⏹️ إيقاف التسجيل', `stop_record_${recordingId}`)
        ]);

        const recordingMsg = await bot.telegram.editMessageText(
            ctx.chat.id,
            checkingMsg.message_id,
            undefined,
            `🔴 بدأ تسجيل البث للمستخدم ${username}...\n📊 التسجيلات النشطة: ${userRecs.size + 1}/3`,
            stopButton
        );

        // حفظ بيانات التسجيل
        activeRecordings.set(recordingId, {
            username,
            chatId,
            controller,
            messageId: recordingMsg.message_id,
            startTime: Date.now()
        });

        // إضافة recordingId إلى قائمة تسجيلات المستخدم
        userRecs.add(recordingId);

        // ---  منطق محسّن مع حماية من حذف الملفات قبل رفعها ---
        recordLiveStream(streamUrl, username, controller.signal)
            .then(async (finalMp4Path) => {
                try {
                    // 1. حساب حجم الملف لكي نظهره في الرسالة
                    const fileStats = fs.statSync(finalMp4Path);
                    const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
                    const fileName = finalMp4Path.split('/').pop();

                    // 2. إرسال رسالة تفصيلية للمستخدم (كما كانت في نسخة S3)
                    await bot.telegram.editMessageText(
                        ctx.chat.id,
                        recordingMsg.message_id,
                        undefined,
                        `✅ تم حفظ الفيديو بنجاح!\n\n` +
                        `👤 المستخدم: ${username}\n` +
                        `📁 اسم الملف: ${fileName}\n` +
                        `📊 الحجم: ${fileSizeMB} MB\n\n` +
                        `⏳ جاري الرفع المباشر إلى Google Drive عبر n8n...\n` +
                        `📤 سيتم إرسال تأكيد عند اكتمال الرفع.`
                    );

                    // 3. تنفيذ الرفع المباشر إلى n8n
                    const result = await uploadDirectToN8n(finalMp4Path, username, ctx.chat.id);

                    if (result.success) {
                        // 4. حذف الملف المحلي بعد نجاح العملية بالكامل
                        if (fs.existsSync(finalMp4Path)) {
                            fs.unlinkSync(finalMp4Path);
                            console.log(`[Cleanup] ✅ تم حذف الملف المحلي بعد نجاح الرفع لـ n8n`);
                        }

                        // تحديث إحصائيات الرفع في قاعدة البيانات
                        await updateUploadStats(true);

                        // ملاحظة: n8n هو من سيرسل رسالة "تم الرفع لـ Drive" النهائية كما هو مبرمج في Workflow الخاص به
                    } else {
                        throw new Error(result.error);
                    }

                } catch (processingError) {
                    console.error("❌ خطأ أثناء معالجة الفيديو:", processingError);

                    // في حالة فشل n8n، نحفظ الملف في قائمة الانتظار (DB) لإعادة المحاولة
                    const fileStats = fs.existsSync(finalMp4Path) ? fs.statSync(finalMp4Path) : null;
                    const fileSize = fileStats ? `${(fileStats.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown';

                    await addFailedUpload({
                        username,
                        filepath: finalMp4Path,
                        chatId: ctx.chat.id,
                        error: processingError.message,
                        fileSize,
                        attempts: 0
                    });

                    await ctx.reply(
                        `⚠️ حدث مشكلة في الرفع التلقائي لـ ${username}.\n` +
                        `📁 تم الاحتفاظ بالملف وإضافته لقائمة الانتظار.\n` +
                        `السبب: ${processingError.message}\n\n` +
                        `💡 استخدم /failed_videos لإدارته.`
                    );
                }
            })
            .catch(async (error) => {
                console.error(`❌ خطأ في عملية التسجيل لـ ${username}:`, error);
                await bot.telegram.editMessageText(ctx.chat.id, recordingMsg.message_id, undefined, `❌ حدث خطأ فادح أثناء تسجيل ${username}.`);
            })
            .finally(() => {
                // تنظيف حالة التسجيل
                activeRecordings.delete(recordingId);
                userRecs.delete(recordingId);

                if (currentlyRecording.has(username)) {
                    currentlyRecording.delete(username);
                }

                console.log(`[Cleanup] تم تنظيف التسجيل: ${recordingId}`);
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

// تصدير Bot للاستخدام من index.js
export default bot;

// تصدير دوال مساعدة
export { handleRecordLive };

// دالة للحصول على عدد التسجيلات النشطة لمستخدم
export function getUserRecordingsCountForMonitoring(chatId) {
    return getUserRecordings(chatId).size;
}

// تفعيل المراقبة التلقائية (يمكن تفعيلها من index.js)
// startMonitoring(bot, handleRecordLive, getUserRecordingsCountForMonitoring);
```

# src/config/env.js

```js

```

# src/core/monitoring.service.js

```js
import * as tiktokService from '../services/tiktok.service.js';
import * as dbService from '../services/db.service.js';

// مجموعة لتتبع المستخدمين الذين يتم تسجيلهم حاليًا لمنع التسجيل المزدوج
const currentlyRecording = new Set();

let handleRecordLive; // متغير لتخزين الدالة
let getUserRecordingsCount; // دالة للحصول على عدد التسجيلات النشطة للمستخدم

/**
 * دالة تقوم بفحص قائمة المراقبة مرة واحدة
 * @param {Telegraf} bot - نسخة البوت لإرسال الإشعارات والتسجيل
 */
async function checkMonitoredUsers(bot) {
    const users = await dbService.getMonitoredUsers();

    for (const user of users) {
        if (currentlyRecording.has(user.username)) continue;

        try {
            // فحص الحد الأقصى للتسجيلات
            if (getUserRecordingsCount) {
                const activeCount = getUserRecordingsCount(user.chatId);
                if (activeCount >= 3) {
                    console.log(`[Monitor] المستخدم ${user.chatId} وصل للحد الأقصى (${activeCount}/3). تخطي المراقبة.`);
                    continue;
                }
            }
            
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
 * @param {Function} getRecordingsCountFn - دالة للحصول على عدد التسجيلات النشطة
 */
function startMonitoring(bot, recordFunction, getRecordingsCountFn) {
    handleRecordLive = recordFunction; // تخزين الدالة للاستخدام
    getUserRecordingsCount = getRecordingsCountFn; // تخزين دالة العداد
    console.log('[Monitor] تم تفعيل خدمة المراقبة.');
    setInterval(() => checkMonitoredUsers(bot), 300000);
    checkMonitoredUsers(bot);
}

export { startMonitoring, currentlyRecording };
```

# src/core/recorder.service.js

```js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { convertFlvToMp4 } from '../utils/video.util.js';
import { getDownloadsPath } from '../utils/path.util.js';

async function recordLiveStream(streamUrl, username, signal) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const outputDir = getDownloadsPath();
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
            signal,
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            // --- مراقبة نشاط البث (Watchdog) ---
            let lastDataTime = Date.now();
            const WATCHDOG_INTERVAL = 10000; // فحص كل 10 ثواني
            const INACTIVITY_TIMEOUT = 30000; // اعتبار البث متوقف بعد 30 ثانية من الصمت

            const watchdogTimer = setInterval(() => {
                const timeSinceLastData = Date.now() - lastDataTime;
                if (timeSinceLastData > INACTIVITY_TIMEOUT) {
                    console.warn(`[Recorder] ⚠️ لم يتم استلام بيانات منذ ${timeSinceLastData / 1000} ثانية. إنهاء التسجيل قسرياً.`);
                    clearInterval(watchdogTimer);
                    response.data.destroy(); // قطع الاتصال
                    writer.end(); // إنهاء الملف
                }
            }, WATCHDOG_INTERVAL);

            response.data.on('data', () => {
                lastDataTime = Date.now();
            });

            const onFinish = async () => {
                clearInterval(watchdogTimer); // إيقاف المؤقت
                console.log(`[Recorder] انتهى التسجيل. حجم الملف المؤقت: ${(writer.bytesWritten / 1024 / 1024).toFixed(2)} MB`);
                try {
                    const finalMp4Path = await convertFlvToMp4(tempFilePath);
                    resolve(finalMp4Path);
                } catch (conversionError) {
                    reject(conversionError);
                }
            };

            const onError = (err) => {
                clearInterval(watchdogTimer);
                console.error('[Recorder] حدث خطأ أثناء كتابة الملف:', err);
                reject(err);
            };

            signal.addEventListener('abort', () => {
                clearInterval(watchdogTimer);
                console.log(`[Recorder] تم طلب إيقاف التسجيل للمستخدم: ${username}`);
                writer.end();
                response.data.destroy();
            });

            writer.on('finish', onFinish);
            writer.on('error', onError);
        });
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('[Recorder] تم إلغاء طلب التحميل بنجاح.');
            return convertFlvToMp4(tempFilePath);
        }
        writer.close();
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        throw new Error('فشل الاتصال برابط البث.');
    }
}

export { recordLiveStream };
```

# src/index.js

```js
import { setupDatabase } from './services/db.service.js';
import { startServer } from './server.js';
import { Telegraf } from 'telegraf';
import { setBotInstance } from './services/oauth-telegram.service.js';
import 'dotenv/config';

/**
 * ملف البداية الرئيسي - يشغل:
 * 1. Express Server (OAuth Callback)
 * 2. Telegram Bot
 */

async function main() {
    try {
        console.log('🚀 بدء تشغيل TikTok Recorder Bot...');
        
        // 1. إعداد قاعدة البيانات
        await setupDatabase();
        console.log('✅ تم إعداد قاعدة البيانات');
        
        // 2. تشغيل Express Server للـ OAuth Callback
        startServer();
        console.log('✅ تم تشغيل OAuth Server');
        
        // 3. استيراد وتشغيل البوت
        const { default: bot } = await import('./bot.js');
        
        // 4. تعيين Bot instance للـ OAuth service (لإرسال إشعارات)
        setBotInstance(bot);
        console.log('✅ تم ربط Bot مع OAuth Service');
        
        // 5. تشغيل البوت
        await bot.launch();
        console.log('✅ البوت يعمل الآن!');
        
        // معالجة الإيقاف النظيف
        process.once('SIGINT', () => {
            console.log('\n🛑 تم استقبال SIGINT - إيقاف البوت...');
            bot.stop('SIGINT');
        });
        
        process.once('SIGTERM', () => {
            console.log('\n🛑 تم استقبال SIGTERM - إيقاف البوت...');
            bot.stop('SIGTERM');
        });
        
    } catch (error) {
        console.error('❌ فشل بدء التشغيل:', error);
        process.exit(1);
    }
}

main();

```

# src/server.js

```js
import express from 'express';
import { exchangeCodeForToken, saveTokensToDb, notifyUserTokenSuccess } from './services/oauth-telegram.service.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ OAuth Callback Endpoint
app.get('/oauth/callback', async (req, res) => {
    const { code, state, error } = req.query;

    console.log('[OAuth Server] 📥 استقبال callback من Google');

    // التحقق من وجود خطأ
    if (error) {
        console.error(`[OAuth Server] ❌ خطأ من Google: ${error}`);
        return res.status(400).send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فشل الربط</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                    .error { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                    h1 { color: #e74c3c; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ فشل الربط</h1>
                    <p>حدث خطأ: ${error}</p>
                    <p>يمكنك إغلاق هذه النافذة والمحاولة مرة أخرى.</p>
                </div>
            </body>
            </html>
        `);
    }

    // التحقق من وجود Code
    if (!code) {
        console.error('[OAuth Server] ❌ Code مفقود');
        return res.status(400).send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>Code مفقود</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                    .error { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                    h1 { color: #e74c3c; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ Code مفقود</h1>
                    <p>لم يتم استقبال كود التفويض.</p>
                    <p>يمكنك إغلاق هذه النافذة والمحاولة مرة أخرى.</p>
                </div>
            </body>
            </html>
        `);
    }

    const chatId = state; // chatId محفوظ في state parameter

    try {
        console.log(`[OAuth Server] 🔄 استبدال Code بـ Tokens... (Chat ID: ${chatId})`);

        // استبدال Code بـ Access Token + Refresh Token
        const tokens = await exchangeCodeForToken(code);

        console.log('[OAuth Server] ✅ تم الحصول على Tokens بنجاح');

        // حفظ Tokens في قاعدة البيانات
        await saveTokensToDb({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date
        });

        console.log('[OAuth Server] ✅ تم حفظ Tokens في قاعدة البيانات');

        // إرسال إشعار للمستخدم في Telegram
        if (chatId) {
            await notifyUserTokenSuccess(chatId);
            console.log(`[OAuth Server] ✅ تم إرسال إشعار للمستخدم: ${chatId}`);
        }

        // صفحة نجاح
        res.send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تم الربط بنجاح</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .success { 
                        background: #fff; 
                        padding: 40px; 
                        border-radius: 20px; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
                        max-width: 500px; 
                        animation: slideIn 0.5s ease-out;
                    }
                    @keyframes slideIn {
                        from { transform: translateY(-50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    h1 { 
                        color: #27ae60; 
                        font-size: 2.5em;
                        margin-bottom: 20px;
                    }
                    .icon { 
                        font-size: 5em; 
                        margin-bottom: 20px;
                    }
                    p { 
                        color: #555; 
                        font-size: 1.2em;
                        line-height: 1.6;
                    }
                    .note {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 20px;
                        color: #666;
                        font-size: 0.95em;
                    }
                </style>
            </head>
            <body>
                <div class="success">
                    <div class="icon">✅</div>
                    <h1>تم الربط بنجاح!</h1>
                    <p>تم ربط حسابك في Google Drive بنجاح.</p>
                    <p>✨ Token سيتم تجديده تلقائياً كل 50 دقيقة.</p>
                    <div class="note">
                        📱 يمكنك الآن إغلاق هذه النافذة والعودة إلى Telegram.
                    </div>
                </div>
                <script>
                    // إغلاق النافذة تلقائياً بعد 3 ثواني
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error(`[OAuth Server] ❌ فشل: ${error.message}`);

        res.status(500).send(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فشل الربط</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                    .error { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                    h1 { color: #e74c3c; }
                    .error-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ فشل الربط</h1>
                    <p>حدث خطأ أثناء ربط حسابك.</p>
                    <div class="error-details">${error.message}</div>
                    <p style="margin-top: 20px;">يمكنك إغلاق هذه النافذة والمحاولة مرة أخرى عبر /update_token</p>
                </div>
            </body>
            </html>
        `);
    }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'TikTok Recorder Bot',
        timestamp: new Date().toISOString()
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>TikTok Recorder Bot</title>
            <style>
                body { 
                    font-family: Arial; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container { 
                    background: #fff; 
                    padding: 40px; 
                    border-radius: 20px; 
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
                    max-width: 600px; 
                }
                h1 { color: #667eea; }
                .status { 
                    background: #27ae60; 
                    color: white; 
                    padding: 10px 20px; 
                    border-radius: 20px; 
                    display: inline-block;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 TikTok Recorder Bot</h1>
                <div class="status">✅ Bot is Running</div>
                <p>OAuth Server جاهز لاستقبال طلبات التفويض.</p>
            </div>
        </body>
        </html>
    `);
});

export function startServer() {
    app.listen(PORT, () => {
        console.log(`[OAuth Server] 🚀 يعمل على: http://localhost:${PORT}`);
        console.log(`[OAuth Server] 📍 OAuth Callback: http://localhost:${PORT}/oauth/callback`);
    });
}

export default app;

```

# src/services/cloudinary.service.js

```js
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadVideo(filePath, publicId) {
    try {
        console.log(`[Cloudinary] بدء رفع الملف: ${filePath}`);
        
        // upload_large يحتاج Promise wrapper لأنه يستخدم callback
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(
                filePath,
                {
                    resource_type: "video",
                    public_id: `tiktok_records/${publicId}_${Date.now()}`,
                    chunk_size: 20000000, // 20 MB لكل جزء
                    timeout: 600000, // 10 دقائق timeout
                    overwrite: true,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });

        console.log(`[Cloudinary] ✅ تم الرفع بنجاح. الرابط: ${result.secure_url}`);
        console.log(`[Cloudinary] 🆔 معرف الملف: ${result.public_id}`);
        console.log(`[Cloudinary] 📊 الحجم: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
        console.log(`[Cloudinary] ⏱️ المدة: ${result.duration ? result.duration.toFixed(2) + 's' : 'N/A'}`);
        return result;

    } catch (error) {
        console.error("[Cloudinary] ❌ حدث خطأ أثناء الرفع:", error);
        throw error;
    }
}

export {
    uploadVideo
};
```

# src/services/db.service.js

```js
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
    db = new Low(adapter, { 
        monitoredUsers: [],
        settings: {
            googleRefreshToken: null,
            googleAccessToken: null,
            tokenExpiryDate: null,
            tokenLastUpdated: null,
            tokenLastUsed: null
        },
        failedUploads: [],
        stats: {
            totalUploads: 0,
            successfulUploads: 0,
            failedUploads: 0
        }
    });

    await db.read();
    
    // التأكد من وجود الهيكل الكامل
    db.data ||= { monitoredUsers: [], settings: {}, failedUploads: [], stats: {} };
    db.data.settings ||= { 
        googleRefreshToken: null, 
        googleAccessToken: null,
        tokenExpiryDate: null,
        tokenLastUpdated: null, 
        tokenLastUsed: null 
    };
    db.data.failedUploads ||= [];
    db.data.stats ||= { totalUploads: 0, successfulUploads: 0, failedUploads: 0 };
    
    // نقل Token من ENV إلى DB في أول تشغيل فقط
    if (!db.data.settings.googleRefreshToken && process.env.GOOGLE_REFRESH_TOKEN) {
        db.data.settings.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        db.data.settings.tokenLastUpdated = new Date().toISOString();
        console.log('[DB] ✅ تم نقل GOOGLE_REFRESH_TOKEN من ENV إلى قاعدة البيانات');
    }
    
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

// ==================== دوال إدارة Google Refresh Token ====================

// دالة للحصول على Google Refresh Token
export async function getGoogleRefreshToken() {
    await db.read();
    return db.data.settings?.googleRefreshToken || null;
}

// دالة لحفظ Google Refresh Token
export async function saveGoogleRefreshToken(token) {
    await db.read();
    db.data.settings = db.data.settings || {};
    db.data.settings.googleRefreshToken = token;
    db.data.settings.tokenLastUpdated = new Date().toISOString();
    await db.write();
    console.log('[DB] ✅ تم حفظ Google Refresh Token الجديد');
}

// دالة لحفظ كامل Tokens (Access + Refresh + Expiry)
export async function saveTokensToDb({ accessToken, refreshToken, expiryDate }) {
    await db.read();
    db.data.settings = db.data.settings || {};
    
    if (accessToken) db.data.settings.googleAccessToken = accessToken;
    if (refreshToken) db.data.settings.googleRefreshToken = refreshToken;
    if (expiryDate) db.data.settings.tokenExpiryDate = expiryDate;
    
    db.data.settings.tokenLastUpdated = new Date().toISOString();
    await db.write();
    console.log('[DB] ✅ تم حفظ Tokens (Access + Refresh + Expiry)');
}

// دالة للحصول على كامل Tokens
export async function getTokensFromDb() {
    await db.read();
    return {
        accessToken: db.data.settings?.googleAccessToken || null,
        refreshToken: db.data.settings?.googleRefreshToken || null,
        expiryDate: db.data.settings?.tokenExpiryDate || null
    };
}

// دالة لتحديث آخر استخدام ناجح للـ Token
export async function updateTokenLastUsed() {
    await db.read();
    db.data.settings = db.data.settings || {};
    db.data.settings.tokenLastUsed = new Date().toISOString();
    await db.write();
}

// دالة للحصول على حالة Token
export async function getTokenStatus() {
    await db.read();
    return {
        hasToken: !!db.data.settings?.googleRefreshToken,
        lastUpdated: db.data.settings?.tokenLastUpdated || null,
        lastUsed: db.data.settings?.tokenLastUsed || null,
        stats: db.data.stats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0 }
    };
}

// ==================== دوال إدارة الفيديوهات الفاشلة ====================

// دالة لإضافة فيديو فاشل إلى القائمة
export async function addFailedUpload(uploadInfo) {
    await db.read();
    
    const id = `${uploadInfo.username}_${Date.now()}`;
    const failedUpload = {
        id,
        username: uploadInfo.username,
        filepath: uploadInfo.filepath,
        chatId: uploadInfo.chatId,
        failedAt: new Date().toISOString(),
        error: uploadInfo.error || 'Unknown error',
        fileSize: uploadInfo.fileSize || 'Unknown',
        attempts: uploadInfo.attempts || 0
    };
    
    db.data.failedUploads = db.data.failedUploads || [];
    db.data.failedUploads.push(failedUpload);
    
    // تحديث الإحصائيات
    db.data.stats = db.data.stats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0 };
    db.data.stats.failedUploads++;
    
    await db.write();
    console.log(`[DB] ➕ تم إضافة فيديو فاشل: ${uploadInfo.username}`);
    return id;
}

// دالة للحصول على جميع الفيديوهات الفاشلة
export async function getFailedUploads() {
    await db.read();
    return db.data.failedUploads || [];
}

// دالة للحصول على الفيديوهات الفاشلة لمحادثة معينة
export async function getFailedUploadsByChatId(chatId) {
    await db.read();
    return (db.data.failedUploads || []).filter(upload => upload.chatId === chatId);
}

// دالة لحذف فيديو فاشل من القائمة
export async function removeFailedUpload(id) {
    await db.read();
    db.data.failedUploads = (db.data.failedUploads || []).filter(upload => upload.id !== id);
    await db.write();
    console.log(`[DB] ➖ تم حذف فيديو فاشل: ${id}`);
}

// دالة لتحديث عدد المحاولات لفيديو فاشل
export async function incrementFailedUploadAttempts(id) {
    await db.read();
    const upload = (db.data.failedUploads || []).find(u => u.id === id);
    if (upload) {
        upload.attempts = (upload.attempts || 0) + 1;
        upload.lastAttempt = new Date().toISOString();
        await db.write();
    }
}

// دالة لمسح جميع الفيديوهات الفاشلة
export async function clearFailedUploads() {
    await db.read();
    const count = (db.data.failedUploads || []).length;
    db.data.failedUploads = [];
    await db.write();
    console.log(`[DB] 🧹 تم مسح ${count} فيديو فاشل`);
    return count;
}

// دالة لتحديث إحصائيات الرفع
export async function updateUploadStats(success = true) {
    await db.read();
    db.data.stats = db.data.stats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0 };
    db.data.stats.totalUploads++;
    if (success) {
        db.data.stats.successfulUploads++;
    }
    await db.write();
}

```

# src/services/drive.service.js

```js
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { getGoogleRefreshToken, updateTokenLastUsed, getTokensFromDb, saveTokensToDb } from './db.service.js';

// متغير لتخزين نسخة drive بعد تهيئتها لتجنب إعادة التهيئة مع كل عملية رفع
let drive = null;
let oauth2Client = null;
let tokenRefreshTimer = null;

/**
 * تهيئة Google Drive API باستخدام Tokens من قاعدة البيانات.
 * يقوم بقراءة Access Token + Refresh Token وإعداد Auto-Refresh.
 */
async function initializeDrive() {
    // إذا تم تهيئة drive من قبل، قم بإرجاعه مباشرة لتجنب العمليات المكررة
    if (drive && oauth2Client) return drive;

    try {
        // 1. قراءة بيانات الاعتماد من process.env و DB
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.OAUTH_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
        
        const tokens = await getTokensFromDb(); // قراءة Access + Refresh من DB

        // التحقق من وجود جميع المتغيرات المطلوبة لضمان عدم حدوث أخطاء
        if (!clientId || !clientSecret) {
            throw new Error('متغيرات Google Drive (CLIENT_ID, CLIENT_SECRET) غير موجودة في Environment Variables');
        }
        
        if (!tokens.refreshToken) {
            throw new Error('GOOGLE_REFRESH_TOKEN غير موجود في قاعدة البيانات. استخدم /update_token لتعيينه.');
        }

        // 2. إنشاء عميل OAuth2 باستخدام بيانات الاعتماد
        oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        // 3. تعيين التوكنات (Access + Refresh + Expiry)
        oauth2Client.setCredentials({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expiry_date: tokens.expiryDate
        });

        // 4. إنشاء خدمة Drive وتخزينها في المتغير العام
        drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        console.log('[Google Drive] ✅ تم تهيئة Google Drive API بنجاح (Tokens من قاعدة البيانات).');
        
        // 5. بدء Auto-Refresh للـ Access Token
        startAutoRefresh();
        
        return drive;

    } catch (error) {
        console.error('[Google Drive] ❌ فشل فادح في تهيئة Google Drive API:', error.message);
        // رمي الخطأ لإيقاف العملية إذا لم تنجح المصادقة
        throw error;
    }
}

/**
 * رفع ملف فيديو إلى Google Drive.
 * @param {string} filePath - المسار الكامل للملف المحلي المراد رفعه.
 * @param {string} username - اسم مستخدم تيك توك، يستخدم في تسمية الملف.
 * @returns {Promise<Object>} كائن يحتوي على معلومات الملف المرفوع.
 */
async function uploadVideoToDrive(filePath, username) {
    try {
        const driveClient = await initializeDrive(); // التأكد من أن المصادقة جاهزة
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!folderId) {
            throw new Error('متغير GOOGLE_DRIVE_FOLDER_ID غير محدد في ملف .env');
        }

        console.log(`[Google Drive] 📤 بدء رفع الملف: ${filePath}`);
        const fileStats = fs.statSync(filePath);
        const fileSizeInMB = (fileStats.size / 1024 / 1024).toFixed(2);
        console.log(`[Google Drive] 📊 حجم الملف: ${fileSizeInMB} MB`);

        // إعداد بيانات الملف (الاسم، والمجلد الأب)
        const fileMetadata = {
            name: `${username}_${new Date().toISOString()}.mp4`,
            parents: [folderId],
        };

        // إعداد محتوى الملف للرفع
        const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(filePath),
        };

        // تنفيذ عملية الرفع
        const response = await driveClient.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, size, webViewLink', // طلب الحقول المطلوبة فقط
            supportsAllDrives: true, // ضروري لدعم الرفع إلى Shared Drives
        });
        
        const uploadedFile = response.data;
        console.log(`[Google Drive] ✅ تم الرفع بنجاح! معرف الملف: ${uploadedFile.id}`);

        // تحديث آخر استخدام ناجح للـ Token
        await updateTokenLastUsed();

        // جعل الملف قابلاً للمشاهدة من قبل أي شخص لديه الرابط
        await makeFilePublic(uploadedFile.id);

        // إرجاع كائن منظم يحتوي على بيانات مفيدة للبوت
        return {
            id: uploadedFile.id,
            name: uploadedFile.name,
            size: uploadedFile.size,
            directLink: uploadedFile.webViewLink,
        };

    } catch (error) {
        console.error('[Google Drive] ❌ حدث خطأ فادح أثناء الرفع:', error.message);
        
        // إضافة معلومات إضافية للخطأ لمعرفة نوعه
        if (error.message && error.message.includes('invalid_grant')) {
            error.isTokenExpired = true;
            error.userMessage = '🔐 انتهت صلاحية Google Drive Token. يرجى تجديده.';
        }
        
        throw error;
    }
}

/**
 * جعل الملف عامًا (يمكن لأي شخص لديه الرابط الوصول إليه كـ "قارئ").
 * @param {string} fileId - معرف الملف على Google Drive.
 */
async function makeFilePublic(fileId) {
    try {
        const driveClient = await initializeDrive();
        await driveClient.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });
        console.log(`[Google Drive] 🔓 تم جعل الملف عامًا للمشاهدة.`);
    } catch (error) {
        // لا نرمي خطأ هنا، لأن الرفع قد نجح بالفعل، وهذا فشل ثانوي
        console.error('[Google Drive] ⚠️ فشل جعل الملف عامًا (لكن تم رفعه بنجاح):', error.message);
    }
}

/**
 * إعادة تعيين Drive Client (استخدم بعد تحديث Token)
 * هذه الدالة تُجبر النظام على إنشاء client جديد بـ Token الجديد
 */
function resetDriveClient() {
    drive = null;
    oauth2Client = null;
    
    // إيقاف Auto-Refresh القديم
    if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer);
        tokenRefreshTimer = null;
    }
    
    console.log('[Google Drive] 🔄 تم إعادة تعيين Drive Client - سيُستخدم Token الجديد في المرة القادمة');
}

/**
 * تجديد تلقائي للـ Access Token كل 50 دقيقة
 * يعمل في الخلفية لضمان عدم انتهاء صلاحية Token
 */
function startAutoRefresh() {
    // إيقاف أي timer سابق
    if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer);
    }

    console.log('[Google Drive] ⏰ بدء Auto-Refresh: كل 50 دقيقة');

    // تجديد كل 50 دقيقة (Access Token ينتهي بعد 60 دقيقة)
    tokenRefreshTimer = setInterval(async () => {
        try {
            console.log('[Google Drive] 🔄 Auto-Refresh: جاري تجديد Access Token...');
            
            if (!oauth2Client) {
                console.warn('[Google Drive] ⚠️ OAuth Client غير متوفر - تخطي Auto-Refresh');
                return;
            }

            // تجديد Token
            const { credentials } = await oauth2Client.refreshAccessToken();
            
            // حفظ Token الجديد في DB
            await saveTokensToDb({
                accessToken: credentials.access_token,
                refreshToken: credentials.refresh_token,
                expiryDate: credentials.expiry_date
            });
            
            console.log('[Google Drive] ✅ Auto-Refresh: تم تجديد Access Token بنجاح');
            console.log(`[Google Drive] ⏳ Token الجديد صالح حتى: ${new Date(credentials.expiry_date).toLocaleString('ar-DZ')}`);
            
        } catch (error) {
            console.error('[Google Drive] ❌ Auto-Refresh: فشل تجديد Token:', error.message);
            console.error('[Google Drive] 💡 قد تحتاج لتحديث Token يدوياً عبر /update_token');
        }
    }, 50 * 60 * 1000); // 50 دقيقة
}

export {
    uploadVideoToDrive,
    resetDriveClient
};
```

# src/services/n8n.service.js

```js
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import 'dotenv/config';

export async function uploadDirectToN8n(filePath, username, chatId) {
    try {
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
        if (!N8N_WEBHOOK_URL) throw new Error('N8N_WEBHOOK_URL missing');

        console.log(`[n8n-Direct] 📤 بدء إرسال الملف مباشرة: ${path.basename(filePath)}`);

        const form = new FormData();
        // إرسال الملف كبيانات ثنائية
        form.append('video', fs.createReadStream(filePath));
        // إرسال البيانات الوصفية كحقول نصية
        form.append('username', username);
        form.append('chatId', chatId.toString());
        form.append('filename', path.basename(filePath));

        const response = await axios.post(N8N_WEBHOOK_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            // مهم جداً للفيديوهات الكبيرة: عدم تحديد وقت انتهاء قصير
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 0
        });

        console.log('[n8n-Direct] ✅ تم الاستلام من قبل n8n بنجاح');
        return { success: true, data: response.data };

    } catch (error) {
        console.error('[n8n-Direct] ❌ فشل الإرسال المباشر:', error.message);
        return { success: false, error: error.message };
    }
}
```

# src/services/oauth-telegram.service.js

```js
import { google } from 'googleapis';
import fs from 'fs';
import 'dotenv/config';
import { saveGoogleRefreshToken, getTokenStatus, saveTokensToDb } from './db.service.js';

/**
 * خدمة لإدارة OAuth عبر التليجرام والـ HTTP Callback
 * تسمح للمستخدم بتجديد Token من خلال محادثة التليجرام أو OAuth Redirect
 */

// متغير لتخزين حالة الـ OAuth للمستخدمين
const pendingOAuthStates = new Map();

// متغير لحفظ Bot instance (سيتم تعيينه من bot.js)
let botInstance = null;

/**
 * تعيين Bot instance للاستخدام في الإشعارات
 * @param {Telegraf} bot - instance البوت
 */
function setBotInstance(bot) {
    botInstance = bot;
    console.log('[OAuth Telegram] ✅ تم تعيين Bot instance');
}

/**
 * توليد رابط OAuth للمستخدم (طريقة جديدة مع Redirect URI)
 * @param {number} chatId - معرف المحادثة
 * @returns {string} رابط التفويض
 */
function generateOAuthUrl(chatId) {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        state: chatId.toString() // نحفظ chatId في state للـ callback
    });

    // حفظ حالة OAuth للمستخدم
    pendingOAuthStates.set(chatId, {
        oauth2Client,
        timestamp: Date.now()
    });

    return authUrl;
}

/**
 * استبدال الكود بـ Tokens (للاستخدام من HTTP Callback أو Telegram)
 * @param {string} code - الكود من Google
 * @returns {Promise<object>} Tokens object { access_token, refresh_token, expiry_date }
 */
async function exchangeCodeForToken(code) {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    try {
        const { tokens } = await oauth2Client.getToken(code.trim());
        
        if (!tokens.refresh_token) {
            throw new Error('لم يتم الحصول على refresh_token. قد تحتاج لإلغاء الصلاحيات من: https://myaccount.google.com/permissions');
        }

        return tokens;
    } catch (error) {
        throw new Error(`فشل استبدال الكود: ${error.message}`);
    }
}

/**
 * استبدال الكود من Telegram (للتوافق مع الطريقة القديمة)
 * @param {number} chatId - معرف المحادثة
 * @param {string} code - الكود من Google
 * @returns {Promise<string>} Refresh Token الجديد
 */
async function exchangeCodeForTokenLegacy(chatId, code) {
    const state = pendingOAuthStates.get(chatId);
    
    if (!state) {
        throw new Error('لم يتم العثور على طلب OAuth نشط. الرجاء البدء من جديد.');
    }

    // التحقق من أن الطلب لم ينتهي وقته (15 دقيقة)
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - state.timestamp > fifteenMinutes) {
        pendingOAuthStates.delete(chatId);
        throw new Error('انتهت صلاحية الطلب. الرجاء البدء من جديد.');
    }

    try {
        const { tokens } = await state.oauth2Client.getToken(code.trim());
        
        if (!tokens.refresh_token) {
            throw new Error('لم يتم الحصول على refresh_token. قد تحتاج لإلغاء الصلاحيات من: https://myaccount.google.com/permissions');
        }

        // تنظيف الحالة
        pendingOAuthStates.delete(chatId);
        
        // حفظ Tokens
        await saveTokensToDb({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date
        });
        
        return tokens.refresh_token;
    } catch (error) {
        pendingOAuthStates.delete(chatId);
        throw new Error(`فشل استبدال الكود: ${error.message}`);
    }
}

/**
 * حفظ Refresh Token الجديد في قاعدة البيانات
 * @param {string} refreshToken - الـ Refresh Token الجديد
 * @returns {Promise<void>}
 */
async function saveRefreshToken(refreshToken) {
    try {
        await saveGoogleRefreshToken(refreshToken);
        console.log('[OAuth Telegram] ✅ تم حفظ Refresh Token الجديد في قاعدة البيانات');
        
        // إعادة تعيين Drive Client لاستخدام Token الجديد فوراً
        const { resetDriveClient } = await import('./drive.service.js');
        resetDriveClient();
        
        console.log('[OAuth Telegram] 🔄 تم إعادة تعيين Drive Client - جاهز للاستخدام مع Token الجديد');
    } catch (error) {
        console.error('[OAuth Telegram] ❌ فشل حفظ Token:', error.message);
        throw error;
    }
}

/**
 * التحقق من صلاحية Refresh Token
 * @returns {Promise<boolean>} true إذا كان Token صالح
 */
async function validateRefreshToken() {
    try {
        const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        const tokenStatus = await getTokenStatus();

        if (!CLIENT_ID || !CLIENT_SECRET || !tokenStatus.hasToken) {
            return false;
        }

        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        const REFRESH_TOKEN = await require('./db.service.js').getGoogleRefreshToken();
        oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        // محاولة الحصول على Access Token
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        return !!credentials.access_token;
    } catch (error) {
        console.error('[OAuth Telegram] ⚠️ Token غير صالح:', error.message);
        return false;
    }
}

/**
 * تنظيف الطلبات القديمة (يتم استدعاؤها دورياً)
 */
function cleanupExpiredStates() {
    const fifteenMinutes = 15 * 60 * 1000;
    const now = Date.now();
    
    for (const [chatId, state] of pendingOAuthStates.entries()) {
        if (now - state.timestamp > fifteenMinutes) {
            pendingOAuthStates.delete(chatId);
            console.log(`[OAuth Telegram] 🧹 تم تنظيف OAuth state منتهي لـ chatId: ${chatId}`);
        }
    }
}

/**
 * إرسال إشعار للمستخدم بنجاح ربط الحساب
 * @param {number} chatId - معرف المحادثة
 */
async function notifyUserTokenSuccess(chatId) {
    if (!botInstance) {
        console.warn('[OAuth Telegram] ⚠️ Bot instance غير متوفر - لا يمكن إرسال إشعار');
        return;
    }

    try {
        await botInstance.telegram.sendMessage(
            chatId,
            '✅ *تم ربط حسابك بنجاح!*\n\n' +
            '🔄 *Token سيتم تجديده تلقائياً كل 50 دقيقة*\n\n' +
            '💡 يمكنك الآن استخدام البوت بدون قلق من انتهاء Token.',
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('[OAuth Telegram] ❌ فشل إرسال إشعار:', error.message);
    }
}

// تنظيف تلقائي كل 30 دقيقة
setInterval(cleanupExpiredStates, 30 * 60 * 1000);

export {
    setBotInstance,
    generateOAuthUrl,
    exchangeCodeForToken,
    exchangeCodeForTokenLegacy,
    saveRefreshToken,
    saveTokensToDb,
    validateRefreshToken,
    notifyUserTokenSuccess,
    pendingOAuthStates
};

```

# src/services/s3.service.js

```js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * خدمة التعامل مع Cloudflare R2 (S3-compatible)
 * للرفع والحذف المؤقت للفيديوهات قبل نقلها إلى Google Drive
 */

// إعداد S3 Client للـ Cloudflare R2
const s3Client = new S3Client({
    region: 'auto', // Cloudflare R2 يستخدم 'auto'
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'tiktok-videos-temp';

/**
 * رفع فيديو إلى Cloudflare R2
 * @param {string} filePath - المسار الكامل للملف المحلي
 * @param {string} username - اسم مستخدم TikTok
 * @returns {Promise<Object>} معلومات الملف المرفوع (url, key, size)
 */
export async function uploadVideoToS3(filePath, username) {
    try {
        const fileName = path.basename(filePath);
        const fileStream = fs.createReadStream(filePath);
        const fileStats = fs.statSync(filePath);

        console.log(`[S3] 📤 بدء رفع: ${fileName}`);
        console.log(`[S3] 📊 حجم الملف: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);

        // مسار الملف في S3: tiktok-videos/username/filename.mp4
        const s3Key = `tiktok-videos/${username}/${fileName}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileStream,
            ContentType: 'video/mp4',
            Metadata: {
                'uploaded-by': 'tiktok-recorder-bot',
                'username': username,
                'upload-date': new Date().toISOString()
            }
        };

        // رفع الملف
        await s3Client.send(new PutObjectCommand(uploadParams));

        // بناء الـ URL العام
        const s3Url = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${s3Key}`;

        console.log(`[S3] ✅ تم الرفع بنجاح!`);
        console.log(`[S3] 🔗 URL: ${s3Url}`);

        // حذف الملف المحلي لتوفير المساحة
        try {
            fs.unlinkSync(filePath);
            console.log(`[S3] 🗑️ تم حذف الملف المحلي: ${fileName}`);
        } catch (deleteError) {
            console.warn(`[S3] ⚠️ تحذير: فشل حذف الملف المحلي: ${deleteError.message}`);
        }

        return {
            url: s3Url,
            key: s3Key,
            size: fileStats.size,
            filename: fileName,
            bucket: BUCKET_NAME
        };

    } catch (error) {
        console.error('[S3] ❌ فشل رفع الفيديو إلى S3:', error.message);
        throw new Error(`فشل رفع الفيديو إلى S3: ${error.message}`);
    }
}

/**
 * حذف فيديو من Cloudflare R2
 * @param {string} s3Key - مفتاح الملف في S3
 */
export async function deleteVideoFromS3(s3Key) {
    try {
        console.log(`[S3] 🗑️ جاري حذف الملف: ${s3Key}`);

        await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key
        }));

        console.log(`[S3] ✅ تم حذف الملف من S3 بنجاح`);

    } catch (error) {
        console.error(`[S3] ⚠️ فشل حذف الملف: ${error.message}`);
        // لا نرمي خطأ هنا - الحذف ليس حرجاً (Lifecycle سيحذفه لاحقاً)
    }
}

/**
 * اختبار الاتصال بـ S3
 * @returns {Promise<boolean>} true إذا نجح الاتصال
 */
export async function testS3Connection() {
    try {
        console.log('[S3] 🔍 اختبار الاتصال بـ Cloudflare R2...');

        // محاولة رفع ملف اختبار صغير
        const testKey = 'test/connection-test.txt';
        const testContent = `Test connection at ${new Date().toISOString()}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain'
        }));

        console.log('[S3] ✅ الاتصال ناجح!');

        // حذف ملف الاختبار
        await deleteVideoFromS3(testKey);

        return true;

    } catch (error) {
        console.error('[S3] ❌ فشل الاتصال:', error.message);
        return false;
    }
}

```

# src/services/tiktok.service.js

```js
import axios from 'axios';
import 'dotenv/config';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
};
if (process.env.TIKTOK_COOKIE) {
    console.log('[TikTok Service] تم العثور على كوكي، سيتم استخدامه.');
    headers['Cookie'] = process.env.TIKTOK_COOKIE;
}
const apiClient = axios.create({ 
    headers,
    timeout: 15000, // 15 seconds timeout
});

// دالة مساعدة لإعادة المحاولة
async function retryRequest(fn, retries = 2, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                console.log(`[TikTok Service] ⏱️ timeout, إعادة المحاولة ${i + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

async function getRoomId(username) {
    try {
        const signResponse = await apiClient.get(`https://tikrec.com/tiktok/room/api/sign?unique_id=${username}`);
        const signedPath = signResponse.data.signed_path;

        if (!signedPath) {
            return null;
        }

        const tiktokApiUrl = `https://www.tiktok.com${signedPath}`;
        const roomInfoResponse = await apiClient.get(tiktokApiUrl);
        const roomId = roomInfoResponse.data?.data?.user?.roomId;
        
        if (!roomId || roomId === "0") {
            return null;
        }
        return roomId;

    } catch (error) {
        // console.error(`[TikTok Service] خطأ في getRoomId للمستخدم ${username}:`, error.message);
        return null;
    }
}

async function isUserLive(roomId) {
    try {
        const liveCheckUrl = `https://webcast.tiktok.com/webcast/room/check_alive/?aid=1988&room_ids=${roomId}`;
        const response = await retryRequest(() => apiClient.get(liveCheckUrl));
        const isLive = response.data?.data?.[0]?.alive ?? false;
        return isLive;
    } catch (error) {
        if (error.code !== 'ETIMEDOUT') {
            console.error(`[TikTok Service] خطأ في isUserLive للغرفة ${roomId}:`, error.message);
        }
        return false;
    }
}

async function getLiveStreamUrl(roomId) {
    try {
        const roomInfoUrl = `https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=${roomId}`;
        const response = await apiClient.get(roomInfoUrl);

        const streamDataString = response.data?.data?.stream_url?.live_core_sdk_data?.pull_data?.stream_data;
        if (!streamDataString) {
            const flvUrl = response.data?.data?.stream_url?.flv_pull_url?.FULL_HD1;
            if(flvUrl) return flvUrl;
            throw new Error('لم يتم العثور على بيانات البث (stream_data).');
        }

        const streamData = JSON.parse(streamDataString);
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

export {
    getRoomId,
    isUserLive,
    getLiveStreamUrl,
};
```

# src/utils/logger.util.js

```js

```

# src/utils/path.util.js

```js
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

```

# src/utils/video.util.js

```js
// استيراد مكتبات التعامل مع المسارات والملفات
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
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

export {
    convertFlvToMp4
};
```

# test-drive-upload.js

```js
// test-oauth-upload.js
import { google } from 'googleapis';
import fs from 'fs/promises';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import path from 'path';
import 'dotenv/config';

async function testOAuthUpload() {
    console.log('🚀 بدء سكربت اختبار الرفع باستخدام OAuth 2.0...');

    const tempFilePath = path.join(process.cwd(), 'test-oauth-file.txt');

    try {
        // --- 1. التحقق من الإعدادات ---
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const credentialsPath = path.join(process.cwd(), 'oauth-credentials.json');
        const tokenPath = path.join(process.cwd(), 'token.json');

        if (!folderId) throw new Error('❌ متغير GOOGLE_DRIVE_FOLDER_ID غير موجود في ملف .env');
        if (!existsSync(credentialsPath)) throw new Error('❌ لم يتم العثور على ملف oauth-credentials.json');
        if (!existsSync(tokenPath)) throw new Error("❌ لم يتم العثور على ملف token.json. يرجى تشغيل 'node generate-token.js' أولاً.");
        
        console.log('✅ تم العثور على جميع الملفات والإعدادات المطلوبة.');

        // --- 2. المصادقة باستخدام OAuth 2.0 ---
        const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(credentialsContent).installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        
        const tokenContent = await fs.readFile(tokenPath, 'utf8');
        oAuth2Client.setCredentials(JSON.parse(tokenContent));

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        console.log('✅ تمت المصادقة بنجاح (باسم المستخدم).');

        // --- 3. إنشاء ورفع الملف ---
        await fs.writeFile(tempFilePath, `Test upload successful at ${new Date().toISOString()}`);
        console.log(`📝 تم إنشاء ملف اختبار مؤقت: ${tempFilePath}`);

        const fileMetadata = {
            name: 'oauth-test-success.txt',
            parents: [folderId], // استخدم المجلد العادي أو Shared Drive ID
        };
        const media = {
            mimeType: 'text/plain',
            body: createReadStream(tempFilePath),
        };

        console.log(`📤 جاري رفع الملف إلى المجلد ID: ${folderId}...`);
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
            supportsAllDrives: true, // ضروري إذا كان المجلد في Shared Drive
        });

        // --- 4. عرض النتيجة ---
        console.log('\n' + '🎉'.repeat(20));
        console.log('🎉 نجاح! تم رفع الملف بنجاح باستخدام OAuth 2.0!');
        console.log('🎉'.repeat(20));
        console.log(`📄 معرف الملف: ${response.data.id}`);
        console.log(`🏷️ اسم الملف: ${response.data.name}`);
        console.log(`🔗 رابط الملف (اذهب إليه للتأكد): ${response.data.webViewLink}`);
        console.log('\n✅ بما أن هذا السكربت نجح، فالبوت الرئيسي سيعمل الآن بالتأكيد.');

    } catch (error) {
        console.error('\n' + '❌'.repeat(20));
        console.error('❌ فشل الاختبار! حدث خطأ أثناء الرفع.');
        console.error('❌'.repeat(20));
        console.error('السبب:', error.message);
    } finally {
        // --- 5. تنظيف ---
        if (existsSync(tempFilePath)) {
            unlinkSync(tempFilePath);
            console.log('🗑️ تم حذف ملف الاختبار المؤقت.');
        }
    }
}

testOAuthUpload();
```

# test-file.txt

```txt
This is a test file created at 2025-11-17T23:02:39.748Z
```

# TikTok to Google Drive Uploader.json

```json
{
  "name": "TikTok to Google Drive Uploader",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "tiktok-upload",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        0,
        0
      ],
      "id": "87976b91-51af-4c28-9898-4d22add94766",
      "name": "Webhook",
      "webhookId": "1628a9a9-0cb4-497d-9c93-b7c58f6e880f"
    },
    {
      "parameters": {
        "bucketName": "={{ $json.body.s3Bucket || \"tiktok-videos-temp\" }}",
        "fileKey": "={{ $json.body.s3Key }}"
      },
      "type": "n8n-nodes-base.s3",
      "typeVersion": 1,
      "position": [
        208,
        0
      ],
      "id": "8e6ba808-6ee7-40af-be90-5d6671784ba7",
      "name": "Download a file",
      "credentials": {
        "s3": {
          "id": "xTgV5rll9Z4wio43",
          "name": "S3 account"
        }
      }
    },
    {
      "parameters": {
        "name": "={{ $json.body.filename }}",
        "driveId": {
          "__rl": true,
          "value": "My Drive",
          "mode": "list",
          "cachedResultName": "My Drive",
          "cachedResultUrl": "https://drive.google.com/drive/my-drive"
        },
        "folderId": {
          "__rl": true,
          "value": "14Rpdde_a3O8WdFEWkXLO8Jb2sljWVzXE",
          "mode": "list",
          "cachedResultName": "TikTok",
          "cachedResultUrl": "https://drive.google.com/drive/folders/14Rpdde_a3O8WdFEWkXLO8Jb2sljWVzXE"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [
        416,
        0
      ],
      "id": "04c102fb-1e36-4b39-b935-5a78ff7ce032",
      "name": "Upload file",
      "credentials": {
        "googleDriveOAuth2Api": {
          "id": "uOBgaB3ncwMzRlOD",
          "name": "DOMAIN2DZ-ot6dzz"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://api.telegram.org/bot{{ $('Webhook').item.json.body.botToken }}/sendMessage",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"chat_id\": \"{{ $('Webhook').item.json.body.chatId }}\",\n  \"text\": \"✅ تم رفع الفيديو بنجاح!\\n\\n👤 المستخدم: {{ $('Webhook').item.json.body.username }}\\n📁 الملف: {{ $('Webhook').item.json.body.filename }}\\n📏 الحجم: {{ (Number($json.size) / 1024 / 1024).toFixed(2) }} MB\\n\\n🔗 رابط المشاهدة:\\n{{ $json.webViewLink }}\",\n  \"parse_mode\": \"HTML\"\n}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        624,
        0
      ],
      "id": "21a94cd2-04dd-4f9d-bc62-dbe736b7fc55",
      "name": "Telegram"
    },
    {
      "parameters": {
        "operation": "delete",
        "bucketName": "tiktok-videos-temp",
        "fileKey": "={{ $('Webhook').item.json.body.s3Key }}",
        "options": {}
      },
      "type": "n8n-nodes-base.s3",
      "typeVersion": 1,
      "position": [
        832,
        0
      ],
      "id": "7c22cf14-2053-451c-9c45-ed3851d01af3",
      "name": "Delete a file",
      "credentials": {
        "s3": {
          "id": "xTgV5rll9Z4wio43",
          "name": "S3 account"
        }
      }
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Download a file",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Download a file": {
      "main": [
        [
          {
            "node": "Upload file",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Upload file": {
      "main": [
        [
          {
            "node": "Telegram",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Telegram": {
      "main": [
        [
          {
            "node": "Delete a file",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "501a491f-453f-42c4-990b-cef814ce8c07",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "9768260df5523810b602f87f503a49f0a068d024c810435bfab2b301bad3cd64"
  },
  "id": "Edmo9cKM1CGWIN15",
  "tags": []
}
```

