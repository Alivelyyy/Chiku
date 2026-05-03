const logger = require("@plugins/logger");

module.exports = {
  name: "playerEnd",
  execute: async (client, player, track) => {
    logger.music(`Track ended: "${track?.title || "Unknown"}" | Guild: ${player.guildId}`);

    if (track) {
      player._lastTrack = track;
      if (!player._sessionStats) {
        player._sessionStats = { tracksPlayed: 0, totalDuration: 0, startedAt: Date.now() };
      }
      player._sessionStats.tracksPlayed++;
      player._sessionStats.totalDuration += track.length || 0;
    }

    if (player._npMessage) {
      await player._npMessage.delete().catch(() => {});
      player._npMessage = null;
    }
  },
};
