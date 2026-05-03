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
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "move",
  aliases: ["mv"],
  cooldown: "2",
  category: "music",
  usage: "<from> <to>",
  description: "Move a track from one queue position to another.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player  = getPlayer(client, message.guild.id);
    const prefix  = client.getPrefix(message.guild.id);

    if (player.queue.length < 2) {
      return message.reply(send(error(`${e.warn} You need at least **2 tracks** in the queue to move tracks.`)));
    }

    const from   = parseInt(args[0]);
    const to     = parseInt(args[1]);
    const maxPos = player.queue.length;

    if (isNaN(from) || isNaN(to)) {
      return message.reply(send(error(
        `${e.warn} **Usage:** \`${prefix}move <from> <to>\`\n> Example: \`${prefix}move 3 1\``
      )));
    }
    if (from < 1 || from > maxPos || to < 1 || to > maxPos) {
      return message.reply(send(error(`${e.warn} Positions must be between \`1\` and \`${maxPos}\`.`)));
    }
    if (from === to) {
      return message.reply(send(error(`${e.warn} The track is already at position \`#${to}\`.`)));
    }

    const [track] = player.queue.splice(from - 1, 1);
    player.queue.splice(to - 1, 0, track);

    const artwork = track.thumbnail || extractYTThumbnail(track.uri);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.move} Track Moved`)
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
              `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.arrow} Position \`#${from}\` → \`#${to}\`  ${e.dot}  ${player.queue.length} total tracks in queue`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.move} Moved by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
