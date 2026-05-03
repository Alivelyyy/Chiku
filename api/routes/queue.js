const { Router } = require("express");

function serializeTrack(track, index) {
  if (!track) return null;
  const req = track.requester;
  return {
    index,
    title:      track.title,
    author:     track.author || "Unknown",
    uri:        track.uri,
    length:     track.length,
    thumbnail:  track.thumbnail || null,
    isStream:   track.isStream,
    sourceName: track.sourceName,
    requester:  req?.tag || req?.username || (typeof req === "string" ? req : "Unknown"),
  };
}

module.exports = function queueRouter(client) {
  const router = Router({ mergeParams: true });

  router.get("/", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.json({ tracks: [], total: 0 });
    const tracks = [...player.queue].map((t, i) => serializeTrack(t, i));
    res.json({ tracks, total: player.queue.length });
  });

  router.delete("/:index", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const index = Number(req.params.index);
    if (isNaN(index) || index < 0 || index >= player.queue.length)
      return res.status(400).json({ error: "Invalid queue index" });
    player.queue.splice(index, 1);
    res.json({ ok: true });
  });

  router.post("/clear", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    player.queue.clear();
    res.json({ ok: true });
  });

  router.post("/shuffle", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    player.queue.shuffle();
    res.json({ ok: true });
  });

  router.post("/move", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildId);
    if (!player) return res.status(404).json({ error: "No active player" });
    const from = Number(req.body?.from);
    const to   = Number(req.body?.to);
    const len  = player.queue.length;
    if (isNaN(from) || isNaN(to) || from < 0 || from >= len || to < 0 || to >= len || from === to)
      return res.status(400).json({ error: "Invalid from/to indices" });
    try {
      const arr = [...player.queue];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      player.queue.clear();
      for (const t of arr) player.queue.add(t);
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
