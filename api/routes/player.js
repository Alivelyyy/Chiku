const { Router } = require("express");
const logger = require("@plugins/logger");
const { updateSettings } = require("@database/guildSettings");

/* ─── Track cache: avoids re-resolving URIs on play ─── */
const _trackCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function _cacheTrack(track) {
  if (!track?.uri) return;
  _trackCache.set(track.uri, { track, exp: Date.now() + CACHE_TTL });
}

function _getCached(uri) {
  const e = _trackCache.get(uri);
  if (!e) return null;
  if (Date.now() > e.exp) { _trackCache.delete(uri); return null; }
  return e.track;
}

function serializeTrack(track) {
  if (!track) return null;
  const req = track.requester;
  return {
    title: track.title,
    author: track.author || "Unknown",
    uri: track.uri,
    length: track.length,
    thumbnail: track.thumbnail || null,
    isStream: track.isStream,
    sourceName: track.sourceName,
    requester: req?.tag || req?.username || (typeof req === "string" ? req : "Unknown"),
    requesterId: req?.id || null,
  };
}

function findExactTrack(result, query) {
  const q = String(query || "").toLowerCase();
  const tracks = result?.tracks ?? [];
  if (!tracks.length) return null;
  return tracks.find((t) => {
    const title = String(t.title || "").toLowerCase();
    const author = String(t.author || "").toLowerCase();
    const uri = String(t.uri || "").toLowerCase();
    return uri === q || title === q || title.includes(q) || q.includes(title) || author.includes(q);
  }) || tracks[0];
}

