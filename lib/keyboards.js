/**
 * Telegram Inline Keyboards Layouts
 */

const MAIN_MENU = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '📊 Status', callback_data: 'status' },
                { text: '👥 Users', callback_data: 'users_menu' }
            ],
            [
                { text: '🎫 Key Manager', callback_data: 'keys_menu' },
                { text: '📢 Broadcasts', callback_data: 'broadcasts_menu' }
            ],
            [
                { text: '⚙️ Settings', callback_data: 'settings' },
                { text: 'ℹ️ Help', callback_data: 'help' }
            ]
        ]
    }
};

const KEYS_MENU = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '📝 List Unused', callback_data: 'keys_list' }
            ],
            [
                { text: '➕ Gen 3 Days', callback_data: 'gen_3d' },
                { text: '➕ Gen 7 Days', callback_data: 'gen_7d' }
            ],
            [
                { text: '➕ Gen 30 Days', callback_data: 'gen_30d' },
                { text: '➕ Gen Lifetime', callback_data: 'gen_lifetime' }
            ],
            [
                { text: '🌍 Gen Universal', callback_data: 'gen_universal_menu' },
                { text: '♾️ Gen Reusable', callback_data: 'gen_reusable_menu' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'main_menu' }
            ]
        ]
    }
};

const USERS_MENU = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '📊 Dashboard', callback_data: 'user_stats' },
                { text: '👥 List All', callback_data: 'users_list' }
            ],
            [
                { text: '🔍 User Info', callback_data: 'user_info_prompt' },
                { text: '🎯 Rarity Pull', callback_data: 'pull_rarity_prompt' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'main_menu' }
            ]
        ]
    }
};

const SETTINGS_MENU = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '🔄 Refresh Cache', callback_data: 'status' } // Reusing status for now as soft refresh
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'main_menu' }
            ]
        ]
    }
};

const BROADCASTS_MENU = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '📢 Show Active & Delete', callback_data: 'broadcasts_list' }
            ],
            [
                { text: '➕ New Broadcast', callback_data: 'broadcast_new_prompt' },
                { text: '🗑️ Delete Broadcast', callback_data: 'broadcast_delete_prompt' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'main_menu' }
            ]
        ]
    }
};

const BACK_BTN = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '🔙 Back', callback_data: 'main_menu' }]
        ]
    }
};

module.exports = {
    MAIN_MENU,
    KEYS_MENU,
    USERS_MENU,
    SETTINGS_MENU,
    BROADCASTS_MENU,
    BACK_BTN
};
