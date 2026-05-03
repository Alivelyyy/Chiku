import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, Music2, Zap, Globe, Sliders, Radio, ListMusic,
  Shield, BarChart3, Play, Pause, SkipForward, Volume2, Repeat2,
  Shuffle, Check, Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Chiku — Discord Music Bot by ApeX Development",
  description:
    "The most powerful Discord music bot. 80+ commands, 10+ platforms, real-time web dashboard, audio filters and autoplay. Built by ApeX Development.",
  alternates: { canonical: "/" },
};

const FEATURES = [
  { icon: Music2,    title: "Crystal Audio",      desc: "Lavalink-powered at up to 320kbps. Zero compression, studio quality every time." },
  { icon: Globe,     title: "10+ Platforms",       desc: "YouTube, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp, and more." },
  { icon: Sliders,   title: "Audio Filters",       desc: "Bass boost, nightcore, 8D audio, karaoke, vaporwave, soft — toggle instantly." },
  { icon: Radio,     title: "Autoplay & 24/7",     desc: "Smart autoplay picks related tracks. 24/7 keeps the bot alive indefinitely." },
  { icon: ListMusic, title: "Queue Management",    desc: "Shuffle, remove, jump, move tracks. Full history, duplicate detection." },
  { icon: BarChart3, title: "Web Dashboard",       desc: "Real-time browser control. No commands needed. Works on any device." },
  { icon: Shield,    title: "Permissions",         desc: "DJ roles, music channels, vote-skip. Complete per-server control." },
  { icon: Zap,       title: "Lightning Fast",      desc: "Sub-100ms command response. Instant search. Zero perceived lag." },
];

