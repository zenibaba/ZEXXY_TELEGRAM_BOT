/**
 * Telegram API Helper
 */

const BOT_TOKEN = process.env.BOT_TOKEN || '8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text, options = {}) {
    try {
        const body = {
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
            ...options
        };

        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.error('Send error:', error);
    }
}

async function editMessageText(chatId, messageId, text, options = {}) {
    try {
        const body = {
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: 'Markdown',
            ...options
        };

        await fetch(`${API_URL}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.error('Edit error:', error);
    }
}

async function answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    try {
        await fetch(`${API_URL}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text,
                show_alert: showAlert
            })
        });
    } catch (error) {
        console.error('Answer callback error:', error);
    }
}

module.exports = { sendMessage, editMessageText, answerCallbackQuery };
