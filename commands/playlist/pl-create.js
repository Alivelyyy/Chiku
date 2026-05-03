const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist, getLimits } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-create",
  aliases: ["plcreate", "createpl", "playlist-create"],
  cooldown: "5",
  category: "playlist",
  usage: "<name>",
  description: "Create a new personal playlist.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const name = args.join(" ").slice(0, 32);
    const limits = await getLimits(message.author.id);
    const count = await Playlist.countDocuments({ userId: message.author.id });

    if (count >= limits.playlists) {
      return message.reply(send(error(
        `${e.no} You've reached the playlist limit (\`${limits.playlists}\`).\n` +
        `${e.diamond} Upgrade to **Premium** with \`${client.getPrefix(message.guild.id)}premium\` to create up to \`25\` playlists.`
      )));
    }

    const exists = await Playlist.findOne({ userId: message.author.id, name });
    if (exists) return message.reply(send(error(`${e.warn} You already have a playlist named **${name}**.`)));

    await Playlist.create({ userId: message.author.id, name });

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.queue} Playlist Created`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Created playlist **${name}** successfully!\n\n` +
      `${e.dot} Use \`${client.getPrefix(message.guild.id)}pl-add ${name} <song>\` to add tracks.\n` +
      `${e.dot} Use \`${client.getPrefix(message.guild.id)}pl-load ${name}\` to play it.\n` +
      `${e.dot} Playlists used: \`${count + 1}/${limits.playlists}\``
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Created by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
