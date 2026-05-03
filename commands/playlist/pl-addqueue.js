const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist, getLimits } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { getPlayer } = require("@plugins/player");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-addqueue",
  aliases: ["pladdqueue", "savequeue"],
  cooldown: "5",
  category: "playlist",
  usage: "<playlist name>",
  description: "Add all tracks from the current queue to one of your playlists.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const plName = args.join(" ");
    const player = getPlayer(client, message.guild.id);

    const queueTracks = player.queue.current ? [player.queue.current, ...player.queue] : [...player.queue];
    if (!queueTracks.length) return message.reply(send(error(`${e.queue} The queue is empty.`)));

    const pl = await Playlist.findOne({ userId: message.author.id, name: plName });
    if (!pl) return message.reply(send(error(`${e.warn} You don't have a playlist named **${plName}**.`)));

    const limits = await getLimits(message.author.id);
    const available = limits.tracks - pl.tracks.length;
    if (available <= 0) return message.reply(send(error(`${e.no} This playlist is already full.`)));

    const toAdd = queueTracks.slice(0, available).map((t) => ({
      title: t.title, author: t.author, uri: t.uri, length: t.length, isStream: t.isStream,
    }));

    pl.tracks.push(...toAdd);
    pl.updatedAt = new Date();
    await pl.save();

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} Queue Saved to Playlist`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Added \`${toAdd.length}\` tracks to **${plName}**\n` +
      (toAdd.length < queueTracks.length ? `${e.warn} ${queueTracks.length - toAdd.length} tracks skipped (playlist limit reached).\n` : "") +
      `\n${e.list} Playlist now has \`${pl.tracks.length}/${limits.tracks}\` tracks.`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
