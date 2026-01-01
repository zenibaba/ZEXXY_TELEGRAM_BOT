# ZEXXY Telegram Bot (Webhook - 24/7)

**Bot Token:** `8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk`

## 🚀 Quick Deploy

```bash
# 1. Push to GitHub
git add .
git commit -m "Enhanced bot with all commands"
git push origin main

# 2. Deploy to Vercel
vercel --prod

# 3. Add environment variables on Vercel:
# BOT_TOKEN = 8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk
# GITHUB_TOKEN = your_github_token
# GITHUB_REPO_OWNER = zenibaba
# GITHUB_REPO_NAME = ZEXXY_KEYAUTH

# 4. Set webhook (after deploy)
curl https://api.telegram.org/bot8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk/setWebhook -d "url=https://your-bot-url.vercel.app/api/webhook"
```

## 📋 Commands

### Information
- `/start` - Help menu
- `/status` - System statistics  
- `/keys` - List unused keys
- `/users` - List all users

### Key Generation
- `/gen <duration> <amount> [note]` - Generate keys
- `/genuniversal <duration> <amount>` - HWID-free keys
- `/genreusable <duration> <amount>` - Unlimited use keys
- `/custom` - Custom generation guide

### Key Management
- `/removekey <key>` - Delete key
- `/bankey <key>` - Ban key
- `/unbankey <key>` - Unban key

### User Management
- `/resethwid <user>` - Reset hardware  ID
- `/resetpass <user> <newpass>` - Reset password
- `/banuser <user>` - Ban user
- `/unbanuser <user>` - Unban user
- `/deleteuser <user>` - Delete user
- `/extend <user> <days>` - Extend subscription

### Broadcasts
- `/broadcast [target] <message>` - Create notification
- `/broadcasts` - List all broadcasts
- `/togglebroadcast <id>` - Toggle active/inactive
- `/deletebroadcast <id>` - Delete broadcast

### Testing
- `/activate <key> <user> <pass>` - Test activation
- `/login <user> <pass> <hwid>` - Test login

## Duration Formats
- `1d`, `7d`, `30d` = Days
- `1w`, `2w` = Weeks
- `1m`, `6m` = Months
- `1y` = Year
- `lifetime` = Lifetime

## Examples

```bash
# Generate 5 keys valid for 1 month
/gen 1m 5 Premium

# Generate HWID-free keys (multi-device)
/genuniversal 1m 3 VIP

# Extend user subscription by 30 days
/extend john123 30

# Create broadcast for VIP users only
/broadcast VIP Special offer!
```

**Done!** 🎉
