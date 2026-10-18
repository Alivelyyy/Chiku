# Chiku — Project Documentation

> Complete 5-page engineering documentation. Part of the Alivelyyy coding-history dossier (generated 2026-10-18).

## Chiku

> *Chiku is a full-featured, open-source Discord music bot built on discord.js v14 + Kazagumo/Shoukaku (Lavalink), paired with a complete Next.js 14 web dashboard that controls playback, queue, filters, and per-guild settings live against a Discord OAuth2 login. It was built inside ApeX Development's bot stack (it grew out of the Mimi bot config lineage) and is the developer's single most mature project — 186 files, an in-bot REST API, a premium/voucher economy, and a documented two-service deployment topology (Pterodactyl bot + Vercel dashboard).*

| Fact | Value |
|---|---|
| GitHub URL | https://github.com/Alivelyyy/Chiku |
| Visibility | Public |
| Created | 2026-05-03 |
| Last pushed | 2026-08-31 |
| Primary language | JavaScript (bot core) |
| All languages | JavaScript (123 .js files — bot + API + plugin layer), TypeScript (18 .ts + 30 .tsx — Next.js dashboard), CSS (1 via dashboard), YAML (config + example), Markdown (README/SETUP/CONTRIBUTING) |
| Total files | 186 |
| Total commits | 16 |
| Live site | https://chikubot.vercel.app (dashboard; bot itself runs on a Pterodactyl host, port 3001 API) |
| Category | Discord music bot + serverless web dashboard (full-stack) |

### 📄 Page 1 — Overview & Purpose

#### What Chiku is
Chiku is a Discord music bot "High Performance Discord Music Bot with Web Dashboard" per the README's title. The README describes it as *"a feature-rich, open-source Discord music bot built with discord.js, Kazagumo, and a modern Next.js web dashboard"* that streams *"high-quality audio from YouTube, Spotify, and more — all managed from a beautiful web interface."* The audio engine is outsourced to a Lavalink node: `Kazagumo` is the player manager and `shoukaku` v4 is the Lavalink client, with a `kazagumo-spotify` plugin (`kazagumo-spotify ^2.1.1`) that lets users paste Spotify albums/playlists/track URLs directly, resolved through Spotify client credentials and played via YouTube Music search results.

#### The problem it solves
Most Discord music bots offer either (a) good in-server UX but no remote control, or (b) dashboards that need databases and session plumbing. Chiku ships both halves in one repo:

- **In-chat**: 81 command files across 7 categories (`config`, `filters`, `music`, `owner`, `playlist`, `premium`, `utility`) plus a rich button interface — the now-playing card has 10 interactive buttons (`np_previous`, `np_pause`, `np_skip`, `np_stop`, `np_loop`, `np_shuffle`, `np_voldown`, `np_volup`, `np_queue`, `np_lyrics`).
- **Remote**: a `dashboard/` Next.js app where a Manage-Guild Discord user can pause/skip/seek/loop, search and queue tracks, reorder/delete/shuffle the queue, and edit per-guild settings — all authenticated with Discord OAuth2 (`identify guilds` scope) and proxied via a bearer-token API.

#### Intended users & positioning
Discord server owners who want a self-hostable, license-clean (GPL-3.0) music bot with a white-labeled dashboard. The README markets it with a full badge row (License/Stars/Issues/PRs/Last Commit) and tech badges for Discord.js v14, Node 18+, Next.js v14 and MongoDB. Invite link: `discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8`; support server `discord.gg/uskTjqz5ah`; a top.gg vote page is wired (`/vote` → `top.gg/bot/1500425524009500802/vote`).

