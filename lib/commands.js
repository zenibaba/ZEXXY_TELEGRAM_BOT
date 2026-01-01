/**
 * Command Handlers - Enhanced Version
 */

const {
    fetchDB, pushDB, generateKey, parseDuration, getTimestamp,
    activateKey, verifyLogin, removeKey, banKey, unbanKey,
    resetHWID, resetPassword, banUser, unbanUser, deleteUser, extendUser,
    deleteBroadcast, toggleBroadcast
} = require('./database');

async function handleStart() {
    return `*🔐 ZEXXY Key Manager Bot*\n\n` +
        `*📋 Information Commands:*\n` +
        `\`/start\` - Show this help\n` +
        `\`/status\` - System statistics\n` +
        `\`/keys\` - List unused keys\n` +
        `\`/users\` - List all users\n\n` +
        `*🎫 Key Generation:*\n` +
        `\`/gen <dur> <amt> [note]\` - Generate keys\n` +
        `\`/genuniversal <dur> <amt>\` - HWID-free keys\n` +
        `\`/genreusable <dur> <amt>\` - Unlimited use\n` +
        `\`/custom\` - Generation guide\n\n` +
        `*🔧 Key Management:*\n` +
        `\`/removekey <key>\` - Delete key\n` +
        `\`/bankey <key>\` - Ban key\n` +
        `\`/unbankey <key>\` - Unban key\n\n` +
        `*👥 User Management:*\n` +
        `\`/resethwid <user>\` - Reset HWID\n` +
        `\`/resetpass <user> <pass>\` - Reset password\n` +
        `\`/banuser <user>\` - Ban user\n` +
        `\`/unbanuser <user>\` - Unban user\n` +
        `\`/deleteuser <user>\` - Delete user\n` +
        `\`/extend <user> <days>\` - Extend time\n\n` +
        `*📊 Analytics:*\n` +
        `\`/userstats\` - User stats dashboard\n` +
        `\`/userinfo <user>\` - User profile & stats\n` +
        `\`/pullrarity <user> [n]\` - Get rarity IDs\n\n` +
        `*📢 Broadcasts:*\n` +
        `\`/broadcast [target] <msg>\` - Create\n` +
        `\`/broadcasts\` - List all\n` +
        `\`/togglebroadcast <id>\` - Toggle\n` +
        `\`/deletebroadcast <id>\` - Delete\n\n` +
        `*🧪 Testing:*\n` +
        `\`/activate <key> <user> <pass>\` - Test activation\n` +
        `\`/login <user> <pass> <hwid>\` - Test login\n\n` +
        `*Duration: 1d, 1w, 1m, 1y, lifetime*`;
}

async function handleGen(args) {
    if (args.length < 2) return "⚠️ Usage: `/gen <duration> <amount> [note]`";

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount < 1 || amount > 50) return "❌ Amount: 1-50";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    if (!db.keys) db.keys = [];
    const duration = parseDuration(args[0]);
    const keys = [];
    const note = args.slice(2).join(' ') || 'Generated';

    for (let i = 0; i < amount; i++) {
        const key = generateKey();
        keys.push(key);
        db.keys.push({
            key,
            duration_days: duration,
            status: 'UNUSED',
            note,
            type: 'USER',
            created_at: getTimestamp(),
            used_by: null,
            used_at: null,
            universal_hwid: false,
            reusable: false
        });
    }

    await pushDB(db, sha, `➕ Generated ${amount} keys`);

    if (keys.length <= 10) {
        return `✅ *Generated ${amount} Keys* (${duration}):\n\n${keys.map(k => `\`${k}\``).join('\n')}`;
    } else {
        const preview = keys.slice(0, 5).map(k => `\`${k}\``).join('\n');
        return `✅ *Generated ${amount} Keys* (${duration})\n\n${preview}\n\n_...and ${amount - 5} more_`;
    }
}

