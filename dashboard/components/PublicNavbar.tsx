"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/commands", label: "Commands" },
  { href: "/premium",  label: "Premium"  },
  { href: "/faq",      label: "FAQ"      },
];

const INVITE = "https://discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8";

export default function PublicNavbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3.5">
        <nav className="max-w-6xl mx-auto flex items-center justify-between h-12 px-5 rounded-2xl glass-nav border border-white/[0.065]">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform"
              style={{ width: 28, height: 28 }}>
              <Image src="/chiku.png" alt="Chiku" width={28} height={28} className="w-full h-full object-cover rounded-xl" priority />
            </div>
            <span className="font-black text-[13px] tracking-tight text-white">Chiku</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  path === href
                    ? "text-white bg-white/[0.09]"
                    : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                }`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
              className="btn-ghost !text-[12px] !px-3 !py-1.5">Support</a>
            <a href={INVITE} target="_blank" rel="noopener noreferrer"
              className="btn-outline !text-[12px] !px-3.5 !py-1.5">Invite Bot</a>
            <Link href="/login" className="btn-primary !text-[12px] !px-4 !py-1.5">Dashboard →</Link>
          </div>

          <button className="md:hidden p-2 text-white/45 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-x-4 top-[68px] z-40 rounded-2xl border border-white/[0.07] p-5 animate-slide-down md:hidden"
          style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(40px)" }}>
          <div className="space-y-0.5 mb-5">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  path === href ? "text-white bg-white/[0.09]" : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                }`}>{label}</Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/[0.065]">
            <a href={INVITE} target="_blank" rel="noopener noreferrer"
              className="btn-outline text-xs justify-center">Invite Bot</a>
            <Link href="/login" onClick={() => setOpen(false)} className="btn-primary text-xs justify-center">Dashboard</Link>
          </div>
        </div>
      )}
    </>
  );
}
