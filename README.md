# TikTok Recorder Bot

A Telegram bot that monitors and records TikTok live streams automatically.

## Features

- 🔍 Check if a TikTok user is currently live
- 🔴 Record live streams manually or automatically
- ⚙️ Monitor multiple users and auto-record when they go live
- ☁️ Automatic upload to Cloudinary for archival
- 📤 Send recordings directly to Telegram

## Prerequisites

- Node.js (v18 or higher recommended)
- FFmpeg (installed automatically via `ffmpeg-static`)
- Telegram Bot Token
- Cloudinary account (optional, for cloud storage)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ot2dz/tiktok-recorder-api.git
cd tiktok-recorder-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TIKTOK_COOKIE=your_tiktok_cookie_optional
```

## Usage

### Start the bot

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Bot Commands

Once the bot is running, interact with it on Telegram:

- **🔍 فحص حالة البث** - Check if a TikTok user is currently live
- **🔴 بدء تسجيل بث** - Manually start recording a live stream
- **⚙️ إدارة المراقبة** - Manage monitored users (add/remove/list)

### Monitoring Users

The bot can automatically monitor TikTok users and start recording when they go live:

1. Click "⚙️ إدارة المراقبة"
2. Choose "➕ إضافة مستخدم للمراقبة"
3. Send the TikTok username
4. The bot will check every 5 minutes if they're live and auto-record

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your Telegram bot token from [@BotFather](https://t.me/botfather) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for video archival |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `TIKTOK_COOKIE` | No | TikTok session cookie (if needed for access) |

### File Structure

```
tiktok-recorder-api/
├── src/
│   ├── bot.js                          # Main bot logic
│   ├── core/
│   │   ├── monitoring.service.js       # Automated monitoring service
│   │   └── recorder.service.js         # Stream recording logic
│   ├── services/
│   │   ├── cloudinary.service.js       # Cloudinary upload
│   │   ├── db.service.js               # Database operations
│   │   └── tiktok.service.js           # TikTok API interactions
│   └── utils/
│       └── video.util.js               # Video conversion utilities
├── downloads/                          # Temporary recordings (auto-created)
├── db.json                             # Local database
├── package.json
└── README.md
```

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- The bot validates usernames to prevent path traversal attacks
- All file operations include proper error handling to prevent crashes
- Temporary files are automatically cleaned up after processing

## Troubleshooting

### Bot doesn't respond
- Verify your `TELEGRAM_BOT_TOKEN` is correct
- Check that the bot is running without errors
- Ensure you've started a conversation with the bot on Telegram

### Recording fails
- Verify the TikTok user is actually live
- Check your internet connection
- Ensure you have write permissions in the project directory

### Cloudinary upload fails
- Verify all Cloudinary credentials are correct
- Check that you have sufficient storage quota
- The bot will still send videos to Telegram even if Cloudinary fails

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This tool is for educational purposes only. Please respect TikTok's Terms of Service and content creators' rights. Always obtain permission before recording and distributing content.