async function handleGenUniversal(args) {
    if (args.length < 2) return "⚠️ Usage: `/genuniversal <duration> <amount> [note]`\n\n" +
        "*Universal Keys:* HWID-Free, multi-device support";

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount < 1 || amount > 50) return "❌ Amount: 1-50";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    if (!db.keys) db.keys = [];
    const duration = parseDuration(args[0]);
    const keys = [];
    const note = args.slice(2).join(' ') || 'Universal';

    for (let i = 0; i < amount; i++) {
        const key = generateKey();
        keys.push(key);
        db.keys.push({
            key,
            duration_days: duration,
            status: 'UNUSED',
            note,
            type: 'USER',
            created_at: getTimestamp(),
            used_by: null,
            used_at: null,
            universal_hwid: true,
            reusable: false
        });
    }

    await pushDB(db, sha, `➕ Generated ${amount} universal keys`);
    return `✅ *Generated ${amount} Universal Keys*\n🌍 *HWID-Free*\n\n${keys.slice(0, 10).map(k => `\`${k}\``).join('\n')}`;
}

async function handleGenReusable(args) {
    if (args.length < 2) return "⚠️ Usage: `/genreusable <duration> <amount> [note]`\n\n" +
        "*Reusable Keys:* Unlimited activations";

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount < 1 || amount > 50) return "❌ Amount: 1-50";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    if (!db.keys) db.keys = [];
    const duration = parseDuration(args[0]);
    const keys = [];
    const note = args.slice(2).join(' ') || 'Reusable';

    for (let i = 0; i < amount; i++) {
        const key = generateKey();
        keys.push(key);
        db.keys.push({
            key,
            duration_days: duration,
            status: 'UNUSED',
            note,
            type: 'USER',
            created_at: getTimestamp(),
            used_by: null,
            used_at: null,
            universal_hwid: false,
            reusable: true
        });
    }

    await pushDB(db, sha, `➕ Generated ${amount} reusable keys`);
    return `✅ *Generated ${amount} Reusable Keys*\n♾️ *Unlimited Uses*\n\n${keys.slice(0, 10).map(k => `\`${k}\``).join('\n')}`;
}

async function handleCustom() {
    return `*🎨 Custom Key Generation Guide*\n\n` +
        `*Duration Examples:*\n` +
        `• \`/gen 3d 5 Trial\` - 3 days\n` +
        `• \`/gen 14d 10 Promo\` - 2 weeks\n` +
        `• \`/gen 90d 1 Quarterly\` - 3 months\n` +
        `• \`/gen lifetime 1 VIP\` - Lifetime\n\n` +
        `*Special Key Types:*\n` +
        `• \`/genuniversal 1m 5\` - Multi-device\n` +
        `• \`/genreusable 1w 3\` - Unlimited uses`;
}

async function handleStatus() {
    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const users = db.users || [];
    const keys = db.keys || [];
    const broadcasts = db.broadcasts || [];

    const unused = keys.filter(k => k.status === 'UNUSED').length;
    const used = keys.filter(k => k.status === 'USED').length;
    const banned = keys.filter(k => k.status === 'BANNED').length;

    return `*📊 ZEXXY System Status*\n\n` +
        `👥 Total Users: \`${users.length}\`\n` +
        `🎫 Total Keys: \`${keys.length}\`\n` +
        `✅ Unused Keys: \`${unused}\`\n` +
        `✔️ Used Keys: \`${used}\`\n` +
        `🚫 Banned Keys: \`${banned}\`\n` +
        `📢 Broadcasts: \`${broadcasts.length}\`\n\n` +
        `🔗 Repository: \`zenibaba/ZEXXY_KEYAUTH\`\n` +
        `✅ Database Connected`;
}

async function handleKeys() {
    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const unused = (db.keys || []).filter(k => k.status === 'UNUSED');
    if (unused.length === 0) return "⚠️ No unused keys. Use `/gen` to create some.";

    // Group by duration
    const byDuration = {};
    unused.forEach(k => {
        const dur = String(k.duration_days);
        if (!byDuration[dur]) byDuration[dur] = [];
        byDuration[dur].push(k);
    });

    let msg = `*🎫 Unused Keys (${unused.length} total)*\n\n`;
    for (const [dur, keys] of Object.entries(byDuration)) {
        msg += `*${dur}d:* ${keys.length} keys\n`;
    }

    msg += `\n_Use /gen to create more keys_`;
    return msg;
}

