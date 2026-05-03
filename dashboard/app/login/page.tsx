"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Music2, Shield, Zap, Server } from "lucide-react";
import Link from "next/link";

const DiscordIcon = () => (
  <svg width="18" height="14" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070707]">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />
      {/* Soft orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center glow-btn group-hover:scale-105 transition-transform">
              <Music2 className="w-7 h-7 text-black" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Welcome to Chiku</h1>
              <p className="text-white/32 text-[13px] mt-1">Sign in to manage your servers</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card-elevated relative overflow-hidden p-7 space-y-5 inner-glow-top">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <div className="relative space-y-5">
            <button
              onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
              className="btn-primary w-full justify-center py-3.5 text-[15px] font-semibold gap-3">
              <DiscordIcon />
              Continue with Discord
            </button>

            <div className="divider" />

            <div className="space-y-3.5">
              {[
                { icon: Shield, text: "Read-only access to your identity and server list" },
                { icon: Zap,    text: "We never post or send messages on your behalf" },
                { icon: Server, text: "Only shows servers where you have Manage Server" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg border border-white/[0.07] bg-white/[0.035] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-2.5 h-2.5 text-white/32" />
                  </div>
                  <p className="text-[12px] text-white/32 leading-5">{text}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-white/18 text-center">
              By signing in you agree to our{" "}
              <Link href="/terms" className="text-white/38 hover:text-white underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-white/38 hover:text-white underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <p className="text-center mt-5 text-xs text-white/18">
          <Link href="/" className="hover:text-white/42 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
