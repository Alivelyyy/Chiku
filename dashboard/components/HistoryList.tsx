"use client";
import { useState, useCallback } from "react";
import useSWR from "swr";
import Image from "next/image";
import { History, Music2, Loader2, Clock3, RotateCcw, Check } from "lucide-react";
import type { Track } from "@/lib/types";

function fmt(ms: number) {
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
}

async function fetcher(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  return r.json();
}

export default function HistoryList({ guildId }: { guildId: string }) {
  const { data, isLoading } = useSWR<{ history: Track[] }>(
    `/api/proxy/guilds/${guildId}/player/history`, fetcher,
    { refreshInterval: 10000, revalidateOnFocus: false }
  );
  const [requeuing, setRequeuing]   = useState<string|null>(null);
  const [requeuedUri, setRequeuedUri] = useState<string|null>(null);

  const requeue = useCallback(async (track: Track) => {
    setRequeuing(track.uri);
    try {
      await fetch(`/api/proxy/guilds/${guildId}/player/play`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ query: track.uri }),
      });
      setRequeuedUri(track.uri);
      setTimeout(() => setRequeuedUri(null), 2000);
    } catch {}
    finally { setRequeuing(null); }
  }, [guildId]);

  const tracks = data?.history ?? [];

  if (isLoading) return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 shimmer rounded-lg" />
        <div className="h-3 w-12 shimmer rounded-lg" />
      </div>
      {[...Array(3)].map((_,i) => (
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

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
            <History className="w-3.5 h-3.5 text-white/35" />
          </div>
          <div>
            <p className="section-label mb-0.5">Session History</p>
            <h3 className="font-bold text-white text-sm leading-none">Recently Played</h3>
            {tracks.length > 0 && (
              <p className="text-[10px] text-white/30 mt-1">{tracks.length} track{tracks.length !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
            <History className="w-5 h-5 text-white/15" />
          </div>
          <div>
            <p className="text-sm text-white/38 font-medium">No history yet</p>
            <p className="text-xs text-white/20 mt-0.5">Tracks appear here after playing</p>
          </div>
        </div>
      ) : (
        <div className="space-y-0.5 max-h-72 overflow-y-auto -mx-1 px-1">
          {tracks.map((track, i) => {
            const isRequeuing = requeuing  === track.uri;
            const isRequeued  = requeuedUri === track.uri;
            return (
              <div key={`${track.uri}-${i}`}
                className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group">
                <span className="w-4 flex-shrink-0 text-center font-mono text-[11px] text-white/18">{i+1}</span>
                {track.thumbnail ? (
                  <Image src={track.thumbnail} alt={track.title} width={36} height={36}
                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center flex-shrink-0">
                    <Music2 className="h-3.5 w-3.5 text-white/18" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <a href={track.uri} target="_blank" rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-white/65 hover:text-white transition-colors">
                    {track.title}
                  </a>
                  <p className="truncate text-[11px] text-white/28">{track.author}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                  <span className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-white/18">
                    <Clock3 className="h-3 w-3" />
                    {track.isStream ? "LIVE" : fmt(track.length)}
                  </span>
                  <button onClick={() => requeue(track)} disabled={isRequeuing||isRequeued}
                    title="Re-queue"
                    className={`opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                      isRequeued
                        ? "text-white bg-white/10 border border-white/15 opacity-100"
                        : "text-white/22 hover:text-white/65 hover:bg-white/[0.07]"
                    }`}>
                    {isRequeuing ? <Loader2 className="w-3 h-3 animate-spin"/>
                      : isRequeued ? <Check className="w-3 h-3"/>
                      : <RotateCcw className="w-3 h-3"/>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