async function handleUsers() {
    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const users = db.users || [];
    if (users.length === 0) return "⚠️ No users registered yet.";

    // Group by rank
    const byRank = {};
    users.forEach(u => {
        const rank = u.rank || 'USER';
        if (!byRank[rank]) byRank[rank] = [];
        byRank[rank].push(u);
    });

    let msg = `*👥 Registered Users (${users.length} total)*\n\n`;
    for (const rank of ['OWNER', 'ADMIN', 'VIP', 'USER']) {
        if (byRank[rank]) {
            const active = byRank[rank].filter(u => u.status === 'ACTIVE').length;
            const banned = byRank[rank].filter(u => u.status === 'BANNED').length;
            msg += `*${rank}:* ${byRank[rank].length} (${active} active, ${banned} banned)\n`;
        }
    }

    return msg;
}

async function handleActivate(args) {
    if (args.length < 3) {
        return "⚠️ Usage: `/activate <key> <username> <password>`\n\nTest key activation";
    }

    const [key, username, password] = args;
    const hwid = `TEST-HWID-${Date.now()}`;

    const result = await activateKey(key, username, password, hwid);
    if (!result.success) return `❌ ${result.message}`;

    const user = result.user;
    const expiry = user.expiry === 9999999999999 ? 'LIFETIME' :
        new Date(user.expiry * 1000).toLocaleString();

    return `✅ *Activation Successful!*\n\n` +
        `👤 Username: \`${username}\`\n` +
        `👑 Rank: \`${user.rank}\`\n` +
        `⏰ Expiry: \`${expiry}\`\n` +
        `📱 HWID: \`${hwid.slice(0, 20)}...\`\n` +
        `✔️ Status: \`${user.status}\``;
}

async function handleLogin(args) {
    if (args.length < 3) {
        return "⚠️ Usage: `/login <username> <password> <hwid>`\n\nTest user login";
    }

    const [username, password, hwid] = args;

    const result = await verifyLogin(username, password, hwid);
    if (!result.success) return `❌ ${result.message}`;

    const user = result.user;
    const expiry = user.expiry === 9999999999999 ? 'LIFETIME' :
        new Date(user.expiry * 1000).toLocaleString();

    return `✅ *Login Successful!*\n\n` +
        `👤 Username: \`${username}\`\n` +
        `👑 Rank: \`${user.rank}\`\n` +
        `⏰ Expiry: \`${expiry}\`\n` +
        `📱 HWID: ${user.hwid ? `\`${user.hwid.slice(0, 20)}...\`` : 'Universal'}\n` +
        `✔️ Status: \`${user.status}\``;
}

