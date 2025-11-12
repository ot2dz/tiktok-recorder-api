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