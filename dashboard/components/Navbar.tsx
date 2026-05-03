"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutGrid, Music2, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-3.5 pb-1">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-12 px-4 rounded-2xl glass-nav border border-white/[0.07]">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-white/10 shadow-sm">
            <Music2 className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-black text-sm tracking-tight">Chiku</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="btn-ghost !text-xs !px-3 !py-1.5 gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" /> Servers
          </Link>

          {session && (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/[0.07]">
                {(session.user as any)?.image && (
                  <Image src={(session.user as any).image} alt="avatar" width={22} height={22}
                    className="rounded-full" />
                )}
                <span className="text-xs hidden sm:block max-w-[100px] truncate">{session.user?.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-white/[0.09] p-1.5 z-50 animate-slide-down"
                  style={{ background: "rgba(12,12,12,0.97)", backdropFilter: "blur(24px)" }}>
                  <button onClick={() => { setDropOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
