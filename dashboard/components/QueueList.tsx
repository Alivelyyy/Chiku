"use client";
import { useState, useCallback } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Trash2, Shuffle, X, Music2, Loader2, Clock, ArrowUpToLine, ListMusic } from "lucide-react";
import type { Track } from "@/lib/types";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m%60}m`;
  return `${m}:${(s%60).toString().padStart(2,"0")}`;
}

function totalDuration(tracks: Track[]) {
  const ms = tracks.reduce((a, t) => a + (t.isStream ? 0 : t.length), 0);
  const s  = Math.floor(ms/1000), m = Math.floor(s/60), h = Math.floor(m/60);
  if (h>0) return `${h}h ${m%60}m`;
  if (m>0) return `${m}m`;
  return `${s}s`;
}

async function fetcher(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
}

export default function QueueList({ guildId }: { guildId: string }) {
  const { data, mutate, isLoading } = useSWR<{ tracks: Track[]; total: number }>(
    `/api/proxy/guilds/${guildId}/queue`, fetcher,
    { refreshInterval: 5000, revalidateOnFocus: false }
  );
  const [removing, setRemoving]   = useState<number|null>(null);
  const [movingNext, setMovingNext] = useState<number|null>(null);
  const [acting, setActing]       = useState<string|null>(null);

  const remove = useCallback(async (i: number) => {
    setRemoving(i);
    try { await fetch(`/api/proxy/guilds/${guildId}/queue/${i}`, { method:"DELETE" }); await mutate(); }
    finally { setRemoving(null); }
  }, [guildId, mutate]);

  const playNext = useCallback(async (i: number) => {
    setMovingNext(i);
    try {
      await fetch(`/api/proxy/guilds/${guildId}/queue/move`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ from: i, to: 0 }),
      });
      await mutate();
    } finally { setMovingNext(null); }
  }, [guildId, mutate]);

  const queueAction = useCallback(async (act: string) => {
    setActing(act);
    try { await fetch(`/api/proxy/guilds/${guildId}/queue/${act}`, { method:"POST" }); await mutate(); }
    finally { setActing(null); }
  }, [guildId, mutate]);

  if (isLoading) return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 shimmer rounded-lg" />
        <div className="flex gap-2"><div className="h-7 w-16 shimmer rounded-lg"/><div className="h-7 w-12 shimmer rounded-lg"/></div>
      </div>
      {[...Array(4)].map((_,i) => (
        <div key={i} className="flex gap-3 items-center">
          <div className="w-4 h-3 shimmer rounded flex-shrink-0" />
          <div className="w-9 h-9 shimmer rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 shimmer rounded-lg w-4/5" />
            <div className="h-2.5 shimmer rounded-lg w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );

  const tracks = data?.tracks ?? [];

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
            <ListMusic className="w-3.5 h-3.5 text-white/35" />
          </div>
          <div>
            <p className="section-label mb-0.5">Now Playing</p>
            <h3 className="font-bold text-white text-sm leading-none">Queue</h3>
            {tracks.length > 0 && (
              <p className="text-[10px] text-white/30 mt-1">{tracks.length} track{tracks.length !== 1 ? "s" : ""} • {totalDuration(tracks)}</p>
            )}
          </div>
        </div>
        {tracks.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => queueAction("shuffle")} disabled={!!acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-[11px] font-semibold text-white/40 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.04] transition-all disabled:opacity-50">
              {acting==="shuffle" ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Shuffle className="w-3.5 h-3.5"/>}
              Shuffle
            </button>
            <button onClick={() => queueAction("clear")} disabled={!!acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-[11px] font-semibold text-red-400/60 hover:text-red-400/90 hover:border-red-500/30 hover:bg-red-500/[0.08] transition-all disabled:opacity-50">
              {acting==="clear" ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <X className="w-3.5 h-3.5"/>}
              Clear
            </button>
          </div>
        )}
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white/15" />
          </div>
          <div>
            <p className="text-sm text-white/40 font-semibold">Queue is empty</p>
            <p className="text-xs text-white/22 mt-1">Search above or use{" "}
              <code className="bg-white/[0.05] border border-white/[0.07] px-1.5 py-0.5 rounded-md text-white/38 text-[10px] font-mono">!play</code>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-0.5 max-h-[420px] overflow-y-auto -mx-1 px-1">
          {tracks.map((track, i) => (
            <div key={`${track.uri}-${i}`}
              className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group">
              <span className="w-4 text-center text-[11px] text-white/18 flex-shrink-0 font-mono tabular-nums">{i+1}</span>
              {track.thumbnail ? (
                <Image src={track.thumbnail} alt={track.title} width={36} height={36}
                  className="rounded-xl object-cover flex-shrink-0 w-9 h-9" />
              ) : (
                <div className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-3.5 h-3.5 text-white/18" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <a href={track.uri} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors line-clamp-1 block">
                  {track.title}
                </a>
                <p className="text-[11px] text-white/28 truncate">{track.author}</p>
              </div>
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <span className="hidden sm:flex items-center gap-0.5 text-[10px] text-white/18 font-mono">
                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                  {track.isStream ? "LIVE" : fmt(track.length)}
                </span>
                {i>0 && (
                  <button onClick={() => playNext(i)} disabled={movingNext===i} title="Play next"
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-white/22 hover:text-white/65 hover:bg-white/[0.07] transition-all">
                    {movingNext===i ? <Loader2 className="w-3 h-3 animate-spin"/> : <ArrowUpToLine className="w-3 h-3"/>}
                  </button>
                )}
                <button onClick={() => remove(i)} disabled={removing===i} title="Remove"
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-white/22 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  {removing===i ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
