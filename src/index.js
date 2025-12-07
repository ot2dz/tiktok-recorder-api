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
