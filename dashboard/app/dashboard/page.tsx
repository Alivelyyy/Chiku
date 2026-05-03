import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { botApi } from "@/lib/api";
import GuildCard from "@/components/GuildCard";
import type { DiscordGuild, GuildInfo } from "@/lib/types";
import { AlertCircle, Music2, Server, Zap, Sparkles } from "lucide-react";

const BOT_INVITE = `https://discord.com/oauth2/authorize?client_id=1500425524009500802&scope=bot+applications.commands&permissions=8`;

async function getDiscordGuilds(token: string): Promise<DiscordGuild[]> {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  });
  if (!res.ok) return [];
  const all: DiscordGuild[] = await res.json();
  return all.filter((g) => (BigInt(g.permissions) & BigInt(0x20)) !== BigInt(0));
}

async function getBotGuilds(): Promise<GuildInfo[]> {
  try {
    return (await botApi.guilds()) as GuildInfo[];
  } catch (err: any) {
    console.error("Failed to fetch bot guilds:", err.message);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const token = (session as any).accessToken as string;
  const [userGuilds, botGuilds] = await Promise.all([getDiscordGuilds(token), getBotGuilds()]);

  const botGuildIds = new Set(botGuilds.map((g: GuildInfo) => g.id));
  const botGuildMap = new Map(botGuilds.map((g: GuildInfo) => [g.id, g]));
  const withBot = userGuilds.filter((g) => botGuildIds.has(g.id));
  const withoutBot = userGuilds.filter((g) => !botGuildIds.has(g.id));
  const activePlayers = withBot.filter(g => botGuildMap.get(g.id)?.hasPlayer).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header banner */}
      <section className="relative rounded-3xl border border-white/[0.065] overflow-hidden p-7 sm:p-10"
        style={{ background: "rgba(255,255,255,0.018)" }}>
        <div className="absolute inset-0 bg-grid opacity-80" />
        <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] text-xs text-white/42 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Server dashboard
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gradient-sharp">Your servers</h1>
            <p className="text-white/38 text-[14px] max-w-md leading-6">
              Select a server to open the music dashboard, control playback, and manage settings.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:min-w-[300px]">
            {[
              { icon: Server, label: "Total",     value: userGuilds.length },
              { icon: Music2, label: "Connected", value: withBot.length },
              { icon: Zap,    label: "Active",    value: activePlayers },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/[0.065] bg-black/50 p-4 text-center backdrop-blur-sm">
                <Icon className="w-4 h-4 text-white/25 mx-auto mb-2" />
                <p className="text-2xl font-black">{value}</p>
                <p className="text-[10px] text-white/28 uppercase tracking-widest mt-0.5 font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connected servers */}
      {withBot.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <p className="section-label">Connected servers ({withBot.length})</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {withBot.map((g) => {
              const bot = botGuildMap.get(g.id);
              return (
                <GuildCard key={g.id}
                  guild={{ id: g.id, name: g.name, icon: g.icon, memberCount: 0, hasPlayer: bot?.hasPlayer ?? false, voiceChannel: bot?.voiceChannel ?? null }}
                  botPresent botInviteUrl={BOT_INVITE}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Add Chiku */}
      {withoutBot.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/18" />
            <p className="section-label">Add Chiku ({withoutBot.length})</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {withoutBot.map((g) => (
              <GuildCard key={g.id}
                guild={{ id: g.id, name: g.name, icon: g.icon, memberCount: 0, hasPlayer: false, voiceChannel: null }}
                botPresent={false} botInviteUrl={BOT_INVITE}
              />
            ))}
          </div>
        </section>
      )}

      {userGuilds.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-24 gap-4 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white/25" />
          </div>
          <div>
            <p className="font-bold text-white">No servers found</p>
            <p className="text-white/35 text-[13px] mt-1 leading-5">You need Manage Server permission on at least one Discord server.</p>
          </div>
        </div>
      )}
    </div>
  );
}
