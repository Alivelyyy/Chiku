const { MessageFlags } = require("discord.js");
const { buildTrackStartCard } = require("@plugins/player");
const logger = require("@plugins/logger");

module.exports = {
  name: "playerStart",
  execute: async (client, player, track) => {
    logger.music(`Now playing: "${track.title}" | Guild: ${player.guildId}`);

    player._lastTrack = track;

    if (!player._sessionStats) {
      player._sessionStats = { tracksPlayed: 0, totalDuration: 0, startedAt: Date.now() };
    }

    if (player._npMessage) {
      await player._npMessage.delete().catch(() => {});
      player._npMessage = null;
    }

    const channel = client.channels.cache.get(player.textId);
    if (!channel) return;

    const card = buildTrackStartCard(player);
    if (!card) return;

    try {
      player._npMessage = await channel.send({
        components: [card],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (err) {
      logger.error("Failed to send Now Playing card:", err.message);
    }
  },
};