module.exports = function playerRouter(client) {
  const router = Router({ mergeParams: true });

  router.get("/", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.json({ active: false });

    const guild = client.guilds.cache.get(req.params.guildId);
    const voiceCh = guild?.channels?.cache?.get(player.voiceId);
    const memberCount = voiceCh?.members?.filter(m => !m.user.bot)?.size ?? 0;

    res.json({
      active: true,
      playing: player.playing,
      paused: player.paused,
      volume: player.volume,
      loop: player.loop,
      position: player.shoukaku?.position ?? 0,
      currentTrack: serializeTrack(player.queue.current),
      queueLength: player.queue.length,
      autoplay: player._autoplay || false,
      alwaysOn: player._alwaysOn || false,
      voiceChannelId: player.voiceId,
      voiceChannelName: voiceCh?.name ?? null,
      listenerCount: memberCount,
      textChannelId: player.textId,
      effects: player._effects || "flat",
      hasPrevious: !!(player.queue.previous && (Array.isArray(player.queue.previous) ? player.queue.previous.length : true)),
    });
  });

  router.post("/pause", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    try { player.pause(true); res.json({ ok: true, paused: true }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/resume", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    try { player.pause(false); res.json({ ok: true, paused: false }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/skip", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    try { player.skip(); res.json({ ok: true }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/previous", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    try {
      const prev = player.queue.previous;
      if (!prev || (Array.isArray(prev) && prev.length === 0)) {
        return res.status(404).json({ error: "No previous track" });
      }
      const prevTrack = Array.isArray(prev) ? prev[prev.length - 1] : prev;
      player.queue.unshift(prevTrack);
      player.skip();
      res.json({ ok: true, track: serializeTrack(prevTrack) });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/stop", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    try { player.destroy(); res.json({ ok: true }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/volume", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const volume = Number(req.body?.volume);
    if (isNaN(volume) || volume < 1 || volume > 200) return res.status(400).json({ error: "Volume must be 1–200" });
    try { player.setVolume(volume); res.json({ ok: true, volume }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/loop", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const mode = req.body?.mode;
    if (!["none", "track", "queue"].includes(mode)) return res.status(400).json({ error: "mode must be none | track | queue" });
    try { player.setLoop(mode); res.json({ ok: true, loop: mode }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.post("/autoplay", async (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const enabled = req.body?.enabled;
    player._autoplay = typeof enabled === "boolean" ? enabled : !player._autoplay;
    try { await updateSettings(req.params.guildId, { autoplay: player._autoplay }); } catch {}
    logger.info(`[Dashboard] Autoplay ${player._autoplay ? "enabled" : "disabled"} for guild ${req.params.guildId}`);
    res.json({ ok: true, autoplay: player._autoplay });
  });

  router.post("/alwayson", async (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const enabled = req.body?.enabled;
    player._alwaysOn = typeof enabled === "boolean" ? enabled : !player._alwaysOn;
    try { await updateSettings(req.params.guildId, { alwaysOn: player._alwaysOn }); } catch {}
    logger.info(`[Dashboard] 24/7 ${player._alwaysOn ? "enabled" : "disabled"} for guild ${req.params.guildId}`);
    res.json({ ok: true, alwaysOn: player._alwaysOn });
  });

  router.post("/effects", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const effect = String(req.body?.effect || "flat");
    const presets = player._effectPresets || {};
    const filters = presets[effect] || presets.flat || {};
    try {
      if (typeof player.shoukaku?.setFilters === "function") player.shoukaku.setFilters(filters);
      player._effects = effect;
      res.json({ ok: true, effect });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/seek", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const ms = Number(req.body?.position);
    if (isNaN(ms) || ms < 0) return res.status(400).json({ error: "Invalid position" });
    try { player.shoukaku.seekTo(ms); res.json({ ok: true, position: ms }); }
    catch (e) { res.status(500).json({ error: e.message }); }
  });

  router.get("/search", async (req, res) => {
    const query = (req.query.q || "").trim();
    if (!query) return res.status(400).json({ error: "Missing query ?q=" });
    try {
      const searchQueries = [
        query,
        `ytmsearch:${query}`,
        `ytsearch:${query}`,
      ];
      for (const q of searchQueries) {
        const result = await client.kazagumo.search(q, { requester: "Dashboard" });
        const track = findExactTrack(result, query);
        const tracks = result?.tracks ?? [];
        // Populate cache with resolved track objects
        for (const t of tracks) _cacheTrack(t);
        const serialized = tracks.slice(0, 10).map(serializeTrack);
        if (track) return res.json({ tracks: serialized, best: serializeTrack(track) });
        if (serialized.length) return res.json({ tracks: serialized, best: serialized[0] });
      }
      res.json({ tracks: [] });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/play", async (req, res) => {
    const { guildId } = req.params;
    const query = (req.body?.query || "").trim();
    const best = req.body?.best || null;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    let player = client.kazagumo?.players?.get(guildId);
    if (!player) {
      const voiceChannel = guild.channels.cache.find((c) => c.isVoiceBased?.() && c.members?.size > 0);
      if (!voiceChannel) return res.status(400).json({ error: "No voice channel found. Join a voice channel first." });
      const textChannel = guild.channels.cache.find((c) => c.isTextBased?.() && c.viewable && !c.isVoiceBased?.());
      try {
        player = await client.kazagumo.createPlayer({ guildId, voiceId: voiceChannel.id, textId: textChannel?.id ?? voiceChannel.id, deaf: true, volume: 100 });
      } catch (createErr) {
        return res.status(500).json({ error: `Could not create player: ${createErr.message}` });
      }
    }

    try {
      let track = null;

      // ① Check the track cache first — populated during /search, avoids re-resolving URI
      if (best?.uri) {
        track = _getCached(best.uri);
      }

      // ② Cache miss: search by URI (for direct URI paste)
      if (!track && best?.uri && best.uri.startsWith("http")) {
        try {
          const result = await client.kazagumo.search(best.uri, { requester: "Dashboard" });
          track = result?.tracks?.[0];
          if (track) _cacheTrack(track);
        } catch (_) { /* ignore, fall through to query search */ }
      }

      // ③ Fallback: search by original query string
      if (!track) {
        const searchQuery = query.startsWith("http") ? query : `ytmsearch:${query}`;
        const result = await client.kazagumo.search(searchQuery, { requester: "Dashboard" });
        track = result?.tracks?.[0];
        if (track) _cacheTrack(track);
      }

      if (!track) return res.status(404).json({ error: "No results found" });
      player.queue.add(track);
      if (!player.playing && !player.paused) await player.play();
      res.json({ ok: true, track: serializeTrack(track) });
    } catch (e) {
      logger.error(`[Dashboard] play error in ${guildId}: ${e.message}`);
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/history", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    const history = (player?._history ?? []).slice().reverse().slice(0, 20).map(serializeTrack);
    res.json({ history });
  });

  return router;
};
