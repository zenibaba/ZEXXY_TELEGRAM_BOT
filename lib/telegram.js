/**
 * Telegram API Helper
 */

const BOT_TOKEN = process.env.BOT_TOKEN || '8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text) {
    try {
        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error('Send error:', error);
    }
}

module.exports = { sendMessage };
