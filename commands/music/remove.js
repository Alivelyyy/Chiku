const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "remove",
  aliases: ["rem", "delete", "del"],
  cooldown: "2",
  category: "music",
  usage: "<position>",
  description: "Remove a track from the queue by its position.",
  args: true,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: true,
  queue: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);

    if (player.queue.length === 0) {
      return message.reply(send(error(`${e.queue} The queue is empty. Nothing to remove.`)));
    }

    const pos = parseInt(args[0]);
    if (isNaN(pos) || pos < 1 || pos > player.queue.length) {
      return message.reply(
        send(error(`${e.warn} Please provide a valid position between \`1\` and \`${player.queue.length}\`.`))
      );
    }

    const track = player.queue[pos - 1];
    player.queue.splice(pos - 1, 1);

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.remove} Track Removed`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Removed **[${track.title}](${track.uri})** from position \`#${pos}\`.\n` +
        `${e.mic} **Artist:** ${track.author || "Unknown"} — \`${track.isStream ? "LIVE" : formatDuration(track.length)}\`\n\n` +
        `${e.queue} **Remaining in queue:** \`${player.queue.length}\` tracks`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Removed by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
