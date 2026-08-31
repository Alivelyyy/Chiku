<div align="center">

# 🎵 Chiku

**High-Performance Discord Music Bot with Web Dashboard**

[![License](https://img.shields.io/github/license/Alivelyyy/Chiku?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Alivelyyy/Chiku?style=flat-square)](https://github.com/Alivelyyy/Chiku/stargazers)
[![Issues](https://img.shields.io/github/issues/Alivelyyy/Chiku?style=flat-square)](https://github.com/Alivelyyy/Chiku/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Alivelyyy/Chiku?style=flat-square)](https://github.com/Alivelyyy/Chiku/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/Alivelyyy/Chiku?style=flat-square)](https://github.com/Alivelyyy/Chiku/commits/main)

[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

<br />

**Chiku** is a feature-rich, open-source Discord music bot built with [discord.js](https://discord.js.org/), [Kazagumo](https://github.com/DevLisk/kazagumo), and a modern [Next.js](https://nextjs.org/) web dashboard. Stream high-quality audio from YouTube, Spotify, and more — all managed from a beautiful web interface.

[Invite Bot](https://discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8) • [Support Server](https://discord.gg/uskTjqz5ah) • [Report Bug](https://github.com/Alivelyyy/Chiku/issues)

</div>

---

## ✨ Features

- 🎶 **Multi-Source Music** — Play from YouTube, Spotify, SoundCloud, and more
- 🎛️ **Web Dashboard** — Manage your server's music settings via a beautiful Next.js web interface
- 🎚️ **Audio Filters** — Apply equalizer, bass boost, nightcore, and other effects
- 📋 **Playlist System** — Create, save, and load custom playlists
- ⚡ **High Performance** — Built with Kazagumo + Shoukaku for reliable Lavalink connectivity
- 🔐 **OAuth2 Auth** — Secure Discord OAuth2 login for the dashboard
- 🛡️ **Rate Limiting** — Built-in API rate limiting for security
- 🎯 **Slash & Prefix Commands** — Support for both command styles
- 📊 **Server Analytics** — Track usage statistics through the dashboard
- 🏆 **Vote System** — Top.gg integration for bot voting

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) instance (free tier works)
- [Lavalink](https://github.com/lavalink-devs/Lavalink) server running
- [Discord Bot Token](https://discord.com/developers/applications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alivelyyy/Chiku.git
   cd Chiku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   ```bash
   cp config.example.yml config.yml
   ```
   Edit `config.yml` with your credentials (see [Configuration](#-configuration)).

4. **Start the bot**
   ```bash
   npm start
   ```

### Dashboard Setup

1. **Configure environment variables**
   ```bash
   cd dashboard
   cp .env.example .env.local
   ```
   Fill in your Discord OAuth2 credentials and bot API details.

2. **Install dashboard dependencies**
   ```bash
   npm install
   ```

3. **Start the dashboard**
   ```bash
   npm run dev
   ```

4. **Deploy to Vercel** (optional)
   - Push to GitHub
   - Import to [Vercel](https://vercel.com/new)
   - Set root directory to `dashboard`
   - Add environment variables in Vercel settings

## ⚙️ Configuration

Copy `config.example.yml` to `config.yml` and fill in your values:

```yaml
BOT:
  OWNERS: ["your-discord-user-id"]
  ADMINS: ["your-discord-user-id"]

SPOTIFY:
  ID: "your-spotify-client-id"
  SECRET: "your-spotify-client-secret"

LAVALINK:
  HOST: "localhost"
  PORT: 2333
  AUTH: "your-lavalink-password"

Chiku:
  TOKEN: "your-discord-bot-token"
  CLIENT_ID: "your-discord-client-id"

DATABASE:
  MONGODB_URI: "mongodb+srv://user:pass@cluster.mongodb.net/Chiku"

DASHBOARD:
  ENABLED: true
  PORT: 3422
  API_KEY: "your-secure-api-key"
```

> ⚠️ **Never commit `config.yml` or `.env.local` to version control!** They are included in `.gitignore` by default.

## 📁 Project Structure

```
Chiku/
├── api/                    # Express REST API for dashboard
│   ├── middleware/          # Auth & validation middleware
│   └── routes/             # API route handlers
├── commands/               # Bot commands
│   ├── music/              # Music playback commands
│   └── playlist/           # Playlist management commands
├── config/                 # Configuration loader
├── dashboard/              # Next.js web dashboard
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   └── lib/                # Utility libraries
├── database/               # MongoDB models & schemas
├── events/                 # Discord event handlers
│   ├── client/             # Client events
│   ├── custom/             # Custom events
│   └── player/             # Music player events
├── main/                   # Core client class
├── plugins/                # Bot plugins (logger, etc.)
├── utils/                  # Utility functions
├── config.yml              # Bot configuration (git-ignored)
├── config.example.yml      # Configuration template
└── index.js                # Entry point
```

## 🎵 Commands

| Command | Description | Aliases |
|---------|-------------|---------|
| `play <query>` | Play a song or playlist | `p` |
| `pause` | Pause current playback | - |
| `resume` | Resume playback | `unpause` |
| `skip` | Skip to next song | `s` |
| `stop` | Stop playback & clear queue | - |
| `queue` | Show the current queue | `q` |
| `shuffle` | Shuffle the queue | - |
| `volume <1-100>` | Adjust playback volume | `vol` |
| `nowplaying` | Show current song | `np` |
| `lyrics [song]` | Get song lyrics | - |
| `filter <filter>` | Apply audio filter | - |
| `pl-create <name>` | Create a playlist | - |
| `pl-add <name> <url>` | Add song to playlist | - |
| `pl-load <name>` | Load a playlist | - |

## 🛡️ Security

This project follows security best practices:

- **Secrets are not committed** — `config.yml` and `.env.local` are in `.gitignore`
- **API key authentication** — Dashboard API requires bearer token
- **Rate limiting** — Built-in rate limiting on all API endpoints
- **CORS protection** — Configurable allowed origins
- **Input validation** — All API inputs are validated
- **OAuth2** — Secure Discord OAuth2 for dashboard authentication

> If you discover a security vulnerability, please report it responsibly via [GitHub Issues](https://github.com/Alivelyyy/Chiku/issues) or Discord.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU General Public License v3.0 — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) — Discord API wrapper
- [Kazagumo](https://github.com/DevLisk/kazagumo) — Music framework
- [Shoukaku](https://github.com/Deivu/Shoukaku) — Lavalink wrapper
- [Next.js](https://nextjs.org/) — React framework for dashboard
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS

---

<div align="center">

**Made with ❤️ by [ApeX Development](https://discord.gg/uskTjqz5ah)**

If you find Chiku useful, please consider giving it a ⭐!

</div>
