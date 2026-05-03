# Chiku Dashboard — Setup Guide

Complete guide to get the bot API and dashboard running end-to-end.

---

## Overview

```
Discord Bot  ──►  Express REST API  ◄──  Vercel (Next.js Dashboard)
(Pterodactyl)        port 3001              dashboard.vercel.app
                         ▲
                    API Key auth
```

The bot and dashboard are **two separate services**:
- **Bot**: runs on Pterodactyl, exposes a REST API on port 3001
- **Dashboard**: a Next.js app deployed on Vercel, proxies all requests to the bot API

---

## Step 1 — Configure the Bot

### 1a. Open `config.yml` and fill in the DASHBOARD section

```yaml
DASHBOARD:
  ENABLED: true
  PORT: 3001                              # Port the REST API listens on
  API_KEY: "a-long-random-secret-string"  # You generate this — keep it secret
  ALLOWED_ORIGIN: "https://your-dashboard.vercel.app"   # Your Vercel URL
```

**Generate a secure API key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1b. Open port 3001 in Pterodactyl

1. Go to your server panel → **Network** tab
2. Add an **allocation** for port `3001`
3. Note the public IP/hostname — you'll need it for the dashboard

### 1c. Also fill in the Discord OAuth2 Client ID in `config.yml`

```yaml
Chiku:
  CLIENT_ID: "your-actual-client-id-here"   # From Discord Developer Portal
```

---

## Step 2 — Deploy the Dashboard to Vercel

### 2a. Create a Discord OAuth2 Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new application (or use your existing bot's application)
3. Go to **OAuth2** → **General**
4. Add redirect URL: `https://your-dashboard.vercel.app/api/auth/callback/discord`
5. Copy your **Client ID** and **Client Secret**

### 2b. Push to GitHub

```bash
git add dashboard/
git commit -m "Add Chiku dashboard"
git push
```

### 2c. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory**: set to `dashboard`
4. **Framework Preset**: Next.js (auto-detected)
5. Click **Deploy**

### 2d. Set Environment Variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXTAUTH_URL` | `https://your-dashboard.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `DISCORD_CLIENT_ID` | Your Discord app client ID |
| `DISCORD_CLIENT_SECRET` | Your Discord app client secret |
| `BOT_API_URL` | `http://your-pterodactyl-ip:3001` |
| `BOT_API_KEY` | Same value as `DASHBOARD.API_KEY` in `config.yml` |

6. **Redeploy** after setting variables (Settings → Deployments → Redeploy)

---

## Step 3 — Start the Bot

The dashboard API starts automatically when the bot starts — no extra steps needed.

```
[OK] Dashboard API listening on port 3001
```

You should see this line in your bot logs after startup.

---

## Step 4 — Test the Connection

From your machine (replace with your real values):

```bash
# Health check (no auth required)
curl http://your-pterodactyl-ip:3001/health

# Stats (requires API key)
curl -H "Authorization: Bearer your-api-key" http://your-pterodactyl-ip:3001/api/stats
```

Expected response:
```json
{ "guilds": 1, "users": 3, "players": 0, ... }
```

---

## Local Development

### Bot
```bash
node index.js
```
API will be at `http://localhost:3001`

### Dashboard
```bash
cd dashboard
cp .env.example .env.local
# Fill in .env.local with your values, set BOT_API_URL=http://localhost:3001
npm install
npm run dev
```
Dashboard will be at `http://localhost:3000`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Dashboard API not starting` | Check `DASHBOARD.ENABLED: true` in config.yml |
| `401 Unauthorized` on API | API key mismatch — must be identical in config.yml and Vercel env |
| `502 Bad Gateway` in dashboard | Bot API unreachable — check port 3001 is open in Pterodactyl |
| `CORS error` | Set `ALLOWED_ORIGIN` in config.yml to your exact Vercel URL |
| `Login redirects to /login` | `NEXTAUTH_URL` must match your actual Vercel deployment URL |
| `Guild not found` | Bot is not in that server, or the guild cache hasn't loaded yet |

---

## Security Notes

- **Never commit your API key** — it's in `config.yml` which should be in `.gitignore`
- The API key is only sent server-side (Next.js → Bot API), never exposed to the browser
- All dashboard routes are protected by NextAuth — unauthenticated users see nothing
- Only Discord users with **Manage Guild** permission see a server in the dashboard
