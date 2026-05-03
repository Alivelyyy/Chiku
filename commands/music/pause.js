const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const { formatDuration, formatProgressBar, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pause",
  aliases: [],
  cooldown: "2",
  category: "music",
  usage: "",
  description: "Pause the currently playing track.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    const prefix = client.getPrefix(message.guild.id);

    if (player.paused) {
      return message.reply(send(error(
        `${e.pause} The player is already paused.\n> Use \`${prefix}resume\` to continue playback.`
      )));
    }

    await player.pause(true);

    const track   = player.queue.current;
    const artwork = track?.thumbnail || extractYTThumbnail(track?.uri);
    const pos     = player.shoukaku?.position ?? 0;
    const dur     = track?.length ?? 0;
    const bar     = formatProgressBar(pos, dur, 26);

    const c = new ContainerBuilder().setAccentColor(0xFEE75C);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.pause} Paused`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (artwork) {
      c.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${track.title}](${track.uri})**\n` +
              `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(dur)}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else if (track) {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(dur)}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`${bar}\`\n` +
        `-# ${formatDuration(pos)}  ${e.dash}  ${formatDuration(dur)}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.pause} Paused by ${message.author.tag}  ${e.dot}  Use \`${prefix}resume\` to continue`
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
