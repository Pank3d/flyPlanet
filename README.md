# VLESS + REALITY Auto Deploy

Complete automated deployment solution for VLESS + REALITY server with Telegram bot.

## Project Structure

```
vless-reality-project/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── bot/
│   ├── index.js                # Telegram bot
│   ├── package.json            # Bot dependencies
│   └── .env.example            # Environment template
├── server/
│   ├── deploy.py               # Xray deployment script
│   └── config.template.json    # Xray config template
├── scripts/
│   └── generate_link.py        # Link generator utility
├── .gitignore
├── README.md                   # This file
└── SETUP.md                    # Setup guide

```

## Quick Start

### 1. Fork/Clone this repository

```bash
git clone https://github.com/yourusername/vless-reality-project
cd vless-reality-project
```

### 2. Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add these secrets:
- `VPS_HOST` - Your VPS IP address
- `VPS_USER` - SSH username (root)
- `VPS_PASSWORD` - SSH password
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather

Optional:
- `REALITY_DEST` - Masking domain (default: yandex.ru)
- `REALITY_SNI` - SNI domains (default: yandex.ru ya.ru)

### 3. Deploy

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

GitHub Actions will automatically:
1. Deploy Xray server to VPS
2. Deploy Telegram bot to VPS
3. Start all services

### 4. Test

Open Telegram, find your bot, send `/config`

## Features

- Automated Xray-core installation
- REALITY protocol configuration
- Telegram bot for config distribution
- QR code generation
- Telegraph integration for full configs
- CI/CD with GitHub Actions
- Zero manual configuration needed

## Requirements

- VPS server (Ubuntu 20.04+)
- GitHub account
- Telegram bot token

## Documentation

- `SETUP.md` - Detailed setup guide
- `DEPLOYMENT.md` - CI/CD documentation
- `bot/README.md` - Bot documentation
- `server/README.md` - Server documentation

## Architecture

```
GitHub Push
    ↓
GitHub Actions
    ↓
    ├── Deploy Xray (VPS)
    │   ├── Install Xray-core
    │   ├── Generate keys
    │   ├── Configure REALITY
    │   └── Start service
    │
    └── Deploy Bot (VPS)
        ├── Install dependencies
        ├── Configure environment
        └── Start with PM2
```

## License

MIT
