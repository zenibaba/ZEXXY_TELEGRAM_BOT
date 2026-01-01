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

module.exports = { fetchDB, pushDB, generateKey, parseDuration, getTimestamp };
