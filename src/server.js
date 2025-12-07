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
