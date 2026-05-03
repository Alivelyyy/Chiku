const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-removetrack",
  aliases: ["plremove", "pl-remove", "removetrack"],
  cooldown: "3",
  category: "playlist",
  usage: "<playlist name> | <position>",
  description: "Remove a track from one of your playlists by its position.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const input = args.join(" ");
    const sep = input.lastIndexOf("|");
    if (sep === -1) {
      return message.reply(send(error(`${e.warn} Usage: \`${client.getPrefix(message.guild.id)}pl-removetrack <playlist> | <position>\``)));
    }

    const plName = input.slice(0, sep).trim();
    const pos = parseInt(input.slice(sep + 1).trim());

    const pl = await Playlist.findOne({ userId: message.author.id, name: plName });
    if (!pl) return message.reply(send(error(`${e.warn} No playlist named **${plName}**.`)));

    if (isNaN(pos) || pos < 1 || pos > pl.tracks.length) {
      return message.reply(send(error(`${e.warn} Position must be between \`1\` and \`${pl.tracks.length}\`.`)));
    }

    const [removed] = pl.tracks.splice(pos - 1, 1);
    pl.updatedAt = new Date();
    await pl.save();

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.remove} Track Removed from Playlist`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Removed **${removed.title}** from **${plName}** at position \`#${pos}\`.\n` +
      `${e.list} Playlist now has \`${pl.tracks.length}\` tracks.`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
