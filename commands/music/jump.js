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
  name: "jump",
  aliases: ["skipto", "jumpto"],
  cooldown: "2",
  category: "music",
  usage: "<position>",
  description: "Jump directly to a specific track in the queue.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);

    if (player.queue.length === 0) {
      return message.reply(send(error(`${e.queue} There are no tracks in the queue to jump to.`)));
    }

    const pos = parseInt(args[0]);
    if (isNaN(pos) || pos < 1 || pos > player.queue.length) {
      return message.reply(
        send(error(`${e.warn} Please provide a valid position between \`1\` and \`${player.queue.length}\`.`))
      );
    }

    const track   = player.queue[pos - 1];
    const artwork = track.thumbnail || extractYTThumbnail(track.uri);
    player.queue.splice(0, pos - 1);
    await player.skip();

    const remaining = player.queue.length;

    const c = new ContainerBuilder().setAccentColor(0x5865F2);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.jump} Jumped to Track #${pos}`)
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
              `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}  ${e.dot}  ${track.requester}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.queue} ${remaining} track${remaining !== 1 ? "s" : ""} remaining  ${e.dot}  Jumped by ${message.author.tag}`
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
