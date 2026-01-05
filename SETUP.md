# Setup Guide

Complete setup guide for automated VLESS + REALITY deployment.

## Prerequisites

1. **VPS Server**
   - Ubuntu 20.04+ or Debian 11+
   - Minimum 512MB RAM
   - Root access
   - Open port 443

2. **GitHub Account**
   - For CI/CD automation

3. **Telegram Bot**
   - Create via @BotFather

## Step-by-Step Setup

### Step 1: Get VPS Server (5 minutes)

#### Option A: Vultr
1. Go to https://vultr.com
2. Register account
3. Add funds ($10 minimum)
4. Deploy new server:
   - Location: Singapore/Tokyo (closer to Russia)
   - OS: Ubuntu 22.04 LTS
   - Plan: $6/month (1 CPU, 1GB RAM)
5. Copy IP address and password from email

#### Option B: DigitalOcean
1. Go to https://digitalocean.com
2. Register account
3. Create Droplet:
   - Ubuntu 22.04
   - Basic plan $6/month
4. Copy IP and password

### Step 2: Create Telegram Bot (2 minutes)

1. Open Telegram
2. Find @BotFather
3. Send `/newbot`
4. Follow instructions:
   ```
   Name: Reality Config Bot
   Username: your_reality_bot
   ```
5. Copy the token (looks like: `1234567890:ABCdef...`)

### Step 3: Fork/Clone Repository (1 minute)

```bash
git clone https://github.com/yourusername/vless-reality-project
cd vless-reality-project
```

Or click "Fork" on GitHub.

### Step 4: Configure GitHub Secrets (3 minutes)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

#### Required Secrets

| Name | Value | Example |
|------|-------|---------|
| `VPS_HOST` | Your VPS IP | `89.208.231.117` |
| `VPS_USER` | SSH username | `root` |
| `VPS_PASSWORD` | SSH password | `YourPassword123` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | `1234567890:ABCdef...` |

#### Optional Secrets

| Name | Value | Default | Description |
|------|-------|---------|-------------|
| `VPS_PORT` | SSH port | `22` | If you changed SSH port |
| `REALITY_DEST` | Masking domain | `yandex.ru` | Domain to masquerade as |
| `REALITY_SNI` | SNI domains | `yandex.ru ya.ru` | Space-separated list |
| `XRAY_PUBLIC_KEY` | X25519 public key | Auto-generated | If you have existing key |
| `NOTIFICATION_CHAT_ID` | Your Telegram ID | None | For deployment notifications |

#### How to add a secret:

1. Name: `VPS_HOST`
2. Secret: `89.208.231.117`
3. Click **Add secret**
4. Repeat for all secrets

### Step 5: Deploy (1 minute)

#### Automatic Deploy

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions will automatically:
1. Connect to your VPS
2. Install Xray-core
3. Generate keys and UUID
4. Configure REALITY protocol
5. Deploy Telegram bot
6. Start all services

#### Manual Deploy (via GitHub UI)

1. Go to **Actions** tab
2. Click **Deploy VLESS Reality Stack**
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

### Step 6: Monitor Deployment (5-10 minutes)

1. Go to **Actions** tab
2. Click on the running workflow
3. Watch the logs in real-time

You'll see:
- `Deploy Xray Server` (5-8 minutes)
- `Deploy Telegram Bot` (2-3 minutes)
- `Send Notification` (if configured)

### Step 7: Test Your Bot (1 minute)

1. Open Telegram
2. Find your bot (search for username you created)
3. Send `/start`
4. Send `/config`
5. You'll receive:
   - QR code
   - VLESS link
   - Full config on Telegraph

### Step 8: Connect Client

#### Android (v2rayNG)

1. Install v2rayNG from: https://github.com/2dust/v2rayNG/releases
2. Open app
3. Tap `+` → **Import config from Clipboard**
4. Paste your VLESS link
5. Tap the server to connect

#### iOS (Shadowrocket)

1. Install Shadowrocket from App Store ($2.99)
2. Open app
3. Tap `+` → **Type: Custom**
4. Paste entire VLESS link
5. Save and connect

#### Windows (v2rayN)

1. Download v2rayN-With-Core.zip: https://github.com/2dust/v2rayN/releases
2. Extract and run v2rayN.exe
3. Right-click tray icon → **Add server** → **Import from clipboard**
4. Paste VLESS link
5. Right-click tray icon → **System proxy** → **Auto**

## Verification

### Check Xray Status

```bash
ssh root@YOUR_VPS_IP
systemctl status xray
```

Should show: `active (running)`

### Check Bot Status

```bash
ssh root@YOUR_VPS_IP
pm2 status
```

