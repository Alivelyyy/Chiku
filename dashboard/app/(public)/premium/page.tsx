import { Check, Sparkles, Crown, Star, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

const FREE_FEATURES = [
  "80+ commands",
  "YouTube, Spotify, SoundCloud & more",
  "6 audio filters",
  "Full queue management",
  "Autoplay & 24/7 mode",
  "Web dashboard access",
  "Basic playlist support",
  "Standard audio quality",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Volume up to 200%",
  "Priority queue position",
  "Unlimited playlists",
  "Advanced equalizer (per-band)",
  "Exclusive premium filters",
  "Synced lyrics",
  "Priority customer support",
  "Early access to new features",
  "Premium badge on profile",
  "Custom bot prefix per server",
  "Multiple DJ roles",
];

const TIERS = [
  {
    name:"Free",    price:"$0",    period:"forever",    featured:false, icon:Star,
    desc:"Everything you need to get started with zero cost.",
    features: FREE_FEATURES,
    cta:"Get started",
    href:"https://discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8",
    external: true,
  },
  {
    name:"Premium", price:"$4.99", period:"per month",  featured:true,  icon:Crown,
    desc:"Unlock the full power of Chiku for yourself.",
    features: PREMIUM_FEATURES,
    cta:"Get Premium",
    href:"/login",
    external: false,
  },
  {
    name:"Server",  price:"$9.99", period:"per month",  featured:false, icon:Sparkles,
    desc:"Premium for your entire server, shared across all members.",
    features:["All Premium features","Covers entire server","Unlimited members benefit","Server-wide premium badge","Dedicated support channel","Custom bot name (on request)"],
    cta:"Contact us",
    href:"/contact",
    external: false,
  },
];

const COMPARISON = [
  { feature:"Commands",          free:"80+",          premium:"80+" },
  { feature:"Audio Quality",     free:"Standard",     premium:"320kbps" },
  { feature:"Volume Limit",      free:"100%",         premium:"200%" },
  { feature:"Playlists",         free:"3 max",        premium:"Unlimited" },
  { feature:"Audio Filters",     free:"6 presets",    premium:"Custom EQ" },
  { feature:"Lyrics",            free:"—",            premium:"Synced" },
  { feature:"Queue Priority",    free:"Normal",       premium:"Priority" },
  { feature:"Support",           free:"Community",    premium:"Priority" },
];

export default function PremiumPage() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs text-white/42 font-semibold mb-8 backdrop-blur-sm">
            <Crown className="w-3.5 h-3.5" /> Upgrade your experience
          </div>
          <h1 className="page-title mb-7">
            Go beyond<br /><span className="text-gradient">with Premium</span>
          </h1>
          <p className="text-lg text-white/38 max-w-xl mx-auto leading-7">
            Chiku's core is free. Premium unlocks the extra mile — more volume, more filters, unlimited playlists, and priority support.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-5 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map(({ name, price, period, desc, features, cta, href, featured, icon:Icon, external }) => (
            <div key={name} className={`tier-card flex flex-col ${featured ? "featured" : ""}`}>
              {featured && (
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              )}
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      featured ? "bg-white text-black" : "border border-white/[0.08] bg-white/[0.04] text-white/45"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-base">{name}</h3>
                  </div>
                  {featured && (
                    <span className="badge-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1">Popular</span>
                  )}
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-sm text-white/35">/{period}</span>
                  </div>
                  <p className="text-[13px] text-white/38 mt-2 leading-5">{desc}</p>
                </div>

                <div className="h-px bg-white/[0.055] mb-5" />

                <ul className="space-y-2.5 flex-1 mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/52">
                      <Check className="w-3.5 h-3.5 text-white/50 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className={`text-center py-3 rounded-xl text-[13px] font-semibold transition-all ${
                      featured
                        ? "bg-white text-black hover:bg-white/90 glow-btn"
                        : "border border-white/[0.10] text-white/55 hover:border-white/22 hover:text-white hover:bg-white/[0.04]"
                    }`}>
                    {cta}
                  </a>
                ) : (
                  <Link href={href}
                    className={`text-center py-3 rounded-xl text-[13px] font-semibold transition-all ${
                      featured
                        ? "bg-white text-black hover:bg-white/90 glow-btn"
                        : "border border-white/[0.10] text-white/55 hover:border-white/22 hover:text-white hover:bg-white/[0.04]"
                    }`}>
                    {cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-5 pb-16 max-w-3xl mx-auto">
        <p className="section-label text-center mb-10">Side-by-side comparison</p>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-3 px-5 py-3.5 border-b border-white/[0.06]">
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Feature</p>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest text-center">Free</p>
            <p className="text-[11px] font-bold text-white/55 uppercase tracking-widest text-center">Premium</p>
          </div>
          {COMPARISON.map(({ feature, free, premium }, i) => (
            <div key={feature}
              className={`grid grid-cols-3 px-5 py-3.5 items-center ${i !== COMPARISON.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
              <p className="text-[13px] text-white/50">{feature}</p>
              <p className="text-[13px] text-white/35 text-center font-mono">{free}</p>
              <p className="text-[13px] text-white font-semibold text-center">{premium}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="px-5 pb-28 max-w-3xl mx-auto">
        <div className="glass-card-elevated p-8 text-center relative overflow-hidden inner-glow-top">
          <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <Zap className="w-5 h-5 text-white/45" />
            </div>
            <h3 className="font-black text-xl mb-3">Premium is coming soon</h3>
            <p className="text-[14px] text-white/38 max-w-sm mx-auto leading-6 mb-6">
              Premium features are in development. Join the Discord to get notified when it launches and secure early-bird pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
                className="btn-primary text-sm gap-2">
                Join Discord <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link href="/contact" className="btn-outline text-sm">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
