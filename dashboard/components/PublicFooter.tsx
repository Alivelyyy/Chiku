import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ExternalLink } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Features",  href: "/features"  },
    { label: "Commands",  href: "/commands"  },
    { label: "Premium",   href: "/premium"   },
    { label: "Dashboard", href: "/login"     },
  ],
  Resources: [
    { label: "About",    href: "/about"   },
    { label: "FAQ",      href: "/faq"     },
    { label: "Contact",  href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms"   },
  ],
};

const BOT_ID = "1500425524009500802";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.055] bg-[#070707]">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                <Image src="/chiku.png" alt="Chiku" width={32} height={32} className="w-full h-full object-cover rounded-xl" />
              </div>
              <span className="font-black text-sm tracking-tight">Chiku</span>
            </Link>
            <p className="text-[13px] text-white/32 leading-6 max-w-[200px] mb-5">
              Premium Discord music bot for every community. Built with care by ApeX Development.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: MessageCircle, href: "https://discord.gg/q2jzjfYUJW", label: "Discord" },
                {
                  icon: ExternalLink,
                  href: `https://top.gg/bot/${BOT_ID}`,
                  label: "top.gg",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.025] flex items-center justify-center text-white/35
                             hover:text-white hover:border-white/15 hover:bg-white/[0.06] transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="section-label mb-4">{section}</p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-[13px] text-white/35 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <p className="text-[11px] text-white/22">© 2026 ApeX Development. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-white/22 hover:text-white/45 transition-colors">
              Support Server
            </a>
            <span className="text-[11px] text-white/12">·</span>
            <a href={`https://top.gg/bot/${BOT_ID}`} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-white/22 hover:text-white/45 transition-colors">
              top.gg
            </a>
            <span className="text-[11px] text-white/12">·</span>
            <span className="text-[11px] text-white/22">Crafted by ApeX Dev</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