Should show: `vless-bot` `online`

### Check Logs

```bash
# Xray logs
journalctl -u xray -n 50

# Bot logs
pm2 logs vless-bot
```

### Test Connection

1. Connect with v2rayNG/v2rayN
2. Open browser
3. Visit https://2ip.ru
4. Should show your VPS IP address

## Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Actions tab → Failed workflow
2. Click on failed job
3. Read error messages

**Common issues:**
- Wrong VPS password → Update `VPS_PASSWORD` secret
- VPS not accessible → Check IP address
- Port 22 blocked → Check VPS firewall

### Xray Not Starting

```bash
ssh root@YOUR_VPS_IP

# Check status
systemctl status xray

# Check logs
journalctl -u xray -n 100

# Test config
xray run -test -c /usr/local/etc/xray/config.json
```

### Bot Not Responding

```bash
ssh root@YOUR_VPS_IP

# Check bot status
pm2 status

# Check logs
pm2 logs vless-bot

# Restart bot
pm2 restart vless-bot
```

### Can't Connect to VPN

1. Check Xray is running: `systemctl status xray`
2. Check port 443 is open: `ss -tulpn | grep 443`
3. Check firewall: `ufw status`
4. Try generating new config: Send `/config` to bot again

## Updating

### Update Bot Code

1. Make changes in `bot/` directory
2. Commit and push:
   ```bash
   git add bot/
   git commit -m "Update bot"
   git push
   ```
3. GitHub Actions will redeploy automatically

### Update Server Config

1. Update secrets in GitHub (if needed)
2. Go to Actions → Run workflow manually
3. Select branch and run

### Update Xray Version

```bash
ssh root@YOUR_VPS_IP
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
systemctl restart xray
```

## Maintenance

### View Statistics

```bash
# Bot statistics
Send /stats to your bot

# Server resources
ssh root@YOUR_VPS_IP
htop
```

### Backup Configuration

```bash
ssh root@YOUR_VPS_IP

# Backup Xray config
cp /usr/local/etc/xray/config.json ~/xray_backup.json

# Download locally
scp root@YOUR_VPS_IP:~/xray_backup.json ./
```

### Add More Users

Send `/config` to bot - each user gets unique UUID automatically.

Or use script:
```bash
cd scripts
python generate_link.py batch --server YOUR_IP --pubkey YOUR_KEY --count 10
```

## Security Best Practices

1. **Use strong passwords**
   - VPS: at least 16 characters
   - Mix uppercase, lowercase, numbers, symbols

2. **Keep repository private**
   - Settings → Change visibility → Private

3. **Regular updates**
   - Update Xray monthly
   - Update bot dependencies: `npm update`

4. **Monitor access**
   - Check bot logs regularly
   - Review who has configs

5. **Change credentials periodically**
   - VPS password: every 3-6 months
   - Bot token: if compromised

## Cost Breakdown

- VPS: $6-12/month
- Telegram bot: Free
- GitHub Actions: Free (2000 minutes/month)
- Domain: Not required

Total: **$6-12/month**

## Support

If you encounter issues:

1. Check this guide
2. Check logs on VPS
3. Check GitHub Actions logs
4. Review common issues in Troubleshooting section

## Next Steps

After successful deployment:

1. Share bot with friends/family
2. Monitor server performance
3. Consider backup VPS in different region
4. Set up monitoring/alerting

## Advanced Configuration

### Use Different Domain

Update `REALITY_DEST` secret to:
- `vk.com` - for VK masquerading
- `microsoft.com` - for Microsoft
- `mail.ru` - for Mail.ru

### Multiple SNI Domains

Update `REALITY_SNI` secret:
```
vk.com vk.ru vkvideo.ru
```

### Custom Short ID

Generate new:
```bash
openssl rand -hex 4
```
Then update server config manually or via workflow parameters.

## Architecture

```
User pushes to GitHub
        ↓
GitHub Actions triggered
        ↓
    ┌───────────────┐
    │  Deploy Xray  │
    │  (5-8 min)    │
    └───────┬───────┘
            │
            ├─ Install Xray-core
            ├─ Generate UUID
            ├─ Generate X25519 keys
            ├─ Create config.json
            ├─ Configure firewall
            └─ Start service
            │
    ┌───────┴───────┐
    │  Deploy Bot   │
    │  (2-3 min)    │
    └───────┬───────┘
            │
            ├─ Install Node.js
            ├─ Install PM2
            ├─ Copy bot files
            ├─ Create .env
            └─ Start bot
            │
    ┌───────┴────────┐
    │ Send Notification│
    └────────────────┘
```

All done automatically via GitHub Actions!
