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
  name: "rewind",
  aliases: ["rw", "seekback"],
  cooldown: "2",
  category: "music",
  usage: "[seconds]",
  description: "Rewind the current track by N seconds (default: 30s).",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    const track  = player.queue?.current;

    if (!track) return message.reply(send(error(`${e.music} Nothing is currently playing.`)));
    if (track.isStream) return message.reply(send(error(`${e.warn} Cannot seek in a **livestream**.`)));

    const secs    = Math.min(Math.max(parseInt(args[0]) || 30, 1), 300);
    const curPos  = player.shoukaku?.position ?? 0;
    const newPos  = Math.max(curPos - secs * 1000, 0);

    await player.shoukaku.seekTo(newPos);

    const artwork = track.thumbnail || extractYTThumbnail(track.uri);
    const bar     = formatProgressBar(newPos, track.length, 26);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.rewind} Rewound Track`)
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
              `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`${bar}\`\n` +
        `-# ${e.rewind} Rewound \`${secs}s\`  ${e.dash}  Now at **${formatDuration(newPos)}** / ${formatDuration(track.length)}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.rewind} Rewound by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
