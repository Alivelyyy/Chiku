const { Router } = require("express");

module.exports = function statsRouter(client) {
  const router = Router();

  router.get("/", (_req, res) => {
    try {
      const mem = process.memoryUsage().heapUsed / 1024 / 1024;
      res.json({
        username:  client.user?.username,
        avatar:    client.user?.displayAvatarURL({ size: 128, extension: "webp" }),
        guilds:    client.guilds.cache.size,
        users:     client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
        players:   client.kazagumo?.players?.size ?? 0,
        commands:  client.commands?.size ?? 0,
        aliases:   client.aliases?.size ?? 0,
        memory:    Math.round(mem * 10) / 10,
        uptime:    Math.floor(process.uptime()),
        ping:      client.ws.ping,
        shards:    client.shard?.count ?? 1,
        readyAt:   client.readyAt?.toISOString() ?? null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
