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
  name: "playerException",
  execute: async (client, player, exceptionData) => {
    const track = player.queue.current;
    const errMsg = exceptionData?.exception?.message
      || exceptionData?.message
      || "An unknown error occurred while loading the track.";

    logger.error(
      `[Player] Track exception in guild ${player.guildId}: ${errMsg} | Track: ${track?.title || "Unknown"}`
    );

    const channel = client.channels.cache.get(player.textId);
    if (!channel) return;

    const isRestricted = errMsg.toLowerCase().includes("copyright") ||
                         errMsg.toLowerCase().includes("not available") ||
                         errMsg.toLowerCase().includes("private") ||
                         errMsg.toLowerCase().includes("age");

    const reason = isRestricted
      ? "This track is age-restricted, private, or unavailable in your region."
      : errMsg;

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.warn} Track Unavailable`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (track) {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.no} **Failed to play:** [${track.title}](${track.uri})\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
    }

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.warn} **Reason:** ${reason}\n\n` +
        `${e.skip} Automatically skipping to the next track...`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.music} Chiku by ApeX Development  ${e.dot}  If this persists, try a different source`
      )
    );

    await channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

    try {
      player.skip();
    } catch (err) {
      logger.error(`[Player] Failed to skip after exception in guild ${player.guildId}: ${err.message}`);
    }
  },
};
