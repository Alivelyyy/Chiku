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
  name: "playerResolveError",
  execute: async (client, player, track, message) => {
    logger.warn(
      `[Player] Resolve error in guild ${player.guildId} | Track: ${track?.title || "Unknown"} | ${message || "Unknown error"}`
    );

    const channel = client.channels.cache.get(player.textId);
    if (!channel) return;

    const isSpotify = track?.sourceName === "spotify";
    const reason = isSpotify
      ? "This Spotify track could not be matched to a playable source on YouTube."
      : message || "The track could not be resolved from its source.";

    const c = new ContainerBuilder().setAccentColor(0xFEE75C);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.warn} Track Unresolvable`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (track) {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.no} **Skipping:** [${track.title}](${track.uri || "#"})\n` +
          `-# ${e.mic} ${track.author || "Unknown"}` +
          (track.length ? `  ${e.dot}  ${e.time} ${formatDuration(track.length)}` : "")
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
    }

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.warn} **Reason:** ${reason}\n\n` +
        `${e.skip} Moving to the next track in the queue...`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.music} Chiku by ApeX Development  ${e.dot}  Try searching by title instead of a Spotify link`
      )
    );

    await channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
  },
};
