import type { Metadata } from "next";
import { Heart, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Team — Chiku Music Bot",
  description: "Meet the ApeX Development team behind Chiku, the powerful Discord music bot.",
  alternates: { canonical: "/team" },
};

const TEAM = [
  {
    name: "ApeX Dev",
    role: "Founder & Lead Developer",
    initials: "AX",
    bio: "Full-stack developer and music enthusiast. Built Chiku from the ground up as a passion project that grew into a production-ready bot.",
  },
];

const ROLES = [
  { title: "Bot Developer",       desc: "Work on commands, audio engine, and bot logic improvements.",       open: true  },
  { title: "Frontend Developer",  desc: "Build and improve the Next.js dashboard interface.",                open: true  },
  { title: "Designer",            desc: "Design UI components, icons, and branding assets.",                 open: false },
  { title: "Community Manager",   desc: "Moderate the Discord server and help community members.",           open: true  },
];

export default function TeamPage() {
  return (
    <div className="text-white">
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs text-white/42 font-semibold mb-8 backdrop-blur-sm">
            <Heart className="w-3.5 h-3.5" /> Built with passion
          </div>
          <h1 className="page-title mb-7">
            Meet the<br /><span className="text-gradient">team</span>
          </h1>
          <p className="text-lg text-white/38 max-w-xl mx-auto leading-7">
            Chiku is built and maintained by the ApeX Development team — a group of passionate developers dedicated to the best Discord music experience.
          </p>
        </div>
      </section>

      {/* Team cards */}
      <section className="px-5 pb-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEAM.map(({ name, role, initials, bio }) => (
            <div key={name} className="glass-card feature-card p-7">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg font-black text-white/38 flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <h3 className="font-black text-[15px]">{name}</h3>
                  <p className="text-xs text-white/32 mt-0.5">{role}</p>
                </div>
              </div>
              <p className="text-[13px] text-white/42 leading-[1.7] mb-5">{bio}</p>
              <div className="flex items-center gap-2">
                <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
                  className="btn-icon !w-8 !h-8 !rounded-lg">
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}

          {/* Community card */}
          <div className="glass-card feature-card p-7">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg font-black text-white/38 flex-shrink-0">
                ♥
              </div>
              <div>
                <h3 className="font-black text-[15px]">Community</h3>
                <p className="text-xs text-white/32 mt-0.5">Supporters & Voters</p>
              </div>
            </div>
            <p className="text-[13px] text-white/42 leading-[1.7] mb-5">
              Everyone who has voted for Chiku on top.gg, submitted feedback, or spread the word. You make Chiku better.
            </p>
            <a href="https://top.gg/bot/1500425524009500802/vote" target="_blank" rel="noopener noreferrer"
              className="btn-outline !text-xs !py-1.5 !px-3.5 inline-flex gap-1.5">
              Vote on top.gg <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="px-5 pb-16 max-w-3xl mx-auto">
        <p className="section-label text-center mb-3">Join the team</p>
        <h2 className="text-2xl font-black text-center mb-10 tracking-tight">Open positions</h2>
        <div className="glass-card overflow-hidden">
          {ROLES.map(({ title, desc, open }, i) => (
            <div key={title}
              className={`flex items-center justify-between gap-5 px-5 py-4 ${i !== ROLES.length - 1 ? "border-b border-white/[0.05]" : ""} hover:bg-white/[0.015] transition-colors`}>
              <div className="min-w-0">
                <h3 className="font-semibold text-[13px] mb-0.5">{title}</h3>
                <p className="text-[12px] text-white/35 leading-5">{desc}</p>
              </div>
              {open ? (
                <Link href="/contact" className="btn-outline flex-shrink-0 !text-xs !py-1.5 !px-3.5 gap-1.5">
                  Apply <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <span className="badge-muted text-[10px] flex-shrink-0 font-bold">Closed</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-center mt-7 text-[13px] text-white/30">
          Don't see your role?{" "}
          <Link href="/contact" className="text-white/52 hover:text-white transition-colors">Reach out anyway</Link>
          {" "}— we're always open to passionate people.
        </p>
      </section>

      {/* Discord CTA */}
      <section className="px-5 pb-28 max-w-3xl mx-auto">
        <div className="glass-card-elevated relative overflow-hidden inner-glow-top p-8 text-center">
          <div className="absolute inset-0 bg-radial-glow opacity-35 pointer-events-none" />
          <div className="relative">
            <p className="section-label mb-4">ApeX Development</p>
            <h3 className="font-black text-xl mb-3">Connect with us on Discord</h3>
            <p className="text-[13px] text-white/38 max-w-sm mx-auto leading-6 mb-6">
              Get support, suggest features, and stay up to date with Chiku announcements.
            </p>
            <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
              className="btn-primary gap-2 text-sm">
              <MessageCircle className="w-3.5 h-3.5" /> Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
