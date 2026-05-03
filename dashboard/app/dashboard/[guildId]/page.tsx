"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MiniPlayer from "@/components/MiniPlayer";
import {
  Play, Pause, SkipForward, SkipBack, Repeat, Repeat1, Shuffle,
  Volume2, VolumeX, List, History, Search, Plus, Trash2,
  ChevronLeft, Clock, Music, Loader2, AlertCircle, Settings2,
} from "lucide-react";

interface Track {
  title: string;
  author: string;
  duration: number;
  thumbnail?: string;
  uri?: string;
  requester?: string;
}
interface PlayerState {
  isPlaying: boolean;
  volume: number;
  loop: "none" | "track" | "queue";
  shuffle: boolean;
  current: Track | null;
  position: number;
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function TrackRow({ track, index, onRemove }: { track: Track; index: number; onRemove?: () => void }) {
  return (
    <div className="cmd-row group flex items-center gap-3 px-4 py-2.5">
      <span className="text-[11px] text-white/20 w-5 text-center font-bold shrink-0">{index + 1}</span>
      {track.thumbnail
        ? <img src={track.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        : <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0"><Music className="w-4 h-4 text-white/20" /></div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate text-white/80 group-hover:text-white transition-colors">{track.title}</p>
        <p className="text-[11px] text-white/30 truncate">{track.author}</p>
      </div>
      <span className="text-[11px] text-white/25 shrink-0 tabular-nums">{fmt(track.duration)}</span>
      {onRemove && (
        <button onClick={onRemove} className="btn-icon w-7 h-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function GuildPlayerPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const { data: session } = useSession();

  const [player, setPlayer]     = useState<PlayerState | null>(null);
  const [queue, setQueue]       = useState<Track[]>([]);
  const [history, setHistory]   = useState<Track[]>([]);
  const [tab, setTab]           = useState<"queue" | "history">("queue");
  const [search, setSearch]     = useState("");
  const [results, setResults]   = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [guildName, setGuildName] = useState("");
  const [connected, setConnected] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const api = useCallback(async (path: string, opts?: RequestInit) => {
    const res = await fetch(`/api/proxy/guilds/${guildId}/${path}`, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [guildId]);

  const refresh = useCallback(async () => {
    try {
      const [p, q, h] = await Promise.all([
        api("player").catch(() => null),
        api("queue").catch(() => ({ tracks: [] })),
        api("player/history").catch(() => ({ history: [] })),
      ]);
      if (p?.active) {
        setPlayer({
          isPlaying: p.playing ?? false,
          volume: p.volume ?? 80,
          loop: p.loop ?? "none",
          shuffle: false,
          current: p.currentTrack ? {
            title: p.currentTrack.title,
            author: p.currentTrack.author,
            duration: p.currentTrack.length ?? 0,
            thumbnail: p.currentTrack.thumbnail,
          } : null,
          position: p.position ?? 0,
        });
        setPosition(p.position ?? 0);
        setConnected(true);
        setError(null);
      } else {
        setConnected(false);
        setPlayer(null);
        setError(null);
      }
      setQueue((q?.tracks ?? []).map((t: any) => ({
        title: t.title || "Unknown",
        author: t.author || "Unknown",
        duration: t.length || 0,
        thumbnail: t.thumbnail || null,
        uri: t.uri,
        requester: t.requester,
      })));
      setHistory((h?.history ?? []).map((t: any) => ({
        title: t.title || "Unknown",
        author: t.author || "Unknown",
        duration: t.length || 0,
        thumbnail: t.thumbnail || null,
        uri: t.uri,
        requester: t.requester,
      })));
      setLoading(false);
    } catch (err: any) {
      setConnected(false);
      setPlayer(null);
      setError("Bot offline. Waiting for reconnection...");
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 2000);
    const guilds = (session as any)?.guilds ?? [];
    const found  = guilds.find((g: any) => g.id === guildId);
    if (found) setGuildName(found.name);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [refresh, guildId, session]);

  useEffect(() => {
    if (!player?.isPlaying || !player.current) return;
    const t = setInterval(() => setPosition(p => p + 1000), 1000);
    return () => clearInterval(t);
  }, [player?.isPlaying, player?.current?.title]);

  const ctrl = async (action: string, method = "POST", body?: object) => {
    try {
      await fetch(`/api/proxy/guilds/${guildId}/player/${action}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      setTimeout(refresh, 500);
    } catch { /* ignore */ }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!val.trim()) { setResults([]); return; }
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api(`player/search?q=${encodeURIComponent(val)}`);
        const tracks = (data.tracks ?? []).map((t: any) => ({
          title: t.title || "Unknown",
          author: t.author || "Unknown",
          duration: t.length || 0,
          thumbnail: t.thumbnail || null,
          uri: t.uri,
          requester: t.requester,
        }));
        setResults(tracks);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
  };

  const addToQueue = async (track: Track) => {
    try {
      await fetch(`/api/proxy/guilds/${guildId}/player/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: track.title, best: track }),
      });
      setSearch(""); setResults([]);
      setTimeout(refresh, 500);
    } catch { /* ignore */ }
  };

  const progress = player?.current ? Math.min((position / player.current.duration) * 100, 100) : 0;

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-white/30">
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Servers
          </Link>
          <span>/</span>
          <span className="text-white/50 truncate">{guildName || guildId}</span>
        </div>
        <div className="flex items-center gap-2">
          <MiniPlayer guildId={guildId} />
          <Link href={`/dashboard/${guildId}/settings`}
            className="btn-icon flex gap-1.5 px-3 w-auto text-[11px] font-bold">
            <Settings2 className="w-3.5 h-3.5" /> Settings
          </Link>
        </div>
      </div>

      {/* Connection status */}
      {!connected && (
        <div className="glass-card border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500/70 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-red-400/80 text-[12px] font-semibold">Bot offline</p>
            <p className="text-red-300/60 text-[11px] mt-0.5">Make sure the bot is running. Waiting for reconnection...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

        {/* ── Left ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Now Playing card */}
          <div className="glass-card-elevated p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                {player?.current?.thumbnail
                  ? <img src={player.current.thumbnail} alt=""
                      className="w-[88px] h-[88px] rounded-2xl object-cover" />
                  : <div className="w-[88px] h-[88px] rounded-2xl bg-white/[0.04] border border-white/[0.07]
                                    flex items-center justify-center">
                      <Music className="w-8 h-8 text-white/15" />
                    </div>
                }
                {player?.isPlaying && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-white
                                  flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1.5">
                  {player?.isPlaying ? "Now Playing" : player?.current ? "Paused" : "Idle"}
                </p>
                <p className="font-black text-lg leading-tight truncate">
                  {player?.current?.title ?? "Nothing playing"}
                </p>
                <p className="text-[13px] text-white/40 mt-0.5 truncate">
                  {player?.current?.author ?? "Add a song to get started"}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {player?.loop !== "none" && (
                    <span className="badge-active text-[10px]">
                      {player?.loop === "track" ? "Loop: Track" : "Loop: Queue"}
                    </span>
                  )}
                  {player?.shuffle && <span className="badge-active text-[10px]">Shuffle</span>}
                  {player?.current?.requester && (
                    <span className="badge-muted text-[10px]">via {player.current.requester}</span>
                  )}
                </div>
              </div>
            </div>

            {/* progress */}
            <div className="space-y-2">
              <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/25 tabular-nums">
                <span>{fmt(position)}</span>
                <span>{player?.current ? fmt(player.current.duration) : "0:00"}</span>
              </div>
            </div>

            {/* controls */}
            <div className="flex items-center justify-between opacity-50 pointer-events-none" style={{opacity: connected ? 1 : 0.5, pointerEvents: connected ? "auto" : "none"}}>
              <div className="flex items-center gap-1.5">
                <button onClick={() => ctrl("shuffle")}
                  className={`btn-icon ${player?.shuffle ? "text-white border-white/15" : ""}`}>
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => ctrl(`loop/${player?.loop === "none" ? "track" : player?.loop === "track" ? "queue" : "none"}`)}
                  className={`btn-icon ${player?.loop !== "none" ? "text-white border-white/15" : ""}`}>
                  {player?.loop === "track" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => ctrl("previous")} className="btn-icon">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => ctrl(player?.isPlaying ? "pause" : "resume")}
                  className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center
                             hover:bg-white/90 transition-all active:scale-95 shadow-lg">
                  {player?.isPlaying
                    ? <Pause className="w-5 h-5" />
                    : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button onClick={() => ctrl("skip")} className="btn-icon">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => ctrl(`volume/${player?.volume === 0 ? 80 : 0}`)}
                  className="btn-icon">
                  {player?.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input type="range" min="0" max="100" value={player?.volume ?? 80}
                  onChange={e => ctrl(`volume/${e.target.value}`)}
                  className="w-20 accent-white h-1 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Search / add to queue */}
          <div className="glass-card p-5 space-y-4">
            <p className="section-label">Add to queue</p>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                 text-white/25 pointer-events-none" />
              <input type="text" value={search}
                placeholder="Search songs, artists, or paste a URL…"
                onChange={e => handleSearch(e.target.value)}
                className="input pl-10" />
              {searching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                    text-white/25 animate-spin" />
              )}
            </div>
            {results.length > 0 && (
              <div className="space-y-0.5">
                {results.map((t, i) => (
                  <div key={i}
                    className="cmd-row group flex items-center gap-3 px-3 py-2 cursor-pointer"
                    onClick={() => addToQueue(t)}>
                    {t.thumbnail
                      ? <img src={t.thumbnail} alt=""
                          className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      : <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center
                                        justify-center shrink-0">
                          <Music className="w-3.5 h-3.5 text-white/20" />
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate text-white/80
                                   group-hover:text-white transition-colors">{t.title}</p>
                      <p className="text-[11px] text-white/30 truncate">{t.author}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-white/25 tabular-nums">{fmt(t.duration)}</span>
                      <div className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Queue / History ─────────────────────────── */}
        <div className="glass-card overflow-hidden flex flex-col"
          style={{ minHeight: 400, maxHeight: 720 }}>
          <div className="flex border-b border-white/[0.055] shrink-0">
            {(["queue", "history"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest
                            flex items-center justify-center gap-1.5 transition-colors
                            ${tab === t
                              ? "text-white border-b-2 border-white"
                              : "text-white/25 hover:text-white/50"}`}>
                {t === "queue" ? <List className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
                {t}
                {t === "queue" && queue.length > 0 && (
                  <span className="badge-dot ml-1">{queue.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1">
            {tab === "queue" && (
              queue.length === 0
                ? <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
                    <List className="w-8 h-8 text-white/10" />
                    <p className="text-[13px] text-white/25">Queue is empty</p>
                  </div>
                : <div className="py-2">
                    {queue.map((t, i) => (
                      <TrackRow key={i} track={t} index={i}
                        onRemove={() => {
                          fetch(`/api/proxy/guilds/${guildId}/queue/${i}`, { method: "DELETE" });
                          setTimeout(refresh, 300);
                        }} />
                    ))}
                  </div>
            )}
            {tab === "history" && (
              history.length === 0
                ? <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
                    <Clock className="w-8 h-8 text-white/10" />
                    <p className="text-[13px] text-white/25">No history yet</p>
                  </div>
                : <div className="py-2">
                    {history.map((t, i) => <TrackRow key={i} track={t} index={i} />)}
                  </div>
            )}
          </div>

          {queue.length > 0 && (
            <div className="border-t border-white/[0.055] px-4 py-3 shrink-0">
              <button onClick={() => {
                fetch(`/api/proxy/guilds/${guildId}/queue`, { method: "DELETE" });
                setTimeout(refresh, 300);
              }}
                className="btn-danger w-full text-[11px] py-2">
                <Trash2 className="w-3.5 h-3.5" /> Clear queue
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