// Key Management
async function handleRemoveKey(args) {
    if (args.length < 1) return "⚠️ Usage: `/removekey <key>`";
    const result = await removeKey(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

async function handleBanKey(args) {
    if (args.length < 1) return "⚠️ Usage: `/bankey <key>`";
    const result = await banKey(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

async function handleUnbanKey(args) {
    if (args.length < 1) return "⚠️ Usage: `/unbankey <key>`";
    const result = await unbanKey(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

// User Management
async function handleResetHWID(args) {
    if (args.length < 1) return "⚠️ Usage: `/resethwid <username>`";
    const result = await resetHWID(args[0]);
    if (!result.success) return `❌ ${result.message}`;
    return `✅ ${result.message}\n\nOld HWID: \`${result.old_hwid ? result.old_hwid.slice(0, 20) : 'None'}...\``;
}

async function handleResetPass(args) {
    if (args.length < 2) return "⚠️ Usage: `/resetpass <username> <newpassword>`";
    const result = await resetPassword(args[0], args[1]);
    if (!result.success) return `❌ ${result.message}`;
    return `✅ ${result.message}\n\nNew password: \`${args[1]}\``;
}

async function handleBanUser(args) {
    if (args.length < 1) return "⚠️ Usage: `/banuser <username>`";
    const result = await banUser(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

async function handleUnbanUser(args) {
    if (args.length < 1) return "⚠️ Usage: `/unbanuser <username>`";
    const result = await unbanUser(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

async function handleDeleteUser(args) {
    if (args.length < 1) return "⚠️ Usage: `/deleteuser <username>`";
    const result = await deleteUser(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

async function handleExtend(args) {
    if (args.length < 2) return "⚠️ Usage: `/extend <username> <days>`\n\nExample: `/extend john 30`";

    const username = args[0];
    const days = parseInt(args[1]);
    if (isNaN(days)) return "❌ Days must be a number";

    const result = await extendUser(username, days);
    if (!result.success) return `❌ ${result.message}`;
    return `✅ ${result.message}\n\nNew expiry: \`${result.new_expiry}\``;
}

// Broadcast System
async function handleBroadcast(args) {
    if (args.length < 1) {
        return "⚠️ Usage: `/broadcast [target] <message>`\n\n" +
            "Targets: ALL, USER, VIP, ADMIN, OWNER\n" +
            "Example: `/broadcast VIP Special offer!`";
    }

    const targets = ['ALL', 'USER', 'VIP', 'ADMIN', 'OWNER'];
    let target = 'ALL';
    let message;

    if (targets.includes(args[0].toUpperCase())) {
        target = args[0].toUpperCase();
        message = args.slice(1).join(' ');
    } else {
        message = args.join(' ');
    }

    if (!message) return "❌ Message cannot be empty";

    const { db, sha } = await fetchDB();
    if (!db) return "❌ Database error";

    if (!db.broadcasts) db.broadcasts = [];
    const id = `BR-${Math.floor(Math.random() * 900000 + 100000)}`;

    db.broadcasts.push({
        id,
        title: 'Notification',
        message,
        target,
        link: null,
        created_at: getTimestamp(),
        active: true
    });

    await pushDB(db, sha, `📢 Broadcast ${id}`);
    return `✅ Broadcast created!\n\n` +
        `📢 ID: \`${id}\`\n` +
        `🎯 Target: ${target}\n` +
        `💬 Message: ${message.slice(0, 50)}...`;
}

async function handleBroadcasts() {
    const { db } = await fetchDB();
    if (!db || !db.broadcasts) return "❌ Database error";

    const broadcasts = db.broadcasts || [];
    if (broadcasts.length === 0) return "⚠️ No broadcasts found";

    let msg = `*📢 All Broadcasts (${broadcasts.length})*\n\n`;
    broadcasts.slice(0, 10).forEach(b => {
        const status = b.active ? '🟢 Active' : '🔴 Inactive';
        msg += `*${b.id}* - ${status}\n`;
        msg += `Target: ${b.target} | ${b.created_at.slice(0, 10)}\n`;
        msg += `_${b.message.slice(0, 60)}..._\n\n`;
    });

    if (broadcasts.length > 10) msg += `_...and ${broadcasts.length - 10} more_`;
    return msg;
}

async function handleToggleBroadcast(args) {
    if (args.length < 1) return "⚠️ Usage: `/togglebroadcast <broadcast_id>`";

    const result = await toggleBroadcast(args[0]);
    if (!result.success) return `❌ ${result.message}`;

    const status = result.active ? '🟢 Active' : '🔴 Inactive';
    return `✅ ${result.message}\n\nStatus: ${status}`;
}

async function handleDeleteBroadcast(args) {
    if (args.length < 1) return "⚠️ Usage: `/deletebroadcast <broadcast_id>`";
    const result = await deleteBroadcast(args[0]);
    return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
}

// User Stats & Info Commands
async function handleUserStats() {
    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const users = db.users || [];
    if (users.length === 0) return "⚠️ No users registered yet.";

    // Compile stats
    let totalGenerated = 0;
    let activeCount = 0;
    let bannedCount = 0;
    let lifetimeCount = 0;

    users.forEach(u => {
        if (u.stats?.generated) totalGenerated += u.stats.generated;
        if (u.status === 'ACTIVE') activeCount++;
        if (u.status === 'BANNED') bannedCount++;
        if (u.expiry === 9999999999999) lifetimeCount++;
    });

    let msg = `*📊 User Statistics Dashboard*\n\n`;
    msg += `👥 *Total Users:* \`${users.length}\`\n`;
    msg += `🟢 *Active:* \`${activeCount}\`\n`;
    msg += `🔴 *Banned:* \`${bannedCount}\`\n`;
    msg += `♾️ *Lifetime:* \`${lifetimeCount}\`\n\n`;
    msg += `📱 *Total Generations:* \`${totalGenerated}\`\n\n`;

    // Top Generators (if stats exist)
    const usersWithStats = users.filter(u => u.stats?.generated > 0)
        .sort((a, b) => (b.stats?.generated || 0) - (a.stats?.generated || 0))
        .slice(0, 5);

    if (usersWithStats.length > 0) {
        msg += `*🏆 Top Generators:*\n`;
        usersWithStats.forEach((u, i) => {
            msg += `${i + 1}. \`${u.username}\` - ${u.stats.generated} accounts\n`;
        });
    }

    return msg;
}

async function handleUserInfo(args) {
    if (args.length < 1) {
        return "⚠️ Usage: `/userinfo <username>`\n\nGet detailed info about a user including stats and rarity IDs.";
    }

    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const username = args[0].toLowerCase();
    const user = db.users?.find(u => u.username.toLowerCase() === username);

    if (!user) return `❌ User \`${args[0]}\` not found.`;

    // Format expiry
    let expiryStr;
    if (user.expiry === 9999999999999) {
        expiryStr = '♾️ Lifetime';
    } else {
        const expiryDate = new Date(user.expiry * 1000);
        const now = new Date();
        if (expiryDate > now) {
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            expiryStr = `${expiryDate.toLocaleDateString()} (${daysLeft} days left)`;
        } else {
            expiryStr = '❌ Expired';
        }
    }

    let msg = `*👤 User Profile: ${user.username}*\n\n`;
    msg += `👑 *Rank:* \`${user.rank || 'USER'}\`\n`;
    msg += `✔️ *Status:* ${user.status === 'ACTIVE' ? '🟢 Active' : '🔴 Banned'}\n`;
    msg += `⏰ *Expiry:* ${expiryStr}\n`;
    msg += `📱 *HWID:* ${user.hwid ? `\`${user.hwid.slice(0, 16)}...\`` : 'Not Linked'}\n`;
    msg += `📅 *Created:* ${user.created_at || 'Unknown'}\n\n`;

    // Stats section
    if (user.stats) {
        msg += `*📊 Generation Stats:*\n`;
        msg += `📱 Generated: \`${user.stats.generated || 0}\`\n`;
        msg += `✅ Success: \`${user.stats.success || 0}\`\n`;
        msg += `❌ Failed: \`${user.stats.failed || 0}\`\n`;
        if (user.stats.success > 0) {
            const rate = Math.round((user.stats.success / user.stats.generated) * 100);
            msg += `📈 Success Rate: \`${rate}%\`\n`;
        }
        msg += `\n`;
    }

    // Rarity IDs section (if tracked)
    if (user.rarity_ids && user.rarity_ids.length > 0) {
        msg += `*🎯 High Rarity IDs:*\n`;
        user.rarity_ids.slice(-10).forEach(r => {
            msg += `• \`${r.id}\` (Rarity: ${r.score})\n`;
        });
        if (user.rarity_ids.length > 10) {
            msg += `_...and ${user.rarity_ids.length - 10} more_\n`;
        }
    }

    return msg;
}

async function handlePullRarity(args) {
    if (args.length < 1) {
        return "⚠️ Usage: `/pullrarity <username> [count]`\n\nPull rarity IDs from a specific user.";
    }

    const { db } = await fetchDB();
    if (!db) return "❌ Database error";

    const username = args[0].toLowerCase();
    const count = parseInt(args[1]) || 10;
    const user = db.users?.find(u => u.username.toLowerCase() === username);

    if (!user) return `❌ User \`${args[0]}\` not found.`;

    if (!user.rarity_ids || user.rarity_ids.length === 0) {
        return `⚠️ User \`${user.username}\` has no rarity IDs tracked yet.\n\n` +
            `_Note: The app needs to sync stats to track rarity IDs._`;
    }

    const ids = user.rarity_ids.slice(-count);
    let msg = `*🎯 Rarity IDs for ${user.username}*\n`;
    msg += `Showing last ${ids.length} of ${user.rarity_ids.length}\n\n`;

    ids.forEach(r => {
        const stars = '⭐'.repeat(Math.min(r.score, 10));
        msg += `\`${r.id}\` - ${r.score} ${stars}\n`;
    });

    return msg;
}

module.exports = {
    handleStart, handleGen, handleGenUniversal, handleGenReusable, handleCustom,
    handleStatus, handleKeys, handleUsers, handleActivate, handleLogin,
    handleRemoveKey, handleBanKey, handleUnbanKey,
    handleResetHWID, handleResetPass, handleBanUser, handleUnbanUser, handleDeleteUser, handleExtend,
    handleBroadcast, handleBroadcasts, handleToggleBroadcast, handleDeleteBroadcast,
    handleUserStats, handleUserInfo, handlePullRarity
};

