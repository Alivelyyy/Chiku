"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, Plus, Loader2, Music2, X, Clock, Check, Sparkles } from "lucide-react";
import type { Track } from "@/lib/types";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m >= 60) return `${Math.floor(m/60)}h ${m%60}m`;
  return `${m}:${(s%60).toString().padStart(2,"0")}`;
}

export default function SearchBar({ guildId, onAdded }: { guildId: string; onAdded?: () => void }) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding]     = useState<string|null>(null);
  const [addedUri, setAddedUri] = useState<string|null>(null);
  const [error, setError]       = useState<string|null>(null);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true); setError(null);
    try {
      const res  = await fetch(`/api/proxy/guilds/${guildId}/player/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.tracks ?? []);
    } catch (e: any) { setError(e.message); setResults([]); }
    finally { setSearching(false); }
  }, [guildId]);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => search(val), 220);
  };

  const addTrack = useCallback(async (track: Track) => {
    setAdding(track.uri); setError(null); setSuccessMsg(null);
    try {
      const res  = await fetch(`/api/proxy/guilds/${guildId}/player/play`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ query: track.uri, best: track }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setAddedUri(track.uri);
      setSuccessMsg(`Added "${track.title}" to queue`);
      setTimeout(() => { setAddedUri(null); setSuccessMsg(null); }, 3000);
      onAdded?.();
    } catch (e: any) { setError(e.message); }
    finally { setAdding(null); }
  }, [guildId, onAdded]);

  const clear = () => { setQuery(""); setResults([]); setError(null); };

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-white/35" />
          </div>
          <div>
            <p className="section-label mb-0.5">Add to Queue</p>
            <h3 className="font-bold text-white text-sm leading-none">Search music</h3>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["YouTube","Spotify","SoundCloud","URL"].map(src => (
            <span key={src} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.05] text-white/35 border border-white/[0.08]">
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="relative group">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 group-focus-within:text-white/40 transition-colors" />
        <input value={query} onChange={e => handleInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && query.trim()) search(query); }}
          placeholder="Search by song, artist, or paste a URL…"
          className="input !pl-10 !pr-10 focus:border-white/20 focus:bg-white/[0.06]" />
        {searching && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/30" />}
        {!searching && query && (
          <button onClick={clear} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors hover:bg-white/[0.05] p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-green-500/20 bg-green-500/[0.08] text-xs text-green-400/90 animate-pulse">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] text-xs text-red-400/90">
          <Music2 className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-white/35 font-semibold px-2 uppercase tracking-wider">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto -mx-1 px-1">
            {results.map((track, idx) => {
              const isAdded  = addedUri === track.uri;
              const isAdding = adding   === track.uri;
              return (
                <div key={track.uri}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-all hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-md">
                  <span className="text-[11px] text-white/20 font-mono w-4 text-center flex-shrink-0 font-bold">{idx+1}</span>
                  {track.thumbnail ? (
                    <Image src={track.thumbnail} alt={track.title} width={40} height={40}
                      className="h-10 w-10 rounded-xl object-cover flex-shrink-0 border border-white/[0.08]" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                      <Music2 className="h-4 w-4 text-white/18" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white/85 group-hover:text-white transition-colors">{track.title}</p>
                    <p className="truncate text-[11px] text-white/35">{track.author}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-white/25">
                      <Clock className="h-2.5 w-2.5" />
                      {track.isStream ? "LIVE" : fmt(track.length)}
                    </span>
                    <button onClick={() => addTrack(track)} disabled={isAdding||isAdded}
                      title={isAdded ? "Added to queue" : "Add to queue"}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all font-medium ${
                        isAdded
                          ? "border-white/30 bg-white/[0.12] text-white/70 cursor-default"
                          : isAdding
                          ? "border-white/20 bg-white/[0.08] text-white/50"
                          : "border-white/[0.08] bg-white/[0.03] text-white/35 hover:border-white/20 hover:bg-white/[0.10] hover:text-white/80"
                      }`}>
                      {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                        : isAdded ? <Check className="h-3.5 w-3.5"/>
                        : <Plus className="h-3.5 w-3.5"/>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!searching && query.trim() && results.length===0 && !error && (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mx-auto mb-3">
            <Music2 className="w-5 h-5 text-white/15" />
          </div>
          <p className="text-sm text-white/40 font-semibold">No results found</p>
          <p className="text-xs text-white/25 mt-1.5 max-w-xs mx-auto">Try searching for a different song, artist, or paste a direct URL</p>
        </div>
      )}
    </div>
  );
}
