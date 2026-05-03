import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { botApi } from "@/lib/api";
import SettingsForm from "@/components/SettingsForm";
import Link from "next/link";
import { ChevronLeft, SlidersHorizontal, Wifi } from "lucide-react";
import type { SettingsData } from "@/lib/types";

interface SettingsPageProps {
  params: { guildId: string };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let data: SettingsData | null = null;
  let botOffline = false;
  try {
    data = (await botApi.settings(params.guildId)) as SettingsData;
  } catch (err: any) {
    botOffline = true;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-white/30">
        <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Servers
        </Link>
        <span>/</span>
        <Link href={`/dashboard/${params.guildId}`}
          className="hover:text-white transition-colors">
          Player
        </Link>
        <span>/</span>
        <span className="text-white/50">Settings</span>
      </div>

      {botOffline ? (
        <div className="glass-card border border-red-500/20 bg-red-500/5 p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-lg text-red-400">Bot Offline</h2>
            <p className="text-[13px] text-red-300/70 mt-0.5">
              Chiku is currently offline. Server settings are unavailable. Please try again in a moment.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl border border-white/[0.07] bg-white/[0.04]
                            flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">Server Settings</h1>
              <p className="text-[13px] text-white/35 mt-0.5">
                Configure Chiku's behavior for this server.
              </p>
            </div>
          </div>

          {/* Settings form */}
          {data ? (
            <div className="glass-card p-6">
              <SettingsForm guildId={params.guildId} initial={data} />
            </div>
          ) : (
            <div className="glass-card border border-yellow-500/20 bg-yellow-500/5 p-6">
              <p className="text-yellow-400/80 text-[13px] font-semibold">Unable to load settings</p>
              <p className="text-yellow-300/60 text-[12px] mt-1">Settings data could not be retrieved. Try refreshing the page.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