#### Notable details
- It is the developer's first **open-source release**: commit `2c2f7c7` "chore: prepare for open source release" and `74f7c8d` "fix: remove CDATA wrapper from README" on 2026-08-31 packaged the private bot with a real `CONTRIBUTING.md`, GPL-3.0 `LICENSE`, and `config.example.yml` sanitization.
- The config schema betrays shared DNA with his other bot: `config.example.yml` contains **both** a `Chiku:` block and a `Mimi:` block (prefix/emojis/shards/PER_CLUSTER), showing the codebase was forked from the Mimi bot architecture and generalized.
- README quote: *"Never commit `config.yml` or `.env.local` to version control!"* — although git history shows earlier commits (`Update .env.local`, `Update config.yml`) touched real secrets before the open-source hardening pass.

#### Evolution evidence from git history
16 commits tell the whole story: `26260f1` "Initial commit" and `9b3165b` "ok," on 2026-05-03 (the v0/Replit-era birth, with co-author account `dfserfreferftr` pushing "Saved progress at the end of the loop" and "Remove redundant file and improve build process"); `e245048` "Delete .replit" (2026-05-17) marks the migration off Replit to Pterodactyl hosting; a run of `Update .env.local`/`Update config.yml` commits (05-15, 05-22, 07-26) track production credentials churn; `8598597` "Change BOT_API_URL to new endpoint" (2026-08-31) re-pointed the dashboard at a new bot API host; and the final pair of commits prepared public release. Contributor names: `A L I V E` (main), `Alivelyyy`, `dfserfreferftr`.

### 📄 Page 2 — Technology Stack & Architecture

#### Exact dependency set (root `package.json`, name `chiku` v1.0.0)
| Package | Version | Role |
|---|---|---|
| `discord.js` | ^14.16.3 | gateway/bot framework |
| `kazagumo` | ^3.4.3 | player manager over Lavalink |
| `shoukaku` | ^4.3.0 | Lavalink REST + WS client |
| `kazagumo-spotify` | ^2.1.1 | Spotify URL/playlist resolution |
| `mongoose` | ^8.5.0 | MongoDB ODM (settings, playlists, premiums) |
| `express` | ^5.2.1 | in-bot REST API |
| `express-rate-limit` | ^8.4.1 | 200 req/min API limiter |
| `cors` | ^2.8.6 | locked to dashboard origin |
| `@top-gg/sdk` | ^3.1.6 | top.gg vote webhook support |
| `genius-lyrics` | ^4.4.3 | lyrics fetch (button + `/lyrics` command) |
| `js-yaml` | ^4.1.0 | config loading |
| `module-alias` | ^2.2.3 | `@utils`/`@plugins`/`@database` import aliases |
| `axios`, `chalk` v4, `moment` | ^1.7.2 / ^4.1.2 / ^2.30.1 | HTTP, colored logging, time formatting |

