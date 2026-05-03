const { Router } = require("express");

module.exports = function guildsRouter(client) {
  const router = Router();

  router.get("/", (_req, res) => {
    const guilds = client.guilds.cache.map((g) => ({
      id:          g.id,
      name:        g.name,
      icon:        g.iconURL({ size: 128, extension: "webp" }),
      memberCount: g.memberCount,
      hasPlayer:   client.kazagumo?.players?.has(g.id) ?? false,
    }));
    res.json(guilds);
  });

  router.get("/:guildId", (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    const player = client.kazagumo?.players?.get(guild.id);
    res.json({
      id:           guild.id,
      name:         guild.name,
      icon:         guild.iconURL({ size: 128, extension: "webp" }),
      memberCount:  guild.memberCount,
      prefix:       client.getPrefix(guild.id),
      hasPlayer:    !!player,
      voiceChannel: player ? guild.channels.cache.get(player.voiceId)?.name : null,
    });
  });

  return router;
};
