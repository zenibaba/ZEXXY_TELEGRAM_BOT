/**
 * Telegram Webhook Handler - Enhanced Version with Anti-Revoke
 * 
 * CRITICAL: The webhook MUST respond within 60 seconds or Telegram may revoke it.
 * Always return 200 OK immediately, then process the command.
 */

const { sendMessage } = require('../lib/telegram');
const {
    handleStart, handleGen, handleGenUniversal, handleGenReusable, handleCustom,
    handleStatus, handleKeys, handleUsers, handleActivate, handleLogin,
    handleRemoveKey, handleBanKey, handleUnbanKey,
    handleResetHWID, handleResetPass, handleBanUser, handleUnbanUser, handleDeleteUser, handleExtend,
    handleBroadcast, handleBroadcasts, handleToggleBroadcast, handleDeleteBroadcast,
    handleUserStats, handleUserInfo, handlePullRarity
} = require('../lib/commands');

// Process command with timeout protection
async function processCommand(cmd, args, chatId) {
    const TIMEOUT_MS = 25000; // 25 second timeout for safety

    const commandPromise = (async () => {
        switch (cmd) {
            // Info commands
            case '/start':
                return await handleStart();
            case '/status':
                return await handleStatus();
            case '/keys':
                return await handleKeys();
            case '/users':
                return await handleUsers();

            // Key generation
            case '/gen':
                return await handleGen(args);
            case '/genuniversal':
                return await handleGenUniversal(args);
            case '/genreusable':
                return await handleGenReusable(args);
            case '/custom':
                return await handleCustom();

            // Key management
            case '/removekey':
                return await handleRemoveKey(args);
            case '/bankey':
                return await handleBanKey(args);
            case '/unbankey':
                return await handleUnbanKey(args);

            // User management
            case '/resethwid':
                return await handleResetHWID(args);
            case '/resetpass':
                return await handleResetPass(args);
            case '/banuser':
                return await handleBanUser(args);
            case '/unbanuser':
                return await handleUnbanUser(args);
            case '/deleteuser':
                return await handleDeleteUser(args);
            case '/extend':
                return await handleExtend(args);

            // Testing commands
            case '/activate':
                return await handleActivate(args);
            case '/login':
                return await handleLogin(args);

            // Broadcast system
            case '/broadcast':
                return await handleBroadcast(args);
            case '/broadcasts':
                return await handleBroadcasts();
            case '/togglebroadcast':
                return await handleToggleBroadcast(args);
            case '/deletebroadcast':
                return await handleDeleteBroadcast(args);

            // User Stats & Analytics
            case '/userstats':
                return await handleUserStats();
            case '/userinfo':
                return await handleUserInfo(args);
            case '/pullrarity':
                return await handlePullRarity(args);

            default:
                return '❓ Unknown command. Type `/start` for help.';
        }
    })();

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Command timeout')), TIMEOUT_MS)
    );

    return Promise.race([commandPromise, timeoutPromise]);
}

module.exports = async (req, res) => {
    // CRITICAL: Always respond with 200 OK first for non-POST or health checks
    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            message: 'ZEXXY Webhook Active',
            timestamp: new Date().toISOString()
        });
    }

    if (req.method !== 'POST') {
        return res.status(200).json({ ok: true });
    }

    let chatId = null;

    try {
        const { message } = req.body || {};

        // Validate message exists and has required fields
        if (!message) {
            console.log('No message in request body');
            return res.status(200).json({ ok: true });
        }

        if (!message.text || !message.text.startsWith('/')) {
            // Not a command, ignore silently
            return res.status(200).json({ ok: true });
        }

        if (!message.chat || !message.chat.id) {
            console.log('No chat ID in message');
            return res.status(200).json({ ok: true });
        }

        chatId = message.chat.id;
        const parts = message.text.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log(`[WEBHOOK] Processing command: ${cmd} from chat: ${chatId}`);

        // Process command with timeout
        let response;
        try {
            response = await processCommand(cmd, args, chatId);
        } catch (cmdError) {
            console.error(`[WEBHOOK] Command error: ${cmdError.message}`);
            if (cmdError.message === 'Command timeout') {
                response = '⚠️ Command timed out. Please try again.';
            } else {
                response = `❌ Error: ${cmdError.message || 'Unknown error'}`;
            }
        }

        // Send response
        if (response) {
            try {
                await sendMessage(chatId, response);
            } catch (sendErr) {
                console.error('[WEBHOOK] Failed to send response:', sendErr);
            }
        }

        return res.status(200).json({ ok: true });

    } catch (error) {
        console.error('[WEBHOOK] Critical error:', error);

        // Try to notify user of error
        if (chatId) {
            try {
                await sendMessage(chatId, '❌ An error occurred. Please try again.');
            } catch (e) {
                // Silently fail
            }
        }

        // CRITICAL: Always return 200 to prevent webhook revocation
        return res.status(200).json({ ok: true });
    }
};
