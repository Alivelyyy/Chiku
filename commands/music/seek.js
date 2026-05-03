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

function parseTime(str) {
  const parts = str.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
  if (parts.length === 1) return parts[0] * 1000;
  return null;
}

module.exports = {
  name: "seek",
  aliases: ["scrub"],
  cooldown: "2",
  category: "music",
  usage: "<time (e.g. 1:30 or 90)>",
  description: "Seek to a specific position in the current track.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    const track  = player.queue.current;

    if (track.isStream) {
      return message.reply(send(error(`${e.warn} You cannot seek in a **livestream**.`)));
    }

    const ms = parseTime(args[0]);
    if (ms === null || ms < 0) {
      return message.reply(
        send(error(`${e.warn} Invalid time format.\n> Use \`1:30\` (mm:ss), \`1:00:00\` (hh:mm:ss), or \`90\` (seconds).`))
      );
    }
    if (ms > track.length) {
      return message.reply(
        send(error(`${e.warn} That exceeds the track length of \`${formatDuration(track.length)}\`.`))
      );
    }

    await player.seek(ms);

    const artwork = track.thumbnail || extractYTThumbnail(track.uri);
    const bar     = formatProgressBar(ms, track.length, 26);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.seek} Seeked`)
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
        `-# ${e.seek} Jumped to **${formatDuration(ms)}**  ${e.dash}  ${formatDuration(track.length)}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.seek} Seeked by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
