const express = require("express");
const router  = express.Router();
const logger  = require("@plugins/logger");

module.exports = function topggRouter(client, config) {
  const topggToken = config.BOT?.TOPGG_KEY;

  router.post("/webhook", express.json(), (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== topggToken) {
      logger.warn("[top.gg] Unauthorized webhook attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const vote = req.body;
    if (!vote || !vote.user) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    logger.info(`[top.gg] Vote received from user: ${vote.user} (type: ${vote.type || "upvote"})`);

    try {
      const {
        ContainerBuilder,
        TextDisplayBuilder,
        SeparatorBuilder,
        SeparatorSpacingSize,
        MessageFlags,
      } = require("discord.js");

      const notifyGuild = async () => {
        if (!client.user) return;
        const voteUrl = `https://top.gg/bot/${client.user.id}/vote`;
        const user = await client.users.fetch(vote.user).catch(() => null);
        const userName = user ? `${user.username}` : `<@${vote.user}>`;

        const logChannel = config.WEBHOOKS?.STATIC
          ? null
          : null;

        client.emit("topggVote", vote.user, vote.type);

        logger.info(`[top.gg] ${userName} voted for Chiku! (weekend: ${vote.isWeekend})`);
      };

      notifyGuild().catch(err => logger.error(`[top.gg] Notify error: ${err.message}`));

    } catch (err) {
      logger.error(`[top.gg] Webhook handler error: ${err.message}`);
    }

    return res.sendStatus(200);
  });

  router.get("/status", (_req, res) => {
    res.json({ ok: true, bot: client.user?.username, uptime: client.uptime });
  });

  return router;
};