Scripts: `"start": "node index.js"`, `"dev": "node --watch index.js"` (Node's native watch mode, no nodemon). `_moduleAliases` registers `@root`, `@utils`, `@assets`, `@commands`, `@events`, `@database`, `@plugins`, `@main`.

#### Dashboard dependencies (`dashboard/package.json`)
`next ^14.2.0` (App Router), `react`/`react-dom ^18.3.0`, `next-auth ^4.24.7` (Discord provider), `swr ^2.2.5` (4-second polling hooks), `axios ^1.7.2`, `clsx`, `lucide-react ^0.400.0`; devDeps: TypeScript ^5.4.5, Tailwind ^3.4.4, autoprefixer, PostCSS, ESLint 8 + `eslint-config-next`. Dev command: `next dev -p 5000 -H 0.0.0.0`.

#### Language weights (from EXTCOUNTS, 186 files)
`.js` 123 (66%) · `.tsx` 30 (16%) · `.ts` 18 (10%) · `.json` 5 · `.md` 3 · `.yml` 2 · `.example` 1 · `.png` 1 · `.css` 1 · 2 no-extension. So the repo is a JS server bot with a TS SPA welded on — exactly a "JavaScript + TypeScript" project as the metadata states.

#### Folder-by-folder walk
```
Chiku/
├── index.js          # bootstrap: config → ChikuClient → antiCrash → API on ready
├── clients/Chiku.js  # alternate minimal bootstrap
├── main/extendedClient.js      # customized discord.js Client (243 lines)
├── api/              # Express REST API: index.js, middleware/auth.js,
│                     #routes/{stats,guilds,player,queue,settings,topgg}.js
├── commands/         # config(4) filters(12) music(31) owner(11) playlist(11) premium(4) utility(8)
├── events/           # client/{ready,interactions}.js, custom/messagecreate.js,
│                     #player/{trackStart,trackEnd,queueEnd,playerStuck,error,resolveError}.js
├── database/         # guildSettings, playlistModel, premiumModel, voucherModel,
│                     #kvStore (+noprefix), vouchers
├── plugins/          # logger.js (chalk logger), player.js (UI builders), button.js, embed.js
├── utils/            # antiCrash.js, formatters.js, filterHelper.js, codestats.js
├── assets/           # emoji.js + emojis/black.js (custom emoji IDs)
├── dashboard/        # Next.js app (below)
```
Dashboard: `app/` (routes: `/`, `/login`, `/(public)/{about,features,commands,faq,premium,team,privacy,terms,contact}`, `/dashboard/[guildId]`, `/dashboard/[guildId]/settings`, `/player/[guildId]`), `app/api/auth/[...nextauth]/route.ts`, `app/api/discord/guilds/route.ts`, and 9 `app/api/proxy/**` routes that forward to the bot API; `components/` (14 UI components: `PlayerCard`, `MiniPlayer`, `QueueList`, `HistoryList`, `GuildCard`, `SettingsForm`, `StatsBar`, `SearchBar`, `Navbar` ×2, `PublicFooter` etc.); `lib/{api,auth,types}.ts`.

#### Deploy configuration
- `dashboard/vercel.json`: `framework: nextjs`, `buildCommand: rm -rf .next && npm run build`, region `iad1`, security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`), immutable cache on `/_next/static/*`, and convenience redirects `/invite`, `/support`, `/vote`.
- Root `.gitignore` keeps `config.yml`, `.env.local` out of VCS.
- `SETUP.md` documents the architecture diagram: `Discord Bot ──► Express REST API (port 3001) ◄── Vercel (Next.js Dashboard)`, with the API key as the trust axis.

#### Development setup (from README/SETUP.md)
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` to mint a dashboard API key, `cp config.example.yml config.yml`, open allocation port 3001 in Pterodactyl, `npm install && npm start` for the bot; then `cd dashboard && cp .env.example .env.local` with `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DISCORD_CLIENT_*`, `BOT_API_URL`, `BOT_API_KEY`, and `npm run dev` (runs on :5000) or import to Vercel with root directory `dashboard`.

### 📄 Page 3 — Features & Functionality (Feature-by-Feature)

#### Music playback engine
- **Multi-source search**: `kazagumo.search()` with default engine `youtube`; play.js falls back to error messaging when the audio node is down; dashboard search escalates `query → ytmsearch: → ytsearch:` and picks the best match via `findExactTrack()` (string containment across title/author/URI).
- **Playlist-aware play** (`commands/music/play.js`): handles `result.type === "PLAYLIST"` by batch-adding all tracks and returning a "Playlist Added" card with total duration and queue-position range.
- **Audio filters** (12 filter commands): `bassboost`, `nightcore`, `vaporwave`, `8d` (rotation), `karaoke`, `distortion`, `tremolo`, `vibrato`, `speed`, `pitch`, `lowpass`, `rotation`, plus `reset` — backed by hard-coded Lavalink band tables in `plugins/player.js getFilters()` (e.g. bassboost EQ: band 0 gain +0.6 … band 9 −0.7).
- **15-band equalizer** with genre presets in `getEQPresets()`: `flat`, `bassboost`, `treble`, `pop`, `rock`, `jazz`, `metal` — each a full 15-band gain array applied via `player.shoukaku.setFilters()`.
- **Radio** (`commands/music/radio.js`): 10 built-in 24/7 station presets (Lo-Fi Beats, Chillhop, Jazz Café, Deep House, Classical, Synthwave, Epic/Gaming, Ambient, K-Pop Hits, Hip-Hop) resolved as YouTube live searches with a station-picker button UI.
- **Lyrics**: Genius integration (`genius-lyrics`), both from the `np_lyrics` button (auto-fetches current track, trims to 1800 chars with a "use `lyrics` command for full text" note) and the `/lyrics` command.
- **Session controls**: seek/rewind/forward, replay, jump, move, remove, clear, shuffle, loop cycle `none → track → queue`, volume 1–200 (with premium gating above 100), history view.

#### Playback intelligence
- **Autoplay** (`events/player/queueEnd.js`): when the queue empties, `findAutoplayTrack()` generates 6 cascading YouTube Music queries derived from the last track (title minus parentheticals, plus split artist), filters candidates to 1–10 min non-stream tracks not in a 100-deep history, adds one at random from the top 5, and even re-connects the player if the node dropped (`player.connect()` retry).
- **24/7 mode**: on queue end with `alwaysOn` enabled, the bot posts a "Queue Ended — 24/7 Active" summary card and stays in voice.
- **Session stats**: `_sessionStats` (tracksPlayed, totalDuration, startedAt) is displayed in end-of-session cards and on stop.
- **Now Playing card system** (`plugins/player.js`): Discord **Components V2** UI (`ContainerBuilder`, `TextDisplayBuilder`, `SeparatorBuilder`, `SectionBuilder`, `MediaGalleryBuilder`, `ThumbnailBuilder`, accent colors, artwork thumbnail, progress bar `formatProgressBar(position, duration, 28)`, LIVE badge for streams) with 2 action rows; the card self-edits on pause/loop/volume changes and is deleted/re-sent each track.
- **Voteskip** with yes/no button tallies; **vote-locked premium features** (`np_volup` > 100% checks `checkPremium()`).

#### Prefix command pipeline (`events/custom/messagecreate.js`, 225 lines)
Per-guild DB prefix → no-prefix mode for premium users (`database/noprefix.js` KV store) → blacklist gate → maintenance gate (owner bypass) → musicChannel confinement for music/filter/playlist categories (echoes correct channel, self-deletes after 5 s) → owner/admin/premium gates → DJ-role gate (Admin/ManageChannels/DJ role/owner bypass) → `botPerms`/`userPerms` checks → voice-channel/player/queue/same-VC preconditions → per-user cooldowns → args validation → typed error card.

#### Owner & monetization layer
`commands/owner/`: `eval` (REPL), `reload`, `broadcast` (all-guild announce), `servers`, `leaveserver`, `blacklist`, `maintenance`, `forcestop`, `noprefix`, and the premium economy: `givepremium` + `genvoucher` + `commands/premium/{activate,deactivate,profile,noprefix}` with `premiumModel.js` (expiry-date documents; auto-purge on expiry) and `voucherModel.js`/`vouchers.js`. Premium also raises playlist quotas: `FREE_LIMIT {playlists: 3, tracks: 50}` vs `PREMIUM_LIMIT {playlists: 25, tracks: 500}` in `playlistModel.js`.

#### Playlist system
11 commands (`pl-create`, `pl-add`, `pl-addqueue`, `pl-addnowplaying`, `pl-load`, `pl-list`, `pl-info`, `pl-remove-track`, `pl-delete`, `pl-dupes`, `playlist`) on a Mongo `Playlist` model with a `userId+name` unique index and `_id:false` track subdocuments (title/author/uri/length/isStream/thumbnail).

#### Dashboard features (server-side)
Stats page (guild count, user sum, active players, commands/aliases loaded, heap MB, uptime, ws ping, shards), guild browser, per-guild player console (4s SWR polling: play/pause/skip/previous/stop/loop/volume/seek/effects/autoplay/24-7), search-and-queue, queue reordering with `move`/`remove`/`shuffle`/`clear`, playback history (last 20), and a settings form (prefix 1–5 chars, DJ role, music channel, default volume, announce songs, delete-NP-after, autoplay, 24/7, language) whitelisted field-by-field on `PATCH`.

#### top.gg integration
`api/routes/topgg.js` exposes an unauthorized `/api/topgg/webhook` (its own `Authorization` header check against `BOT.TOPGG_KEY`) before the global auth middleware, emits `client.emit("topggVote", ...)` and logs weekend votes; `/api/topgg/status` is health for the vote loop; dashboard `/vote` redirect exists.

### 📄 Page 4 — Code Internals & Systems Design

#### Boot sequence
`index.js` loads `config.yml` with `js-yaml`, registers `module-alias`, constructs `ChikuClient`, attaches `antiCrash`, sets a one-shot `clientReady` hook that starts the Express API if `DASHBOARD.ENABLED !== false`, then `client.connect(token, prefix, emojis)`. `main/extendedClient.js` (custom Client subclass) does the real wiring in order: `_connectDB()` (mongoose, exits on failure) → `_initKazagumo()` (Spotify plugin with 5-page playlist/album limits, `DiscordJS` connector, one Lavalink node from config, `ready/disconnect/reconnecting/error` node listeners) → `_loadCommands()` (recursive category scan, `Collection` of commands + alias map, per-file load-error isolation) → `_loadEvents()` (`events/client` + `events/custom`) → `_loadPlayerEvents()` (Kazagumo emitter) → `_bindGuildEvents()` (join/leave logging; disconnect-detection: if the bot is kicked from voice, the player is destroyed and a red "Disconnected" Components V2 card is sent) → `login()`.

#### The bot ↔ dashboard data flow
1. Browser → Next.js page (Server Component data via SWR with `refreshInterval: 4000`).
2. `PlayerCard` posts to `/api/proxy/guilds/:id/player/:action`.
3. The proxy route (e.g. `app/api/proxy/guilds/[guildId]/player/[action]/route.ts`) checks `getServerSession(authOptions)` → 401 if anonymous.
4. `lib/api.ts botFetch()` appends `Authorization: Bearer process.env.BOT_API_KEY`, `cache: "no-store"`, and `AbortSignal.timeout(5000)`; timeouts surface as "Bot API timeout - bot may be offline".
5. On the bot host, `api/index.js` runs express.json → CORS restricted to `DASHBOARD.ALLOWED_ORIGIN` (allowed methods GET/POST/PATCH/DELETE/OPTIONS, only `Authorization`/`Content-Type` headers) → rate limit 200/min (skipping `/health`) → `authMiddleware` bearer compare against `DASHBOARD.API_KEY` → routers.
6. Route handlers mutate the *live* Kazagumo player objects (`client.kazagumo.players.get(guildId)`), so dashboard actions are millisecond-close to real playback.

#### State storage (all MongoDB via mongoose 8)
- `guildSettings` collection: `prefix, djRole, musicChannel, alwaysOn, autoplay, defaultVolume, announceSongs, deleteNPAfter, language` with a **5-minute in-process cache Map** (`getSettings` memoizes, `invalidateCache` exported), `upsert` on update, `DEFAULTS` fallback table.
- `premium` collection: `userId, activatedAt, expiresAt, voucher, grantedBy` — expired docs are deleted lazily on read.
- `playlists` collection: per-user named playlists, unique `(userId,name)`.
- `kv_<namespace>` generic store (`kvStore.js`): schemaless `_id`→`Mixed` keyed store instantiated per namespace (used for `noprefix`), with its own model cache.
- Player-local state (no DB): `player._npMessage` (DOM-like handle to the NP card), `_history` (max 100), `_sessionStats`, `_autoplay`, `_alwaysOn`, `_currentFilter`, `_currentEQ`, `_effectPresets`; client-level `_searchCache` (Map keyed `guildId_userId` for search-button selection) and `guildPrefixes` Map; REST-only `api/routes/player.js` keeps a 10-minute `_trackCache` so a `/play` call after a `/search` doesn't re-resolve the URI (three-step resolution: cache → URI search → ytmsearch fallback).

#### Message protocol / API surface
REST endpoints: `GET /health` (no auth), `GET /api/stats`, `GET /api/guilds`, `GET /api/guilds/:id`, `POST /api/guilds/:id/player/:action` (`pause,resume,skip,previous,stop,volume,loop,autoplay,alwayson,effects,seek,play`), `GET /api/guilds/:id/player/(search|history)`, `GET/DELETE /api/guilds/:id/queue`, `POST .../queue/(clear|shuffle|move)` + `DELETE .../queue/:index`, `GET/PATCH /api/guilds/:id/settings`, `POST /api/topgg/webhook`, `GET /api/topgg/status`. Every JSON error is a single `{ error }` shape; `settings.js PATCH` validates prefix (1–5 chars) and volume (1–200) server-side; `queue.js move` validates from/to indexes against `queue.length`.

#### Error handling & resilience
- `utils/antiCrash.js`: traps `unhandledRejection`, `uncaughtException`, `uncaughtExceptionMonitor`, `warning`; SIGINT handler **gracefully destroys every active player** before `client.destroy()`; SIGTERM handler for container stops.
- Player events: `playerError`, `playerResolveError`, `playerStuck`, `trackStart`, `trackEnd`, `queueEnd` are separate modules; `queueEnd` guards against racing a destroyed player (`player.state !== PlayerState.DESTROYED`, `player.shoukaku?.node?.connected`) and retries `connect()*play()` once.
- The interaction handler (`events/client/interactions.js`, 665 lines) wraps everything in try/catch and answers with an error card (`accent` red 0xED4245) via `reply` or `followUp` depending on deferral state.

#### Security posture
Bearer API key (generated via `crypto.randomBytes(32)`), CORS allow-list, rate limiting, `trust proxy 1`, dashboard-only JWT sessions (`NEXTAUTH_SECRET`, Discord provider scope `identify guilds`, custom `jwt`/`session` callbacks to carry `accessToken`/`userId`), `next-auth/middleware` matcher guarding `/dashboard/:path*` (`dashboard/middleware.ts`), SETUP.md's rule that the API key never crosses to the browser, and per-endpoint input validation.

#### How to run (condensed)
Bot: `npm install` → fill `config.yml` (token, mongo, lavalink, spotify) → `npm start`. Dashboard locally: `.env.local` with `BOT_API_URL=http://localhost:3001` → `npm run dev`. Production: bot on Pterodactyl with allocation 3001; dashboard on Vercel with the 6 env vars from `.env.example`; test with `curl -H "Authorization: Bearer <key>" http://host:3001/api/stats`.

### 📄 Page 5 — Development Timeline, Skills & Resume Highlights

#### Timeline (16 commits, 2026-05-03 → 2026-08-31)
| Date | Milestone | Commit |
|---|---|---|
| 2026-05-03 | Repo born (v0/Replit era). "Initial commit", then same-day three more pushes. "Saved progress at the end of the loop" (co-author `dfserfreferftr`) suggests an AI-assisted rapid scaffold session; "Remove redundant file and improve build process" trimmed cruft. | `26260f1`, `b878ba6`, `437365f`, `286f445` |
| 2026-05-15–17 | First production credential rotations (`.env.local`), then **leaving Replit** ("Delete .replit") — bot moves to Pterodactyl VPS hosting. | `016c19b`, `e245048` |
| 2026-05-22 | Config + env updates as uptime/keys rotate in production. | `be8d796`, `01bac7e` |
| 2026-07-26 | Another config/env pass — bot has been live ~2.5 months. | `1e08e15`, `ff2357c` |
| 2026-08-21 | "Update config, env and rebuild dashboard artifacts" — first recorded dashboard redeploy bundle. | `58d1b71` |
| 2026-08-31 | Release day: API endpoint migrates ("Change BOT_API_URL to new endpoint"), open-source prep ("chore: prepare for open source release"), README cleanup ("fix: remove CDATA wrapper from README"). | `8598597`, `2c2f7c7`, `74f7c8d` |

Funny/notable log lines worth quoting: *"Saved progress at the end of the loop"*, *"ok"*, *"ok,"*, *"fix: remove CDATA wrapper from README"*, *"Change BOT_API_URL to new endpoint"*.

#### Technologies practiced
discord.js v14 with the modern **Components V2** container message API; Kazagumo/Shoukaku and Lavalink (filters, EQ band arrays, node failover); mongoose 8 schema + cache design; Express 5 + rate limiting + CORS + bearer auth; Next.js 14 App Router with route handlers, server sessions, NextAuth 4 Discord provider, SWR polling, Tailwind, Vercel rewrite/redirect config; YAML config engineering; module-alias architectural namespaces; graceful-shutdown POSIX signal handling.

#### Engineering patterns demonstrated
- **Two-service split**: stateful bot (voice sockets, Lavalink) over a stateless serverless dashboard — bridged only by a stateless REST layer with one shared secret.
- **Proxy/facade pattern**: every dashboard API route is a thin `getServerSession` → `botApi.<method>` adapter, keeping the key server-side.
- **Taxonomy-driven command framework**: command modules declare `name/aliases/category/cooldown/owner/admin/premium/botPerms/userPerms/inVoiceChannel/player/queue/sameVoiceChannel` flags, and the dispatcher enforces them declaratively — the same pattern as production bot frameworks.
- **Caching**: dual-layer (guildSettings Map with TTL; REST track cache keyed by URI with 10-min expiry).
- **Defensive playback**: autoplay query cascades, candidate filtering against history, destructor race checks, reconnect-and-play retry.

#### 5–8 résumé-ready bullets
- Built **Chiku**, an open-source (GPL-3.0) Discord music bot in Node.js — 81 commands over audio filters/EQ, Spotify+YouTube playback, lyrics, playlists, and DJ/prefix/premium per-guild config powered by MongoDB.
- Engineered a **Components V2 interactive UI** in Discord (now-playing card with 10 live control buttons, self-updating queue pagination, filter/EQ switchers) rendered and mutated through a custom card-builder plugin layer.
- Designed and implemented the bot's **REST control API** (Express 5): bearer-token auth, CORS allow-listing, 200 req/min rate limiting, health check, and 20+ endpoints wrapping a live Kazagumo/Lavalink player with volume/seek/loop/queue shuffling.
- Built the matching **Next.js 14 dashboard** (App Router, NextAuth Discord OAuth2, SWR) deployed on Vercel, with a session-guarded BFF proxy layer and 5 s abort-timeout HTTP client; documented the full Pterodactyl↔Vercel topology in `SETUP.md`.
- Implemented **autoplay** with multi-query candidate search and duplicate filtering against a 100-track history, **24/7 mode**, voteskip voting, top.gg vote webhooks, and a premium/voucher economy with Mongo-backed quotas.
- Hardened the process with an anti-crash layer (unhandled rejection/exception traps, SIGINT/SIGTERM player teardown) and documented secrets handling (`config.example.yml`, `.env.example`).

#### Limitations / future work
- `config.yml` and `.env.local` were historically committed (see "Update config.yml"/"Update .env.local" commits), so real credentials exist in history despite the README warning — a documented example of secret rotation driving the open-source prep.
- The top.gg webhook's `notifyGuild()` contains a dead `logChannel` branch (`config.WEBHOOKS?.STATIC ? null : null`) and a stray unused `SeparatorBuilder` import — vote celebration UI is still TODO.
- Radio/lyrics/EQ presets are hard-coded in code rather than config-driven; no test suite, CI, or Dockerfile in the repo; the `Mimi:` config block is vestigial.

#### Maturity assessment
**Production-grade MVP**, further along than any other repo in the dossier: two live production services (bot + dashboard at https://chikubot.vercel.app), a monetization system, documented onboarding, sanitized public release — but with honest shortcuts (secrets in git history, no tests, owner `eval` command). It is the strongest centerpiece project for a "built and operates a real full-stack product" résumé line.
