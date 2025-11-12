import axios from 'axios';
import 'dotenv/config';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
};
if (process.env.TIKTOK_COOKIE) {
    console.log('[TikTok Service] تم العثور على كوكي، سيتم استخدامه.');
    headers['Cookie'] = process.env.TIKTOK_COOKIE;
}
const apiClient = axios.create({ headers });

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
        const response = await apiClient.get(liveCheckUrl);
        const isLive = response.data?.data?.[0]?.alive ?? false;
        return isLive;
    } catch (error) {
        console.error(`[TikTok Service] خطأ في isUserLive للغرفة ${roomId}:`, error.message);
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