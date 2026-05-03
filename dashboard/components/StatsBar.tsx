"use client";
import useSWR from "swr";
import { Activity, Users, Server, Cpu, Zap } from "lucide-react";
import type { BotStats } from "@/lib/types";

async function fetcher(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
}

function uptime(sec: number) {
  const d = Math.floor(sec/86400);
  const h = Math.floor((sec%86400)/3600);
  const m = Math.floor((sec%3600)/60);
  if (d>0) return `${d}d ${h}h`;
  if (h>0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StatsBar() {
  const { data } = useSWR<BotStats>("/api/proxy/stats", fetcher, { refreshInterval:15000, revalidateOnFocus:false });
  if (!data) return null;

  const stats = [
    { icon: Zap,      label:"Ping",    value:`${data.ping}ms`           },
    { icon: Activity, label:"Up",      value:uptime(data.uptime)         },
    { icon: Server,   label:"Servers", value:String(data.guilds)         },
    { icon: Users,    label:"Users",   value:data.users.toLocaleString() },
    { icon: Cpu,      label:"RAM",     value:`${data.memory}MB`          },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.07] text-[10px] text-white/30">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 np-pulse" />
        Live
      </div>
      {stats.map(({ icon:Icon, label, value }) => (
        <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.07]">
          <Icon className="w-2.5 h-2.5 text-white/25" />
          <span className="text-[10px] text-white/28">{label}</span>
          <span className="text-[10px] font-semibold text-white/60">{value}</span>
        </div>
      ))}
    </div>
  );
}
