import type { Metadata } from "next";
import {
  Music2, Zap, Shield, Sliders, Radio, ListMusic, Mic2, Globe,
  Repeat2, Volume2, Search, Clock, BarChart3, Sparkles, HeadphonesIcon, Gauge,
  ArrowRight, Star
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features — Chiku Discord Music Bot",
  description:
    "Explore every feature Chiku has to offer: crystal-clear audio, 10+ platforms, advanced filters, smart autoplay, 24/7 mode, web dashboard and 80+ commands.",
  alternates: { canonical: "/features" },
};

const FEATURES = [
  { icon:Music2,         title:"Crystal Clear Audio",      desc:"Lavalink-powered at up to 320kbps. Zero compression artifacts, studio-quality streaming every single time.",     tag:"Audio Engine" },
  { icon:Zap,            title:"Lightning Fast",           desc:"Commands respond in under 100ms. Instant search results with near-zero latency queue operations.",               tag:"Performance"  },
  { icon:Globe,          title:"Multi-Platform Support",   desc:"Stream from YouTube, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp, Twitch, and direct audio URLs.",        tag:"Sources"      },
  { icon:Sliders,        title:"Advanced Audio Filters",   desc:"Bass boost, nightcore, vaporwave, 8D audio, karaoke, soft filter, and custom per-band equalizer control.",       tag:"Effects"      },
  { icon:Radio,          title:"Autoplay & 24/7",          desc:"Smart autoplay picks related tracks based on listening history. 24/7 mode keeps the bot alive permanently.",     tag:"Automation"   },
  { icon:ListMusic,      title:"Smart Queue",              desc:"Shuffle, remove, move, jump to any track. Duplicate detection, session history, and full playlist loading.",     tag:"Queue"        },
  { icon:Shield,         title:"Permission System",        desc:"DJ role enforcement, per-server music channel restriction, vote-skip, and granular admin controls.",             tag:"Security"     },
  { icon:BarChart3,      title:"Web Dashboard",            desc:"Full real-time control from your browser. Player controls, queue editor, track search, history, and settings.", tag:"Dashboard"    },
  { icon:Search,         title:"Powerful Search",          desc:"Search by song, artist, album, or paste any URL. Get top 10 results instantly, complete with thumbnails.",      tag:"Discovery"    },
  { icon:Repeat2,        title:"Loop Modes",               desc:"Loop a single track or the entire queue. Toggle modes instantly with a single command or dashboard click.",     tag:"Playback"     },
  { icon:Volume2,        title:"Volume Control",           desc:"Per-server volume from 0 to 200%. Set a default, adjust live, with smooth transitions and normalization.",      tag:"Audio"        },
  { icon:Clock,          title:"Track History",            desc:"Full session history with timestamps. Re-queue any previously played track from the dashboard with one click.", tag:"Memory"       },
  { icon:Mic2,           title:"Lyrics",                   desc:"Real-time lyrics powered by Genius. View full lyrics for the current or any searched track.",                   tag:"Extras"       },
  { icon:HeadphonesIcon, title:"Voice Channel Detection",  desc:"Auto-joins your channel. Leaves when everyone disconnects. Configurable timeout and smart reconnect behavior.", tag:"Smart"        },
  { icon:Gauge,          title:"80+ Commands",             desc:"Play, pause, skip, seek, queue, history, filters, lyrics, settings, stats, and a whole lot more.",              tag:"Coverage"     },
  { icon:Star,           title:"Premium Support",          desc:"Priority support channel and early access to new features. Built and maintained by ApeX Development.",          tag:"Support"      },
];

const STATS = [
  { value:"80+",    label:"Commands"      },
  { value:"10+",    label:"Music Sources" },
  { value:"6",      label:"Audio Filters" },
  { value:"<100ms", label:"Response Time" },
  { value:"99.9%",  label:"Uptime"        },
  { value:"24/7",   label:"Support"       },
];

const INVITE = "https://discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8";

export default function FeaturesPage() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs text-white/42 font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Everything included
          </div>
          <h1 className="page-title mb-7">
            Packed with<br /><span className="text-gradient">powerful features</span>
          </h1>
          <p className="text-lg text-white/38 max-w-2xl mx-auto leading-7">
            Chiku is built from the ground up with everything a modern Discord music bot needs — audio quality, customization, and full dashboard control.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATS.map(({ value, label }) => (
            <div key={label} className="stat-card text-center">
              <p className="text-2xl font-black text-white mb-1.5 leading-none">{value}</p>
              <p className="text-[10px] text-white/28 font-bold uppercase tracking-[0.18em] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="px-5 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {FEATURES.map(({ icon:Icon, title, desc, tag }) => (
            <div key={title} className="glass-card feature-card p-6 group">
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl border border-white/[0.07] bg-white/[0.035] flex items-center justify-center
                               group-hover:border-white/[0.14] group-hover:bg-white/[0.06] transition-all duration-300">
                  <Icon className="w-4.5 h-4.5 text-white/52" />
                </div>
                <span className="badge-muted text-[10px]">{tag}</span>
              </div>
              <h3 className="font-bold text-white text-[13px] mb-2.5">{title}</h3>
              <p className="text-[13px] text-white/32 leading-[1.65]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-28 max-w-4xl mx-auto">
        <div className="relative glass-card-elevated text-center py-16 px-8 overflow-hidden inner-glow-top">
          <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
          <div className="relative">
            <p className="section-label mb-5">Ready to go</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Add Chiku to your server today.</h2>
            <p className="text-white/38 max-w-sm mx-auto mb-8 leading-7 text-[15px]">
              Everything listed here is available right now. No sign-up, no credit card, no waiting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={INVITE} target="_blank" rel="noopener noreferrer"
                className="btn-primary gap-2 px-7 py-3 text-[14px] glow-btn">
                Invite Chiku
              </a>
              <Link href="/commands" className="btn-outline px-7 py-3 text-[14px] gap-1.5">
                View all commands <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
