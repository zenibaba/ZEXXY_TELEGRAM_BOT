/**
 * Telegram Webhook Handler
 */

const { sendMessage } = require('../lib/telegram');
const { handleStart, handleGen, handleStatus, handleKeys, handleBroadcast, handleExtend } = require('../lib/commands');

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
            case '/start':
                response = await handleStart();
                break;
            case '/gen':
                response = await handleGen(args);
                break;
            case '/status':
                response = await handleStatus();
                break;
            case '/keys':
                response = await handleKeys();
                break;
            case '/broadcast':
                response = await handleBroadcast(args);
                break;
            case '/extend':
                response = await handleExtend(args);
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