const STATS = [
  { value: "80+",   label: "Commands" },
  { value: "10+",   label: "Platforms" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7",  label: "Support" },
];

const INVITE = "https://discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8";

const DiscordIcon = () => (
  <svg width="16" height="12" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-white">
      <PublicNavbar />
      <main className="flex-1 pt-20 overflow-hidden">

        {/* ── Hero ── */}
        <section className="relative min-h-[92vh] flex items-center justify-center px-5 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[800px] h-[500px] rounded-full pointer-events-none opacity-30"
            style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] text-white/45 font-semibold mb-10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white np-pulse" />
              Private Bot · ApeX Development
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-3xl overflow-hidden glow-btn">
                <Image src="/chiku.png" alt="Chiku" width={80} height={80} className="w-full h-full object-cover" priority />
              </div>
            </div>

            {/* Headline */}
            <h1 className="hero-title mb-8 text-gradient-sharp">
              Music for<br />every server.
            </h1>

            <p className="text-lg sm:text-xl text-white/38 max-w-lg mx-auto leading-7 mb-12">
              80+ commands, 10+ platforms, real-time web dashboard.
              Crystal clear audio. Built by ApeX Development.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
              <Link href="/login" className="btn-primary gap-2.5 px-8 py-3.5 text-[15px] glow-btn group">
                Open Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href={INVITE} target="_blank" rel="noopener noreferrer"
                className="btn-secondary gap-2.5 px-8 py-3.5 text-[15px]">
                <DiscordIcon />
                Add to Discord
              </a>
            </div>

            {/* Player mockup */}
            <div className="max-w-md mx-auto animate-float">
              <div className="glass-card-elevated p-5 text-left">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image src="/chiku.png" alt="Chiku" width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate mb-0.5">Lofi Hip Hop Radio 🎵</p>
                    <p className="text-xs text-white/32 mt-0.5">Chiku Music · YouTube</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="flex items-end gap-[2.5px] h-4">
                      <div className="wf wf-a" /><div className="wf wf-b" />
                      <div className="wf wf-c" /><div className="wf wf-d" />
                    </div>
                    <span className="text-[10px] text-white/38 font-mono font-bold ml-1">LIVE</span>
                  </div>
                </div>

                <div className="seek-bar-track mb-5 h-[3px]">
                  <div className="seek-bar-fill" style={{ width: "42%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button className="btn-icon !w-8 !h-8 !rounded-lg"><Shuffle className="w-3.5 h-3.5" /></button>
                    <button className="btn-icon !w-8 !h-8 !rounded-lg"><Repeat2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="btn-icon !w-9 !h-9"><SkipForward className="w-3.5 h-3.5 scale-x-[-1]" /></button>
                    <button className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center glow-btn transition-all hover:bg-white/90">
                      <Pause className="w-4 h-4" />
                    </button>
                    <button className="btn-icon !w-9 !h-9"><SkipForward className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-white/25" />
                    <div className="w-14 h-[3px] bg-white/[0.09] rounded-full overflow-hidden">
                      <div className="h-full bg-white/55 rounded-full" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="px-5 py-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="stat-card text-center">
                <p className="text-[42px] font-black mb-1 leading-none">{value}</p>
                <p className="text-[10px] text-white/28 font-bold uppercase tracking-[0.22em] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-5 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-4">Everything included</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">Built for music.</h2>
            <p className="text-white/38 max-w-md mx-auto leading-7 text-[15px]">
              Every feature you need to run the perfect music experience on your server.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card feature-card p-6 group">
                <div className="w-10 h-10 rounded-xl border border-white/[0.07] bg-white/[0.035] flex items-center justify-center mb-5
                               group-hover:border-white/[0.14] group-hover:bg-white/[0.06] transition-all duration-300">
                  <Icon className="w-4.5 h-4.5 text-white/55" />
                </div>
                <h3 className="font-bold text-[13px] mb-2 text-white">{title}</h3>
                <p className="text-[13px] text-white/32 leading-[1.65]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dashboard showcase ── */}
        <section className="px-5 py-20 max-w-6xl mx-auto">
          <div className="glass-card-elevated relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-noise opacity-60 pointer-events-none" />
            <div className="relative p-8 sm:p-12 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="section-label mb-5">Web Dashboard</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-5 leading-[1.08]">
                  Full control.<br />Zero commands.
                </h2>
                <p className="text-white/38 leading-7 mb-8 text-[15px]">
                  Control playback, manage queues, search tracks, adjust settings, and monitor your bot in real time — all from any browser.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Real-time player controls with seek",
                    "Search & add any track instantly",
                    "Full queue management & reorder",
                    "Server settings & permissions",
                    "Audio effects & equalizer",
                    "Track history with re-queue",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-[13px] text-white/50">
                      <div className="w-4 h-4 rounded-md border border-white/[0.09] bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white/55" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="btn-primary gap-2 text-sm">
                  Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="glass-card-dark p-4">
                  <p className="section-label mb-3">Now Playing</p>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src="/chiku.png" alt="Track" width={44} height={44} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">Blinding Lights — The Weeknd</p>
                      <p className="text-[11px] text-white/32 mt-0.5">3:21 / 3:42 · YouTube</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn-icon !w-7 !h-7 !rounded-lg"><Play className="w-3 h-3" /></button>
                      <button className="btn-icon !w-7 !h-7 !rounded-lg"><SkipForward className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="seek-bar-track h-[3px]">
                    <div className="seek-bar-fill" style={{ width: "89%" }} />
                  </div>
                </div>

                <div className="glass-card-dark p-4">
                  <p className="section-label mb-3">Queue — 12 tracks</p>
                  <div className="space-y-2">
                    {["Levitating — Dua Lipa", "Stay — The Kid LAROI", "As It Was — Harry Styles"].map((t, i) => (
                      <div key={t} className="flex items-center gap-3">
                        <span className="text-[11px] text-white/18 font-mono w-4 flex-shrink-0">{i + 1}</span>
                        <p className="text-[13px] text-white/48 truncate flex-1">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Volume", val: "75%" },
                    { label: "Filter", val: "8D" },
                    { label: "Loop",   val: "Queue" },
                  ].map(({ label, val }) => (
                    <div key={label} className="glass-card-dark p-3.5 text-center">
                      <p className="section-label mb-2">{label}</p>
                      <p className="text-base font-black">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platforms ── */}
        <section className="px-5 py-20 max-w-4xl mx-auto text-center">
          <p className="section-label mb-4">Supported platforms</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Play from anywhere.</h2>
          <p className="text-white/38 text-[14px] mb-10 max-w-sm mx-auto leading-6">
            One command. Ten platforms. Paste a URL or just type a song name.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["YouTube", "YouTube Music", "Spotify", "SoundCloud", "Apple Music", "Deezer", "Bandcamp", "Twitch", "Vimeo", "Direct URLs"].map(p => (
              <span key={p} className="platform-pill">{p}</span>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-5 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-4">Simple setup</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Up in 30 seconds.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "01", title: "Invite the bot", desc: "Click Invite Bot and authorize Chiku to your Discord server. Takes under 30 seconds." },
              { n: "02", title: "Join a channel", desc: "Join any voice channel in your server. Chiku will auto-join when you play." },
              { n: "03", title: "Start playing", desc: "Use !play <song> or open the web dashboard to start playing instantly." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="glass-card feature-card p-7 text-center">
                <div className="text-5xl font-black text-white/[0.06] mb-4 tabular-nums leading-none">{n}</div>
                <h3 className="font-bold text-sm mb-2.5">{title}</h3>
                <p className="text-[13px] text-white/35 leading-6">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Vote CTA ── */}
        <section className="px-5 py-16 max-w-4xl mx-auto">
          <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
              <Image src="/chiku.png" alt="Chiku" width={56} height={56} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-black text-base mb-1.5">Support Chiku on top.gg</h3>
              <p className="text-[13px] text-white/38 leading-5">
                Vote every 12 hours to help Chiku reach more servers. It takes 10 seconds and means the world to us!
              </p>
            </div>
            <a href={`https://top.gg/bot/1500425524009500802/vote`} target="_blank" rel="noopener noreferrer"
              className="btn-primary gap-2 text-sm flex-shrink-0 px-6 py-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              Vote on top.gg
            </a>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-5 py-24 max-w-4xl mx-auto">
          <div className="relative glass-card-elevated text-center py-20 px-8 overflow-hidden inner-glow-top">
            <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />
            <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-8 glow-btn">
                <Image src="/chiku.png" alt="Chiku" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <p className="section-label mb-5">Ready to start?</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">Ready to play?</h2>
              <p className="text-white/38 max-w-sm mx-auto mb-10 leading-7 text-[15px]">
                Add Chiku to your server in seconds. No setup required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={INVITE} target="_blank" rel="noopener noreferrer"
                  className="btn-primary gap-2.5 px-8 py-3.5 text-[15px] glow-btn">
                  <DiscordIcon />
                  Add to Discord
                </a>
                <Link href="/features" className="btn-outline px-8 py-3.5 text-[15px]">Explore features</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
