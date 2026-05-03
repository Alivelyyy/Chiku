"use client";
import Link from "next/link";
import Image from "next/image";
import { Music2, Plus, ArrowRight } from "lucide-react";
import type { GuildInfo } from "@/lib/types";

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

interface Props { guild: GuildInfo; botPresent: boolean; botInviteUrl: string; }

export default function GuildCard({ guild, botPresent, botInviteUrl }: Props) {
  const iconUrl = guild.icon
    ? guild.icon.startsWith("http") ? guild.icon : `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
    : null;

  const Avatar = () => iconUrl ? (
    <Image src={iconUrl} alt={guild.name} width={48} height={48}
      className="rounded-xl object-cover border border-white/[0.08] w-12 h-12 flex-shrink-0" unoptimized />
  ) : (
    <div className="w-12 h-12 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-sm font-black text-white/40 flex-shrink-0">
      {initials(guild.name)}
    </div>
  );

  if (!botPresent) {
    return (
      <div className="glass-card p-4 flex flex-col h-full transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]">
        <div className="flex items-center gap-3 mb-auto pb-4">
          <Avatar />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{guild.name}</p>
            <p className="text-[11px] text-white/30 mt-0.5">Not connected</p>
          </div>
        </div>
        <a href={`${botInviteUrl}&guild_id=${guild.id}`} target="_blank" rel="noopener noreferrer"
          className="btn-outline !text-xs !py-2 w-full justify-center gap-1.5 mt-2">
          <Plus className="w-3.5 h-3.5" /> Invite Chiku
        </a>
      </div>
    );
  }

  return (
    <Link href={`/dashboard/${guild.id}`}
      className="glass-card p-4 flex flex-col h-full transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.04] hover:-translate-y-0.5 group">
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <Avatar />
          {guild.hasPlayer && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#070707] bg-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-black np-pulse" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate group-hover:text-white transition-colors">{guild.name}</p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium mt-1 ${
            guild.hasPlayer ? "text-white/60" : "text-white/25"
          }`}>
            <Music2 className="w-2.5 h-2.5" />
            {guild.hasPlayer ? "Playing now" : "Idle"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-white/25 pt-2.5 border-t border-white/[0.06]">
        <span>Open dashboard</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
