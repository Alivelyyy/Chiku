const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist, getLimits } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { getPlayer } = require("@plugins/player");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-addnowplaying",
  aliases: ["pladdnp", "savenow", "addnp"],
  cooldown: "3",
  category: "playlist",
  usage: "<playlist name>",
  description: "Add the currently playing track to one of your playlists.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const plName = args.join(" ");
    const player = getPlayer(client, message.guild.id);
    const track = player?.queue?.current;
    if (!track) return message.reply(send(error(`${e.music} Nothing is currently playing.`)));

    const pl = await Playlist.findOne({ userId: message.author.id, name: plName });
    if (!pl) return message.reply(send(error(`${e.warn} You don't have a playlist named **${plName}**.`)));

    const limits = await getLimits(message.author.id);
    if (pl.tracks.length >= limits.tracks) {
      return message.reply(send(error(`${e.no} This playlist is full (\`${limits.tracks}\` tracks).`)));
    }

    pl.tracks.push({ title: track.title, author: track.author, uri: track.uri, length: track.length, isStream: track.isStream });
    pl.updatedAt = new Date();
    await pl.save();

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} Now Playing Saved`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**[${track.title}](${track.uri})** saved to **${plName}**\n` +
      `${e.mic} **Artist:** ${track.author || "Unknown"} — \`${formatDuration(track.length)}\`\n\n` +
      `${e.list} Playlist now has \`${pl.tracks.length}/${limits.tracks}\` tracks.`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
