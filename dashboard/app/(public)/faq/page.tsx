"use client";
import { useState } from "react";
import { MessageCircle, HelpCircle, Plus } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    category: "General",
    items: [
      { q:"What is Chiku?",                     a:"Chiku is a powerful, feature-rich Discord music bot built by ApeX Development. It supports 80+ commands, multiple streaming platforms, audio filters, a real-time web dashboard, autoplay, 24/7 mode, and much more." },
      { q:"Is Chiku free to use?",              a:"Yes. The core bot is completely free. You can use the vast majority of features without paying anything. An optional Premium tier unlocks additional power-user features." },
      { q:"How do I add Chiku to my server?",   a:"Click the 'Invite Bot' button in the navigation. You'll need Manage Server permission on the target server. Chiku requires bot and slash command scopes." },
      { q:"What platforms does Chiku support?", a:"YouTube, Spotify (via search), SoundCloud, Apple Music links, Deezer, Bandcamp, Twitch streams, and direct URLs to MP3/audio files." },
      { q:"Who made Chiku?",                    a:"Chiku is designed, built, and maintained by the ApeX Development team. It is a private, closed-source bot." },
    ],
  },
  {
    category: "Commands",
    items: [
      { q:"What is the default prefix?",    a:"The default prefix is `!`. You can change it per-server using `!prefix <new-prefix>` or through the web dashboard Settings page." },
      { q:"How do I play a song?",          a:"Use `!play <song name or URL>`. Chiku will search YouTube and start playing. If you're not in a voice channel, it will prompt you to join one first." },
      { q:"How does autoplay work?",        a:"When the queue is empty, autoplay automatically searches for related tracks based on the last played song and queues them up so music never stops." },
      { q:"Can I set a DJ role?",           a:"Yes. Use `!djrole @role` or use the dashboard Settings page to set a DJ role. Only members with that role can use music commands." },
      { q:"How do I vote for Chiku?",       a:"Use `!vote` in any server, or visit top.gg. Voting helps Chiku reach more servers and you can vote every 12 hours!" },
    ],
  },
  {
    category: "Dashboard",
    items: [
      { q:"How do I access the dashboard?",           a:"Click 'Dashboard' in the top navigation or go to the /login page. Sign in with Discord and you'll see all servers where you have Manage Server permission." },
      { q:"Can I control music from the dashboard?",   a:"Yes. The dashboard gives you real-time player controls — play, pause, skip, seek, volume, loop, and full queue management — all without typing a command." },
      { q:"Does the dashboard require active music?",  a:"Most player controls require an active session. You can still change server settings even when nothing is playing." },
    ],
  },
  {
    category: "Technical",
    items: [
      { q:"What technology does Chiku use?",          a:"The bot is built on discord.js v14 with Kazagumo v3 and Shoukaku for the Lavalink audio layer. The dashboard is Next.js 14 with TypeScript and Tailwind CSS." },
      { q:"Why doesn't Spotify work directly?",        a:"Spotify does not provide a public audio API. Chiku resolves Spotify links by searching YouTube Music for the track. Quality depends on YouTube." },
      { q:"Is there a rate limit on commands?",       a:"Yes. Most commands have a short cooldown (1–5 seconds) to prevent spam. Heavy search commands have a slightly longer cooldown." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item transition-colors ${open ? "bg-white/[0.015]" : ""}`}>
      <button className="w-full flex items-center gap-4 px-5 text-left group" onClick={() => setOpen(!open)}
        style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}>
        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${
          open ? "border-white/25 bg-white/10" : "border-white/[0.07] bg-white/[0.03]"
        }`}>
          <Plus className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-45 text-white" : "text-white/30"}`} />
        </div>
        <span className={`font-semibold text-[13px] leading-snug transition-colors flex-1 text-left ${open ? "text-white" : "text-white/65 group-hover:text-white/88"}`}>
          {q}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 animate-slide-down" style={{ paddingLeft: "3.25rem" }}>
          <p className="text-[13px] text-white/42 leading-[1.75]">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="text-white">
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs text-white/42 font-semibold mb-8 backdrop-blur-sm">
            <HelpCircle className="w-3.5 h-3.5" /> Got questions? We've got answers
          </div>
          <h1 className="page-title mb-7">
            Frequently asked<br /><span className="text-gradient">questions</span>
          </h1>
          <p className="text-lg text-white/38 max-w-xl mx-auto leading-7">
            Everything you need to know about Chiku, organized by topic.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 max-w-3xl mx-auto space-y-5">
        {FAQS.map(({ category, items }) => (
          <div key={category}>
            <p className="section-label mb-3 px-1">{category}</p>
            <div className="glass-card overflow-hidden">
              {items.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
            </div>
          </div>
        ))}

        <div className="glass-card-elevated p-8 text-center relative overflow-hidden inner-glow-top">
          <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-5 h-5 text-white/40" />
            </div>
            <h3 className="font-black text-lg mb-2">Still have questions?</h3>
            <p className="text-[13px] text-white/38 mb-6 leading-6 max-w-xs mx-auto">
              The ApeX Development team is ready to help you in the Discord support server.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
                className="btn-primary text-sm">Join Support Server</a>
              <Link href="/contact" className="btn-outline text-sm">Send us a message</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
