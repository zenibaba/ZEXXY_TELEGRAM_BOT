/**
 * Command Handlers
 */

const { fetchDB, pushDB, generateKey, parseDuration, getTimestamp } = require('./database');

async function handleStart() {
    return `*🔐 ZEXXY Key Manager Bot*\n\n` +
        `*Commands:*\n` +
        `\`/gen <duration> <amount>\` - Generate keys\n` +
        `\`/status\` - System stats\n` +
        `\`/keys\` - List unused keys\n` +
        `\`/broadcast <msg>\` - Send notification\n` +
        `\`/extend <user> <days>\` - Extend time\n\n` +
        `*Duration: 1d, 1w, 1m, 1y, lifetime*`;
}

async function handleGen(args) {
    if (args.length < 2) return "⚠️ Usage: `/gen <duration> <amount>`";

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount < 1 || amount > 50) return "❌ Amount: 1-50";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    if (!db.keys) db.keys = [];
    const duration = parseDuration(args[0]);
    const keys = [];

    for (let i = 0; i < amount; i++) {
        const key = generateKey();
        keys.push(key);
        db.keys.push({
            key,
            duration_days: duration,
            status: 'UNUSED',
            note: args.slice(2).join(' ') || 'Generated',
            type: 'USER',
            created_at: getTimestamp(),
            used_by: null,
            used_at: null,
            universal_hwid: false,
            reusable: false
        });
    }

    await pushDB(db, sha, `➕ Generated ${amount} keys`);
    return `✅ *Generated ${amount} Keys*\n\n${keys.map(k => `\`${k}\``).join('\n')}`;
}

async function handleStatus() {
    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const users = db.users || [];
    const keys = db.keys || [];

    return `📊 *System Status*\n\n` +
        `👥 Users: ${users.length}\n` +
        `🎫 Keys: ${keys.length}\n` +
        `✅ Unused: ${keys.filter(k => k.status === 'UNUSED').length}`;
}

async function handleKeys() {
    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const unused = (db.keys || []).filter(k => k.status === 'UNUSED');
    if (unused.length === 0) return "⚠️ No unused keys";

    let msg = `*🎫 Unused Keys (${unused.length})*\n\n`;
    unused.slice(0, 10).forEach(k => msg += `\`${k.key}\`\n`);
    if (unused.length > 10) msg += `\n_...${unused.length - 10} more_`;
    return msg;
}

async function handleBroadcast(args) {
    if (args.length < 1) return "⚠️ Usage: `/broadcast <message>`";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    if (!db.broadcasts) db.broadcasts = [];
    const id = `BR-${Math.floor(Math.random() * 900000 + 100000)}`;

    db.broadcasts.push({
        id,
        title: 'Notification',
        message: args.join(' '),
        target: 'ALL',
        link: null,
        created_at: getTimestamp(),
        active: true
    });

    await pushDB(db, sha, `📢 Broadcast ${id}`);
    return `✅ Broadcast created!\n\nID: \`${id}\``;
}

async function handleExtend(args) {
    if (args.length < 2) return "⚠️ Usage: `/extend <user> <days>`";

    const username = args[0];
    const days = parseInt(args[1]);
    if (isNaN(days)) return "❌ Days must be number";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    const user = (db.users || []).find(u => u.username === username);
    if (!user) return `❌ User ${username} not found`;
    if (user.expiry === 9999999999999) return "❌ Already lifetime";

    user.expiry += days * 86400;
    await pushDB(db, sha, `⏱️ Extended ${username} by ${days}d`);
    return `✅ Extended ${days} days for ${username}`;
}

module.exports = { handleStart, handleGen, handleStatus, handleKeys, handleBroadcast, handleExtend };
