import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle, Heart, Zap, Globe, ArrowRight, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Chiku Music Bot",
  description:
    "Learn about Chiku, the powerful Discord music bot built by ApeX Development. Our story, mission and values.",
  alternates: { canonical: "/about" },
};

const TIMELINE = [
  { year:"2022", title:"Chiku Born",        desc:"Started as an internal tool for a small Discord community. First version ran on discord.js v13." },
  { year:"2023", title:"Public Release",    desc:"Opened to the public. Grew rapidly as word spread through Discord communities." },
  { year:"2024", title:"Major Rewrite",     desc:"Full rewrite with Kazagumo v3 + Lavalink, dramatically improved audio quality and 40+ new commands." },
  { year:"2025", title:"Dashboard Launch",  desc:"Launched the Next.js web dashboard for real-time player control, search, and server management." },
  { year:"2026", title:"Next Chapter",      desc:"Premium tier, expanded platform support, voice analytics, and community playlists on the roadmap." },
];

const VALUES = [
  { icon:Heart,  title:"Community First", desc:"Every feature is driven by user feedback. We listen to what server owners and members actually need." },
  { icon:Shield, title:"Privacy First",   desc:"We collect only what's necessary to run the bot. No selling data, no tracking, no nonsense." },
  { icon:Zap,    title:"Performance",     desc:"We obsess over latency. Audio quality and command speed are never compromised." },
  { icon:Globe,  title:"Accessible",      desc:"The core bot is free. Great music shouldn't require a subscription or account to get started." },
];

export default function AboutPage() {
  return (
    <div className="text-white">
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-8 glow-btn">
            <Image src="/chiku.png" alt="Chiku" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <h1 className="page-title mb-7">
            About <span className="text-gradient">Chiku</span>
          </h1>
          <p className="text-lg text-white/38 max-w-2xl mx-auto leading-7 mb-9">
            A production-ready Discord music bot built by ApeX Development with a passion for great audio, clean code, and an exceptional user experience.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
              className="btn-primary gap-2"><MessageCircle className="w-4 h-4"/>Join Discord</a>
            <a href="https://top.gg/bot/1500425524009500802/vote" target="_blank" rel="noopener noreferrer"
              className="btn-outline gap-2">Vote on top.gg</a>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 max-w-4xl mx-auto">
        <div className="glass-card-elevated p-8 sm:p-14 text-center relative overflow-hidden inner-glow-top">
          <div className="absolute inset-0 bg-radial-glow opacity-35 pointer-events-none" />
          <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
          <div className="relative">
            <p className="section-label mb-7">Our Mission</p>
            <blockquote className="text-2xl sm:text-3xl font-bold leading-[1.35] text-white/88 max-w-2xl mx-auto">
              "To give every Discord community access to the best music experience — reliable, fast, and always improving."
            </blockquote>
            <p className="text-white/25 mt-6 text-sm">— ApeX Development Team</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <p className="section-label text-center mb-12">What we believe in</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map(({ icon:Icon, title, desc }) => (
            <div key={title} className="glass-card feature-card p-6 text-center">
              <div className="w-11 h-11 rounded-xl border border-white/[0.07] bg-white/[0.035] flex items-center justify-center mx-auto mb-5">
                <Icon className="w-5 h-5 text-white/52" />
              </div>
              <h3 className="font-bold mb-2.5 text-[13px]">{title}</h3>
              <p className="text-[13px] text-white/35 leading-[1.65]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-16 max-w-3xl mx-auto">
        <p className="section-label text-center mb-12">Our story</p>
        <div className="relative">
          <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/[0.05] to-transparent hidden sm:block" />
          <div className="space-y-4">
            {TIMELINE.map(({ year, title, desc }) => (
              <div key={year} className="flex gap-8 sm:gap-10">
                <div className="flex-shrink-0 w-14 text-right pt-4">
                  <span className="text-[11px] font-black text-white/28 tabular-nums">{year}</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute -left-[1.75rem] top-4 w-2 h-2 rounded-full border border-white/15 bg-[#070707] hidden sm:block" />
                  <div className="glass-card feature-card p-5">
                    <h3 className="font-bold mb-1.5 text-[13px]">{title}</h3>
                    <p className="text-[13px] text-white/38 leading-[1.65]">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 max-w-3xl mx-auto">
        <div className="glass-card p-7 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div>
            <p className="section-label mb-2">ApeX Development</p>
            <h3 className="font-black text-lg mb-1">Get in touch with us</h3>
            <p className="text-[13px] text-white/38 leading-6">
              Join our Discord server for support, feature requests, and community discussions.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
              className="btn-primary gap-2 text-sm">Join Discord <ArrowRight className="w-3.5 h-3.5"/></a>
          </div>
        </div>
      </section>
    </div>
  );
}
