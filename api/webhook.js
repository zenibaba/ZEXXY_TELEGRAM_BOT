/**
 * Telegram Webhook Handler - Enhanced Version
 */

const { sendMessage } = require('../lib/telegram');
const {
    handleStart, handleGen, handleGenUniversal, handleGenReusable, handleCustom,
    handleStatus, handleKeys, handleUsers, handleActivate, handleLogin,
    handleRemoveKey, handleBanKey, handleUnbanKey,
    handleResetHWID, handleResetPass, handleBanUser, handleUnbanUser, handleDeleteUser, handleExtend,
    handleBroadcast, handleBroadcasts, handleToggleBroadcast, handleDeleteBroadcast
} = require('../lib/commands');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(200).json({ ok: true });

    try {
        const { message } = req.body;
        if (!message || !message.text || !message.text.startsWith('/')) {
            return res.status(200).json({ ok: true });
        }

        const chatId = message.chat.id;
        const parts = message.text.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        let response = '';

        switch (cmd) {
            // Info commands
            case '/start':
                response = await handleStart();
                break;
            case '/status':
                response = await handleStatus();
                break;
            case '/keys':
                response = await handleKeys();
                break;
            case '/users':
                response = await handleUsers();
                break;

            // Key generation
            case '/gen':
                response = await handleGen(args);
                break;
            case '/genuniversal':
                response = await handleGenUniversal(args);
                break;
            case '/genreusable':
                response = await handleGenReusable(args);
                break;
            case '/custom':
                response = await handleCustom();
                break;

            // Key management
            case '/removekey':
                response = await handleRemoveKey(args);
                break;
            case '/bankey':
                response = await handleBanKey(args);
                break;
            case '/unbankey':
                response = await handleUnbanKey(args);
                break;

            // User management
            case '/resethwid':
                response = await handleResetHWID(args);
                break;
            case '/resetpass':
                response = await handleResetPass(args);
                break;
            case '/banuser':
                response = await handleBanUser(args);
                break;
            case '/unbanuser':
                response = await handleUnbanUser(args);
                break;
            case '/deleteuser':
                response = await handleDeleteUser(args);
                break;
            case '/extend':
                response = await handleExtend(args);
                break;

            // Testing commands
            case '/activate':
                response = await handleActivate(args);
                break;
            case '/login':
                response = await handleLogin(args);
                break;

            // Broadcast system
            case '/broadcast':
                response = await handleBroadcast(args);
                break;
            case '/broadcasts':
                response = await handleBroadcasts();
                break;
            case '/togglebroadcast':
                response = await handleToggleBroadcast(args);
                break;
            case '/deletebroadcast':
                response = await handleDeleteBroadcast(args);
                break;

            default:
                response = '❓ Unknown command. Type `/start` for help.';
        }

        if (response) await sendMessage(chatId, response);
        return res.status(200).json({ ok: true });

    } catch (error) {
        console.error('Error:', error);
        return res.status(200).json({ ok: true });
    }
};
