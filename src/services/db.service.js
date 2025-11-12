import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

/**
 * Initializes the database with default values
 * @returns {Promise<void>}
 */
export async function setupDatabase() {
    const dbPath = path.join(__dirname, '..', '..', 'db.json');
    const adapter = new JSONFile(dbPath);
    db = new Low(adapter, { monitoredUsers: [] });

    await db.read();
    db.data ||= { monitoredUsers: [] };
    await db.write();
    console.log('[DB] تم إعداد قاعدة البيانات بنجاح.');
}

/**
 * Adds a user to the monitoring list
 * @param {string} username - TikTok username
 * @param {number} chatId - Telegram chat ID
 * @returns {Promise<void>}
 */
export async function addUserToMonitor(username, chatId) {
    await db.read();
    const exists = db.data.monitoredUsers.some(u => u.username === username && u.chatId === chatId);
    if (!exists) {
        db.data.monitoredUsers.push({ username, chatId, isRecording: false });
        await db.write();
    }
}

/**
 * Removes a user from the monitoring list
 * @param {string} username - TikTok username
 * @param {number} chatId - Telegram chat ID
 * @returns {Promise<void>}
 */
export async function removeUserFromMonitor(username, chatId) {
    await db.read();
    db.data.monitoredUsers = db.data.monitoredUsers.filter(u => !(u.username === username && u.chatId === chatId));
    await db.write();
}

/**
 * Retrieves all monitored users
 * @returns {Promise<Array<{username: string, chatId: number, isRecording: boolean}>>}
 */
export async function getMonitoredUsers() {
    await db.read();
    return db.data.monitoredUsers;
}