/**
 * Telegram Webhook Handler - Inline Keyboards & Anti-Revoke
 */

const { sendMessage, editMessageText, answerCallbackQuery } = require('../lib/telegram');
const {
    handleStart, handleGen, handleGenUniversal, handleGenReusable, handleCustom,
    handleStatus, handleKeys, handleUsers, handleActivate, handleLogin,
    handleRemoveKey, handleBanKey, handleUnbanKey,
    handleResetHWID, handleResetPass, handleBanUser, handleUnbanUser, handleDeleteUser, handleExtend,
    handleBroadcast, handleBroadcasts, handleToggleBroadcast, handleDeleteBroadcast,
    handleUserStats, handleUserInfo, handlePullRarity
} = require('../lib/commands');
const { MAIN_MENU, KEYS_MENU, USERS_MENU, BROADCASTS_MENU, BACK_BTN } = require('../lib/keyboards');

// Process command with timeout protection
async function processUpdate(update) {
    const TIMEOUT_MS = 25000;

    const logicPromise = (async () => {
        // 1. Handle Callback Query (Inline Buttons)
        if (update.callback_query) {
            const { id, data, message } = update.callback_query;
            const chatId = message.chat.id;
            const msgId = message.message_id;

            // Acknowledge callback
            await answerCallbackQuery(id);

            switch (data) {
                // Navigation
                case 'main_menu':
                    await editMessageText(chatId, msgId, "*🔐 ZEXXY Main Menu*", MAIN_MENU);
                    break;
                case 'keys_menu':
                    await editMessageText(chatId, msgId, "*🎫 Key Management*", KEYS_MENU);
                    break;
                case 'users_menu':
                    await editMessageText(chatId, msgId, "*👥 User Management*", USERS_MENU);
                    break;
                case 'broadcasts_menu':
                    await editMessageText(chatId, msgId, "*📢 Broadcast System*", BROADCASTS_MENU);
                    break;
                case 'help':
                    await editMessageText(chatId, msgId, await handleStart(), BACK_BTN);
                    break;

                // Features
                case 'status':
                    await editMessageText(chatId, msgId, await handleStatus(), BACK_BTN);
                    break;
                case 'keys_list':
                    await editMessageText(chatId, msgId, await handleKeys(), KEYS_MENU);
                    break;
                case 'user_stats':
                    await editMessageText(chatId, msgId, await handleUserStats(), USERS_MENU);
                    break;
                case 'users_list':
                    await editMessageText(chatId, msgId, await handleUsers(), USERS_MENU);
                    break;
                case 'broadcasts_list':
                    await editMessageText(chatId, msgId, await handleBroadcasts(), BROADCASTS_MENU);
                    break;

                // Quick Generators
                case 'gen_3d':
                    await sendMessage(chatId, await handleGen(['3d', '1', 'FastGen']), KEYS_MENU);
                    break;
                case 'gen_7d':
                    await sendMessage(chatId, await handleGen(['7d', '1', 'FastGen']), KEYS_MENU);
                    break;
                case 'gen_30d':
                    await sendMessage(chatId, await handleGen(['30d', '1', 'FastGen']), KEYS_MENU);
                    break;
                case 'gen_lifetime':
                    await sendMessage(chatId, await handleGen(['lifetime', '1', 'FastGen']), KEYS_MENU);
                    break;

                // Prompts (Instructions)
                case 'gen_universal_menu':
                    await sendMessage(chatId, "ℹ️ *Generate Universal Key:*\nUse command: `/genuniversal <duration> <amount>`", KEYS_MENU);
                    break;
                case 'gen_reusable_menu':
                    await sendMessage(chatId, "ℹ️ *Generate Reusable Key:*\nUse command: `/genreusable <duration> <amount>`", KEYS_MENU);
                    break;
                case 'user_info_prompt':
                    await sendMessage(chatId, "ℹ️ *Lookup User:*\nUse command: `/userinfo <username>`", USERS_MENU);
                    break;
                case 'pull_rarity_prompt':
                    await sendMessage(chatId, "ℹ️ *Pull Rarity IDs:*\nUse command: `/pullrarity <username> [count]`", USERS_MENU);
                    break;
                case 'broadcast_new_prompt':
                    await sendMessage(chatId, "ℹ️ *New Broadcast:*\nUse command: `/broadcast [target] <message>`", BROADCASTS_MENU);
                    break;

                default:
                    await sendMessage(chatId, "❓ Unknown action", MAIN_MENU);
            }
            return;
        }

        // 2. Handle Text Message
        if (update.message && update.message.text) {
            const { chat, text } = update.message;
            const chatId = chat.id;

            // Command parsing
            if (!text.startsWith('/')) return; // Ignore non-commands
            const parts = text.split(' ');
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            let response;
            switch (cmd) {
                // Info & Menus
                case '/start':
                case '/menu':
                    await sendMessage(chatId, "*🔐 ZEXXY Key Manager Bot*", MAIN_MENU);
                    return;

                case '/status': response = await handleStatus(); break;
                case '/keys': response = await handleKeys(); break;
                case '/users': response = await handleUsers(); break;

                // Features
                case '/gen': response = await handleGen(args); break;
                case '/genuniversal': response = await handleGenUniversal(args); break;
                case '/genreusable': response = await handleGenReusable(args); break;
                case '/custom': response = await handleCustom(); break;

                case '/removekey': response = await handleRemoveKey(args); break;
                case '/bankey': response = await handleBanKey(args); break;
                case '/unbankey': response = await handleUnbanKey(args); break;

                case '/resethwid': response = await handleResetHWID(args); break;
                case '/resetpass': response = await handleResetPass(args); break;
                case '/banuser': response = await handleBanUser(args); break;
                case '/unbanuser': response = await handleUnbanUser(args); break;
                case '/deleteuser': response = await handleDeleteUser(args); break;
                case '/extend': response = await handleExtend(args); break;

                case '/broadcast': response = await handleBroadcast(args); break;
                case '/broadcasts': response = await handleBroadcasts(); break;
                case '/togglebroadcast': response = await handleToggleBroadcast(args); break;
                case '/deletebroadcast': response = await handleDeleteBroadcast(args); break;

                case '/userstats': response = await handleUserStats(); break;
                case '/userinfo': response = await handleUserInfo(args); break;
                case '/pullrarity': response = await handlePullRarity(args); break;

                // Testing
                case '/activate': response = await handleActivate(args); break;
                case '/login': response = await handleLogin(args); break;

                default:
                    response = '❓ Unknown command. Tap /menu for options.';
            }

            if (response) {
                await sendMessage(chatId, response);
            }
        }
    })();

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Update timeout')), TIMEOUT_MS)
    );

    return Promise.race([logicPromise, timeoutPromise]);
}

module.exports = async (req, res) => {
    // CRITICAL: Always respond with 200 OK first for non-POST or health checks
    if (req.method === 'GET') {
        return res.status(200).json({ ok: true, status: 'Active' });
    }

    try {
        if (req.body) {
            // Process in background (fire and forget for Vercel response)
            await processUpdate(req.body).catch(err => {
                console.error('Update processing error:', err);
            });
        }
    } catch (error) {
        console.error('Webhook error:', error);
    }

    // Always return 200 immediately
    return res.status(200).json({ ok: true });
};
