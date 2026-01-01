# ZEXXY Telegram Bot (Webhook - 24/7)

**Bot Token:** `8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk`

## 🚀 Quick Deploy

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial bot"
git branch -M main
git remote add origin https://github.com/zenibaba/ZEXXY_TELEGRAM_BOT.git
git push -u origin main

# 2. Deploy to Vercel
vercel login
vercel --prod

# 3. Add environment variables on Vercel:
# BOT_TOKEN = 8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk
# GITHUB_TOKEN = your_github_token
# GITHUB_REPO_OWNER = zenibaba
# GITHUB_REPO_NAME = ZEXXY_KEYAUTH

# 4. Set webhook (after deploy)
curl https://api.telegram.org/bot8495488197:AAHj7xMiIP1kySVXuWU4-AtVu1kiOpPpKDk/setWebhook -d "url=https://your-bot-url.vercel.app/api/webhook"
```

## Commands

- `/start` - Help
- `/gen <duration> <amount>` - Generate keys
- `/status` - Stats
- `/keys` - List keys
- `/broadcast <msg>` - Notification
- `/extend <user> <days>` - Extend time

**Done!** 🎉
