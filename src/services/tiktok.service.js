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