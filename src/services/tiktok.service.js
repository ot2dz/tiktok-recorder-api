import axios from 'axios';
import 'dotenv/config';
import { TIKTOK_API } from '../config/constants.js';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
};
if (process.env.TIKTOK_COOKIE) {
    console.log('[TikTok Service] تم العثور على كوكي، سيتم استخدامه.');
    headers['Cookie'] = process.env.TIKTOK_COOKIE;
}
const apiClient = axios.create({ headers });

/**
 * Fetches the Room ID for a TikTok user's live stream
 * @param {string} username - TikTok username
 * @returns {Promise<string|null>} Room ID if user is live, null otherwise
 */
async function getRoomId(username) {
    try {
        const signResponse = await apiClient.get(`${TIKTOK_API.SIGN_URL}?unique_id=${username}`);
        const signedPath = signResponse.data.signed_path;

        if (!signedPath) {
            return null;
        }

        const tiktokApiUrl = `${TIKTOK_API.BASE_URL}${signedPath}`;
        const roomInfoResponse = await apiClient.get(tiktokApiUrl);
        const roomId = roomInfoResponse.data?.data?.user?.roomId;
        
        if (!roomId || roomId === "0") {
            return null;
        }
        return roomId;

    } catch (error) {
        console.error(`[TikTok Service] Error in getRoomId for user ${username}:`, error.message);
        return null;
    }
}

/**
 * Checks if a live stream room is currently active
 * @param {string} roomId - The room ID to check
 * @returns {Promise<boolean>} true if the stream is live, false otherwise
 */
async function isUserLive(roomId) {
    try {
        const liveCheckUrl = `${TIKTOK_API.WEBCAST_URL}/webcast/room/check_alive/?aid=${TIKTOK_API.AID}&room_ids=${roomId}`;
        const response = await apiClient.get(liveCheckUrl);
        const isLive = response.data?.data?.[0]?.alive ?? false;
        return isLive;
    } catch (error) {
        console.error(`[TikTok Service] Error in isUserLive for room ${roomId}:`, error.message);
        return false;
    }
}

/**
 * Retrieves the live stream URL for a given room
 * @param {string} roomId - The room ID
 * @returns {Promise<string|null>} Stream URL if found, null otherwise
 */
async function getLiveStreamUrl(roomId) {
    try {
        const roomInfoUrl = `${TIKTOK_API.WEBCAST_URL}/webcast/room/info/?aid=${TIKTOK_API.AID}&room_id=${roomId}`;
        const response = await apiClient.get(roomInfoUrl);

        const streamDataString = response.data?.data?.stream_url?.live_core_sdk_data?.pull_data?.stream_data;
        if (!streamDataString) {
            const flvUrl = response.data?.data?.stream_url?.flv_pull_url?.FULL_HD1;
            if(flvUrl) return flvUrl;
            throw new Error('Stream data not found.');
        }

        const streamData = JSON.parse(streamDataString);
        const streamUrl = streamData?.data?.origin?.main?.flv;
        
        if (!streamUrl) {
            throw new Error('FLV URL not found in stream data.');
        }

        return streamUrl;
    } catch (error) {
        console.error(`[TikTok Service] Error in getLiveStreamUrl for room ${roomId}:`, error.message);
        return null;
    }
}

export {
    getRoomId,
    isUserLive,
    getLiveStreamUrl,
};