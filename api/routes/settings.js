require("module-alias/register");

const { Router } = require("express");
const { getSettings, updateSettings } = require("@database/guildSettings");

module.exports = function settingsRouter(client) {
  const router = Router({ mergeParams: true });

  router.get("/", async (req, res) => {
    try {
      const { guildId } = req.params;
      const settings = await getSettings(guildId);

      const guild  = client.guilds.cache.get(guildId);
      const roles  = guild ? guild.roles.cache
        .filter((r) => !r.managed && r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name, color: r.color })) : [];
      const channels = guild ? guild.channels.cache
        .filter((c) => c.type === 0)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, name: c.name })) : [];

      res.json({ settings, roles, channels });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/", async (req, res) => {
    const allowed = ["prefix", "djRole", "musicChannel", "alwaysOn", "autoplay",
                     "defaultVolume", "announceSongs", "deleteNPAfter", "language"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (update.prefix !== undefined) {
      if (typeof update.prefix !== "string" || !update.prefix.length || update.prefix.length > 5)
        return res.status(400).json({ error: "Prefix must be 1–5 characters" });
      client.guildPrefixes.set(req.params.guildId, update.prefix);
    }

    if (update.defaultVolume !== undefined) {
      const v = Number(update.defaultVolume);
      if (isNaN(v) || v < 1 || v > 200)
        return res.status(400).json({ error: "Volume must be 1–200" });
      update.defaultVolume = v;
    }

    try {
      const settings = await updateSettings(req.params.guildId, update);
      res.json({ ok: true, settings });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
