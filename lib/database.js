/**
 * GitHub Database Layer
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'zenibaba';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'ZEXXY_KEYAUTH';
const DB_PATH = 'db.json';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DB_PATH}`;

async function fetchDB() {
    const response = await fetch(API_BASE, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) return { db: null, sha: null };
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8').trim();
    if (!content) return { db: null, sha: data.sha };

    return { db: JSON.parse(content), sha: data.sha };
}

async function pushDB(dbContent, sha, message) {
    const contentB64 = Buffer.from(JSON.stringify(dbContent, null, 2)).toString('base64');
    const payload = { message, content: contentB64, branch: 'main' };
    if (sha) payload.sha = sha;

    const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    return response.ok;
}

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'ZEXXY-';
    for (let i = 0; i < 12; i++) {
        if (i === 4 || i === 8) key += '-';
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

function parseDuration(str) {
    str = str.toLowerCase();
    if (str === "lifetime") return "LIFETIME";
    if (str.includes('d')) return parseInt(str);
    if (str.includes('w')) return parseInt(str) * 7;
    if (str.includes('m')) return parseInt(str) * 30;
    if (str.includes('y')) return parseInt(str) * 365;
    return 30;
}

function getTimestamp() {
    return new Date().toISOString();
}

function hashPassword(password) {
    // Simple hash for demo - in production use bcrypt or similar
    return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// User Management Functions
async function activateKey(key, username, password, hwid) {
    const { db, sha } = await fetchDB();
    if (!db) return { success: false, message: 'Database error' };

    if (!db.keys) db.keys = [];
    if (!db.users) db.users = [];

    // Find key
    const keyObj = db.keys.find(k => k.key === key);
    if (!keyObj) return { success: false, message: 'Invalid key' };
    if (keyObj.status === 'BANNED') return { success: false, message: 'Key is banned' };
    // Allow if: key is unused, reusable, OR universal
    if (keyObj.status === 'USED' && !keyObj.reusable && !keyObj.universal_hwid) {
        return { success: false, message: 'Key already used' };
    }
    // Check if user exists
    if (db.users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists' };
    }

    // Calculate expiry
    let expiry;
    if (keyObj.duration_days === 'LIFETIME') {
        expiry = 9999999999999;
    } else {
        expiry = Math.floor(Date.now() / 1000) + (keyObj.duration_days * 86400);
    }

    // Create user
    const user = {
        username,
        password: hashPassword(password),
        hwid: keyObj.universal_hwid ? null : hwid,
        rank: keyObj.type || 'USER',
        status: 'ACTIVE',
        expiry,
        created_at: getTimestamp(),
        last_login: getTimestamp()
    };

    db.users.push(user);

    // Mark key as used (unless reusable OR universal)
    // Universal keys can be used by multiple devices (universal_hwid = true)
    // Reusable keys can be used multiple times (reusable = true)
    if (!keyObj.reusable && !keyObj.universal_hwid) {
        keyObj.status = 'USED';
        keyObj.used_by = username;
        keyObj.used_at = getTimestamp();
    }

    await pushDB(db, sha, `✅ Activated: ${username}`);
    return { success: true, message: 'Account activated successfully', user };
}

async function verifyLogin(username, password, hwid) {
    const { db } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found' };
    if (!verifyPassword(password, user.password)) {
        return { success: false, message: 'Invalid password' };
    }
    if (user.status === 'BANNED') return { success: false, message: 'Account banned' };

    // Check HWID (unless universal)
    if (user.hwid && user.hwid !== hwid) {
        return { success: false, message: 'HWID mismatch' };
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (user.expiry !== 9999999999999 && user.expiry < now) {
        return { success: false, message: 'Subscription expired' };
    }

    return { success: true, message: 'Login successful', user };
}

// Key Management Functions
async function removeKey(key) {
    const { db, sha } = await fetchDB();
    if (!db || !db.keys) return { success: false, message: 'Database error' };

    const index = db.keys.findIndex(k => k.key === key);
    if (index === -1) return { success: false, message: 'Key not found' };

    db.keys.splice(index, 1);
    await pushDB(db, sha, `🗑️ Removed key: ${key}`);
    return { success: true, message: 'Key removed successfully' };
}

async function banKey(key) {
    const { db, sha } = await fetchDB();
    if (!db || !db.keys) return { success: false, message: 'Database error' };

    const keyObj = db.keys.find(k => k.key === key);
    if (!keyObj) return { success: false, message: 'Key not found' };

    keyObj.status = 'BANNED';
    await pushDB(db, sha, `🚫 Banned key: ${key}`);
    return { success: true, message: 'Key banned successfully' };
}

async function unbanKey(key) {
    const { db, sha } = await fetchDB();
    if (!db || !db.keys) return { success: false, message: 'Database error' };

    const keyObj = db.keys.find(k => k.key === key);
    if (!keyObj) return { success: false, message: 'Key not found' };

    keyObj.status = keyObj.used_by ? 'USED' : 'UNUSED';
    await pushDB(db, sha, `✅ Unbanned key: ${key}`);
    return { success: true, message: 'Key unbanned successfully' };
}

// User Operations
async function resetHWID(username) {
    const { db, sha } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found' };

    const oldHwid = user.hwid;
    user.hwid = null;
    await pushDB(db, sha, `🔄 Reset HWID: ${username}`);
    return { success: true, message: 'HWID reset successfully', old_hwid: oldHwid };
}

async function resetPassword(username, newPassword) {
    const { db, sha } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found' };

    user.password = hashPassword(newPassword);
    await pushDB(db, sha, `🔑 Reset password: ${username}`);
    return { success: true, message: 'Password reset successfully' };
}

async function banUser(username) {
    const { db, sha } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found' };

    user.status = 'BANNED';
    await pushDB(db, sha, `🚫 Banned user: ${username}`);
    return { success: true, message: 'User banned successfully' };
}

async function unbanUser(username) {
    const { db, sha } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found' };

    user.status = 'ACTIVE';
    await pushDB(db, sha, `✅ Unbanned user: ${username}`);
    return { success: true, message: 'User unbanned successfully' };
}

async function deleteUser(username) {
    const { db, sha } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const index = db.users.findIndex(u => u.username === username);
    if (index === -1) return { success: false, message: 'User not found' };

    db.users.splice(index, 1);
    await pushDB(db, sha, `🗑️ Deleted user: ${username}`);
    return { success: true, message: 'User deleted successfully' };
}

async function extendUser(username, days) {
    const { db, sha } = await fetchDB();
    if (!db || !db.users) return { success: false, message: 'Database error' };

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: 'User not found' };
    if (user.expiry === 9999999999999) {
        return { success: false, message: 'Already lifetime' };
    }

    user.expiry += days * 86400;
    await pushDB(db, sha, `⏱️ Extended ${username} by ${days}d`);

    const newExpiry = new Date(user.expiry * 1000).toLocaleString();
    return { success: true, message: `Extended ${days} days`, new_expiry: newExpiry };
}

// Broadcast Operations
async function deleteBroadcast(id) {
    const { db, sha } = await fetchDB();
    if (!db || !db.broadcasts) return { success: false, message: 'Database error' };

    const index = db.broadcasts.findIndex(b => b.id === id);
    if (index === -1) return { success: false, message: 'Broadcast not found' };

    db.broadcasts.splice(index, 1);
    await pushDB(db, sha, `🗑️ Deleted broadcast: ${id}`);
    return { success: true, message: 'Broadcast deleted successfully' };
}

async function toggleBroadcast(id) {
    const { db, sha } = await fetchDB();
    if (!db || !db.broadcasts) return { success: false, message: 'Database error' };

    const broadcast = db.broadcasts.find(b => b.id === id);
    if (!broadcast) return { success: false, message: 'Broadcast not found' };

    broadcast.active = !broadcast.active;
    await pushDB(db, sha, `🔄 Toggled broadcast: ${id}`);
    return { success: true, message: 'Broadcast toggled', active: broadcast.active };
}

module.exports = {
    fetchDB, pushDB, generateKey, parseDuration, getTimestamp,
    activateKey, verifyLogin, removeKey, banKey, unbanKey,
    resetHWID, resetPassword, banUser, unbanUser, deleteUser, extendUser,
    deleteBroadcast, toggleBroadcast
};
