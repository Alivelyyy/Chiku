"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2,
} from "lucide-react";

interface Track {
  title: string;
  author: string;
  length: number;
  thumbnail?: string;
  sourceName?: string;
  requester?: string;
}

interface PlayerState {
  active?: boolean;
  playing?: boolean;
  paused?: boolean;
  volume?: number;
  position?: number;
  currentTrack?: Track | null;
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function PopupPlayerPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const api = useCallback(async (path: string) => {
    const res = await fetch(`/api/proxy/guilds/${guildId}/${path}`);
    if (!res.ok) throw new Error();
    return res.json();
  }, [guildId]);

  const refresh = useCallback(async () => {
    try {
      const p = await api("player");
      if (p) {
        setPlayer(p);
        setPosition(p.position ?? 0);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [refresh]);

  useEffect(() => {
    if (!player?.playing) return;
    const t = setInterval(() => setPosition(p => p + 1000), 1000);
    return () => clearInterval(t);
  }, [player?.playing]);

  const ctrl = async (action: string, method = "POST") => {
    try {
      await fetch(`/api/proxy/guilds/${guildId}/player/${action}`, { method });
      setTimeout(refresh, 300);
    } catch { /* ignore */ }
  };

  const currentTrack = player?.currentTrack;
  const progress = currentTrack ? Math.min((position / (currentTrack.length ?? 1)) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#070707] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="w-screen h-screen bg-[#070707] flex items-center justify-center">
        <p className="text-white/40">Player not available</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#070707] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#070707] border border-white/[0.1] rounded-3xl
                      shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Track info */}
        <div className="p-6 space-y-4">
          {currentTrack?.thumbnail ? (
            <img src={currentTrack.thumbnail} alt=""
              className="w-full h-48 rounded-2xl object-cover" />
          ) : (
            <div className="w-full h-48 rounded-2xl bg-white/[0.05] border border-white/[0.07]
                            flex items-center justify-center">
              <svg className="w-12 h-12 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-black text-lg leading-tight truncate text-white">
              {currentTrack?.title ?? "Nothing"}
            </p>
            <p className="text-sm text-white/40 truncate mt-1">
              {currentTrack?.author ?? "—"}
            </p>
            {currentTrack?.sourceName && (
              <p className="text-xs text-white/25 mt-1">{currentTrack.sourceName}</p>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2 pt-2">
            <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/25 tabular-nums">
              <span>{fmt(position)}</span>
              <span>{currentTrack ? fmt(currentTrack.length ?? 0) : "0:00"}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button onClick={() => ctrl("previous")}
              className="btn-icon w-10 h-10">
              <SkipBack className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => ctrl(player.playing ? "pause" : "resume")}
              className="flex-1 h-14 rounded-2xl bg-white text-black flex items-center justify-center
                         hover:bg-white/90 transition-all active:scale-95 font-bold">
              {player.playing
                ? <Pause className="w-6 h-6" />
                : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button onClick={() => ctrl("skip")}
              className="btn-icon w-10 h-10">
              <SkipForward className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => ctrl(`volume/${(player.volume ?? 80) === 0 ? 80 : 0}`)}
              className="btn-icon w-9 h-9 flex-shrink-0">
              {(player.volume ?? 80) === 0 ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>
            <input type="range" min="0" max="100" value={player.volume ?? 80}
              onChange={e => ctrl(`volume/${e.target.value}`)}
              className="flex-1 h-1 accent-white cursor-pointer" />
            <span className="text-xs text-white/25 w-6 text-right">{player.volume ?? 80}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
