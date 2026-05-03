"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import Image from "next/image";
import {
  Pause, Play, SkipForward, SkipBack, Square, Volume2, VolumeX,
  Repeat, Repeat1, RefreshCw, Loader2, ExternalLink, Sparkles,
  Clock4, SlidersHorizontal, Music2, Users, Radio
} from "lucide-react";
import type { PlayerState } from "@/lib/types";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${(m % 60).toString().padStart(2,"0")}:${(s % 60).toString().padStart(2,"0")}`;
  return `${m}:${(s % 60).toString().padStart(2,"0")}`;
}

function sourceLabel(s: string) {
  const map: Record<string,string> = {
    youtube:"YouTube","youtube music":"YT Music",spotify:"Spotify",soundcloud:"SoundCloud",
    twitch:"Twitch",bandcamp:"Bandcamp",vimeo:"Vimeo",deezer:"Deezer",applemusic:"Apple Music",
  };
  return map[(s||"").toLowerCase()] || s || "Audio";
}

async function fetcher(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
}
async function post(url: string, body?: object) {
  return fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body: body ? JSON.stringify(body) : undefined });
}

const EFFECTS = [
  { id:"flat",      label:"Flat"      },
  { id:"bassboost", label:"Bass"      },
  { id:"nightcore", label:"Nightcore" },
  { id:"vaporwave", label:"Vaporwave" },
  { id:"8d",        label:"8D"        },
  { id:"karaoke",   label:"Karaoke"   },
  { id:"soft",      label:"Soft"      },
];

export default function PlayerCard({ guildId }: { guildId: string }) {
  const { data, mutate, isLoading } = useSWR<PlayerState>(
    `/api/proxy/guilds/${guildId}/player`, fetcher,
    { refreshInterval: 4000, revalidateOnFocus: false }
  );

  const [vol, setVol]             = useState<number|null>(null);
  const [pending, setPending]     = useState<string|null>(null);
  const [effectOpen, setEffectOpen] = useState(false);
  const [livePos, setLivePos]     = useState(0);
  const posRef = useRef<{ pos:number; ts:number }|null>(null);

  useEffect(() => {
    if (data?.position !== undefined) {
      posRef.current = { pos: data.position, ts: Date.now() };
      setLivePos(data.position);
    }
  }, [data?.position, data?.currentTrack?.uri]);

  useEffect(() => {
    if (!data?.playing || data?.paused || data?.currentTrack?.isStream) return;
    const id = setInterval(() => {
      if (posRef.current && data?.currentTrack?.length) {
        const elapsed = Date.now() - posRef.current.ts;
        setLivePos(Math.min(posRef.current.pos + elapsed, data.currentTrack.length));
      }
    }, 500);
    return () => clearInterval(id);
  }, [data?.playing, data?.paused, data?.currentTrack?.isStream, data?.currentTrack?.length]);

  const action = useCallback(async (act: string, body?: object) => {
    setPending(act);
    try { await post(`/api/proxy/guilds/${guildId}/player/${act}`, body); await mutate(); }
    finally { setPending(null); }
  }, [guildId, mutate]);

  const handleVolume = useCallback(async (v: number) => {
    setVol(v);
    await post(`/api/proxy/guilds/${guildId}/player/volume`, { volume: v });
  }, [guildId]);

  const cycleLoop = useCallback(() => {
    const modes = ["none","track","queue"] as const;
    action("loop", { mode: modes[(modes.indexOf(data?.loop ?? "none") + 1) % 3] });
  }, [data?.loop, action]);

  const seek = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!data?.currentTrack || data.currentTrack.isStream) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ms   = Math.floor(pct * data.currentTrack.length);
    posRef.current = { pos: ms, ts: Date.now() };
    setLivePos(ms);
    await post(`/api/proxy/guilds/${guildId}/player/seek`, { position: ms });
  }, [data, guildId]);

  /* ── Loading skeleton ── */
  if (isLoading) return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-2xl shimmer flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-4 w-3/4 shimmer rounded-xl" />
          <div className="h-3 w-1/2 shimmer rounded-xl" />
          <div className="h-3 w-1/4 shimmer rounded-xl" />
        </div>
      </div>
      <div className="h-1 shimmer rounded-full" />
      <div className="flex gap-2">{[...Array(5)].map((_,i) => <div key={i} className="w-10 h-10 shimmer rounded-xl" />)}</div>
    </div>
  );

  /* ── Idle state ── */
  if (!data?.active || !data.currentTrack) return (
    <div className="glass-card flex flex-col items-center justify-center py-20 gap-5 text-center p-6">
      <div className="w-20 h-20 rounded-3xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
        <Music2 className="w-9 h-9 text-white/15" />
      </div>
      <div>
        <p className="font-bold text-white text-lg mb-1.5">Nothing playing</p>
        <p className="text-white/35 text-sm leading-6">
          Search below or use{" "}
          <code className="bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded-lg text-white/55 text-[11px] font-mono">!play</code>
          {" "}in Discord
        </p>
      </div>
      <div className="flex gap-2 text-[10px] text-white/20">
        <span className="px-2.5 py-1 rounded-lg border border-white/[0.06]">Autoplay ready</span>
        <span className="px-2.5 py-1 rounded-lg border border-white/[0.06]">80+ commands</span>
      </div>
    </div>
  );

  const { currentTrack: t, playing, paused, volume, loop } = data;
  const progress = t.isStream ? 100 : t.length ? Math.min(100, (livePos / t.length) * 100) : 0;
  const currentVol = vol ?? volume ?? 100;
  const LoopIcon   = loop === "track" ? Repeat1 : Repeat;
  const isPlaying  = playing && !paused;

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="p-6 space-y-5">
        {/* Track info */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {t.thumbnail ? (
              <Image src={t.thumbnail} alt={t.title} width={96} height={96}
                className="w-24 h-24 rounded-2xl object-cover artwork-shadow" />
            ) : (
              <div className="w-24 h-24 rounded-2xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center artwork-shadow">
                <Music2 className="w-9 h-9 text-white/20" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute -bottom-1.5 -right-1.5 flex items-end gap-[2px] h-5 px-2 rounded-lg bg-black/90 border border-white/[0.09]">
                <div className="wf wf-a" /><div className="wf wf-b" />
                <div className="wf wf-c" /><div className="wf wf-d" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <a href={t.uri} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-1.5 mb-1 min-w-0">
              <span className="font-bold text-[15px] leading-snug line-clamp-2 text-white group-hover:text-white/80 transition-colors">{t.title}</span>
              <ExternalLink className="w-3 h-3 text-white/20 opacity-0 group-hover:opacity-100 mt-1 flex-shrink-0 transition-opacity" />
            </a>
            <p className="text-white/40 text-sm truncate mb-2.5">{t.author}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                t.isStream ? "bg-white text-black" :
                isPlaying  ? "bg-white/10 text-white border border-white/15" :
                             "bg-white/[0.05] text-white/45 border border-white/[0.08]"
              }`}>
                {t.isStream ? <><Radio className="w-2.5 h-2.5" />LIVE</> :
                 isPlaying  ? <><span className="w-1.5 h-1.5 rounded-full bg-white np-pulse inline-block" />Playing</> : "Paused"}
              </span>
              {t.sourceName && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.03] text-white/30 border border-white/[0.06]">
                  {sourceLabel(t.sourceName)}
                </span>
              )}
              {(data.listenerCount ?? 0) > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-white/30 border border-white/[0.06] bg-white/[0.03]">
                  <Users className="w-2.5 h-2.5" />{data.listenerCount}
                </span>
              )}
            </div>
            {t.requester && (
              <p className="text-white/20 text-[11px] mt-2">
                Added by <span className="text-white/35">{t.requester}</span>
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="seek-bar" onClick={t.isStream ? undefined : seek}
            style={{ cursor: t.isStream ? "default" : "pointer" }}>
            <div className="seek-bar-track">
              <div className="seek-bar-fill" style={{ width:`${progress}%` }} />
              {!t.isStream && <div className="seek-bar-thumb" style={{ left:`${progress}%` }} />}
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-white/25 font-mono">
            <span>{fmt(livePos)}</span>
            <span>{t.isStream ? "∞ LIVE" : fmt(t.length)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button onClick={() => action("previous")} disabled={!!pending || !data.hasPrevious}
              className="btn-icon disabled:opacity-25">
              {pending==="previous" ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <SkipBack className="w-3.5 h-3.5"/>}
            </button>
            {/* Play/Pause main */}
            <button onClick={() => action(paused ? "resume" : "pause")} disabled={!!pending}
              className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all disabled:opacity-40 glow-btn flex-shrink-0">
              {(pending==="pause"||pending==="resume") ? <Loader2 className="w-4.5 h-4.5 animate-spin"/>
                : paused ? <Play className="w-4.5 h-4.5 ml-0.5"/> : <Pause className="w-4.5 h-4.5"/>}
            </button>
            {/* Skip */}
            <button onClick={() => action("skip")} disabled={!!pending} className="btn-icon">
              {pending==="skip" ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <SkipForward className="w-3.5 h-3.5"/>}
            </button>
            {/* Stop */}
            <button onClick={() => action("stop")} disabled={!!pending}
              className="btn-icon !text-red-400/40 hover:!text-red-400 hover:!border-red-500/25 hover:!bg-red-500/[0.07]">
              {pending==="stop" ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Square className="w-3.5 h-3.5"/>}
            </button>
            {/* Loop */}
            <button onClick={cycleLoop} disabled={!!pending}
              className={`btn-icon ${loop!=="none" ? "!bg-white/10 !border-white/25 !text-white" : ""}`}>
              <LoopIcon className="w-3.5 h-3.5"/>
            </button>
            {/* Refresh */}
            <button onClick={() => mutate()} className="w-7 h-7 flex items-center justify-center text-white/15 hover:text-white/35 transition-colors">
              <RefreshCw className="w-3 h-3"/>
            </button>
          </div>
          {/* Volume */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <button onClick={() => handleVolume(currentVol > 0 ? 0 : volume ?? 80)}
              className="text-white/25 hover:text-white/50 transition-colors flex-shrink-0">
              {currentVol === 0 ? <VolumeX className="w-3.5 h-3.5"/> : <Volume2 className="w-3.5 h-3.5"/>}
            </button>
            <input type="range" min={1} max={200} value={currentVol}
              onChange={(e) => setVol(Number(e.target.value))}
              onMouseUp={(e) => handleVolume(Number((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => handleVolume(Number((e.target as HTMLInputElement).value))}
              className="vol-slider flex-1"/>
            <span className="text-[11px] text-white/25 font-mono w-9 text-right tabular-nums">{currentVol}%</span>
          </div>
        </div>

        {/* Mode toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.05]">
          {[
            { key:"autoplay", label:"Autoplay", icon:Sparkles, active:data.autoplay, act:() => action("autoplay",{enabled:!data.autoplay}) },
            { key:"alwayson", label:"24/7 Mode", icon:Clock4,   active:data.alwaysOn, act:() => action("alwayson",{enabled:!data.alwaysOn}) },
          ].map(({ key, label, icon:Icon, active, act }) => (
            <button key={key} onClick={act} disabled={pending===key}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                active ? "bg-white/[0.07] border-white/[0.16] text-white"
                       : "border-white/[0.06] bg-transparent text-white/30 hover:text-white/55 hover:border-white/[0.10]"
              }`}>
              <span className="flex items-center gap-1.5">
                {pending===key ? <Loader2 className="w-3 h-3 animate-spin"/> : <Icon className="w-3 h-3"/>}
                {label}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                active ? "bg-white text-black" : "bg-white/[0.05] text-white/20"
              }`}>{active?"ON":"OFF"}</span>
            </button>
          ))}
        </div>

        {/* Effects */}
        <div className="pt-1 border-t border-white/[0.05] space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setEffectOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                effectOpen ? "bg-white/[0.07] border-white/15 text-white" : "border-white/[0.07] bg-transparent text-white/30 hover:text-white/55"
              }`}>
              <SlidersHorizontal className="w-3 h-3"/>
              Effects
              {data.effects && data.effects !== "flat" && (
                <span className="bg-white text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ml-0.5">
                  {data.effects}
                </span>
              )}
            </button>
            <div className="ml-auto flex items-center gap-1.5 flex-wrap">
              {data.voiceChannelName && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/[0.06] text-[10px] text-white/25">
                  <Volume2 className="w-2.5 h-2.5"/>{data.voiceChannelName}
                </span>
              )}
              {(data.queueLength ?? 0) > 0 && (
                <span className="px-2.5 py-1.5 rounded-xl border border-white/[0.06] text-[10px] text-white/25">
                  +{data.queueLength} in queue
                </span>
              )}
            </div>
          </div>
          {effectOpen && (
            <div className="flex flex-wrap gap-1.5 animate-slide-down">
              {EFFECTS.map((fx) => (
                <button key={fx.id} onClick={() => action("effects",{effect:fx.id})} disabled={pending==="effects"}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                    data.effects===fx.id
                      ? "bg-white text-black border-white/20"
                      : "border-white/[0.07] text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                  }`}>
                  {pending==="effects" ? <Loader2 className="w-3 h-3 animate-spin inline-block mr-1"/> : null}
                  {fx.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
