const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");
const logger = require("@plugins/logger");

module.exports = {
  name: "playerStuck",
  execute: async (client, player, track, stuckFor) => {
    const stuckMs = stuckFor ?? 0;
    logger.warn(
      `[Player] Track stuck for ${stuckMs}ms in guild ${player.guildId} | Track: ${track?.title || "Unknown"}`
    );

    const channel = client.channels.cache.get(player.textId);
    if (channel) {
      const c = new ContainerBuilder().setAccentColor(0xFEE75C);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.warn} Track Stuck`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      if (track) {
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.warn} **Stuck track:** [${track.title}](${track.uri})\n` +
            `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
          )
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
      }
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.info} The audio stream stopped responding for \`${Math.round(stuckMs / 1000)}s\`.\n` +
          `${e.skip} Automatically skipping to the next track...`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${e.music} Chiku auto-recovery  ${e.dot}  ApeX Development`)
      );
      await channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

    try {
      player.skip();
    } catch (err) {
      logger.error(`[Player] Failed to skip stuck track in guild ${player.guildId}: ${err.message}`);
    }
  },
};
