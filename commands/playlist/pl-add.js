const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist, getLimits } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-add",
  aliases: ["pladd", "addtoplaylist"],
  cooldown: "3",
  category: "playlist",
  usage: "<playlist name> | <song>",
  description: "Search and add a track to one of your playlists.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const input = args.join(" ");
    const sep = input.indexOf("|");
    if (sep === -1) {
      const px = client.getPrefix(message.guild.id);
      return message.reply(send(error(`${e.warn} Usage: \`${px}pl-add <playlist name> | <song>\`\nExample: \`${px}pl-add Chill Vibes | Lofi Hip Hop\``)));
    }

    const plName = input.slice(0, sep).trim();
    const query = input.slice(sep + 1).trim();

    if (!query) return message.reply(send(error(`${e.warn} Please provide a song to search for.`)));

    const pl = await Playlist.findOne({ userId: message.author.id, name: plName });
    if (!pl) return message.reply(send(error(`${e.warn} You don't have a playlist named **${plName}**.`)));

    const limits = await getLimits(message.author.id);
    if (pl.tracks.length >= limits.tracks) {
      return message.reply(send(error(
        `${e.no} This playlist is full (\`${limits.tracks}\` tracks).\n${e.diamond} Upgrade to Premium for up to \`500\` tracks per playlist.`
      )));
    }

    const loadingC = new ContainerBuilder().setAccentColor(0x9B59B6);
    loadingC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.loading} Searching for **${query}**...`));
    const loadingMsg = await message.reply({ components: [loadingC], flags: MessageFlags.IsComponentsV2 });

    let result;
    try {
      result = await client.kazagumo.search(query, { requester: message.author.tag });
    } catch {
      return loadingMsg.edit(send(error("Search failed. Please try again.")));
    }

    if (!result?.tracks?.length) return loadingMsg.edit(send(error(`No results found for **${query}**.`)));

    const track = result.tracks[0];
    pl.tracks.push({ title: track.title, author: track.author, uri: track.uri, length: track.length, isStream: track.isStream });
    pl.updatedAt = new Date();
    await pl.save();

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} Track Added to Playlist`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**[${track.title}](${track.uri})** added to **${plName}**\n` +
      `${e.mic} **Artist:** ${track.author || "Unknown"} — \`${formatDuration(track.length)}\`\n\n` +
      `${e.list} Playlist now has \`${pl.tracks.length}/${limits.tracks}\` tracks.`
    ));
    return loadingMsg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
