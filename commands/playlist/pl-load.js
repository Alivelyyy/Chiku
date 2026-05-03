const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-load",
  aliases: ["plload", "loadplaylist", "playlist-load"],
  cooldown: "5",
  category: "playlist",
  usage: "<name>",
  description: "Load one of your playlists into the music queue.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: ["Connect", "Speak"], userPerms: [], player: false, queue: false, inVoiceChannel: true, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const name = args.join(" ");
    const pl = await Playlist.findOne({ userId: message.author.id, name }).lean();
    if (!pl) return message.reply(send(error(`${e.warn} You don't have a playlist named **${name}**.`)));
    if (!pl.tracks.length) return message.reply(send(error(`${e.warn} The playlist **${name}** is empty.`)));

    let player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      player = await client.kazagumo.createPlayer({
        guildId: message.guild.id,
        textId: message.channel.id,
        voiceId: message.member.voice.channel.id,
        volume: 100,
        deaf: true,
      });
    } else if (message.member.voice.channelId !== player.voiceId) {
      return message.reply(send(error(`${e.headphones} You must be in the same voice channel as me.`)));
    }

    const loadingC = new ContainerBuilder().setAccentColor(0x9B59B6);
    loadingC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.loading} Loading **${name}** (${pl.tracks.length} tracks)...`));
    const loadingMsg = await message.reply({ components: [loadingC], flags: MessageFlags.IsComponentsV2 });

    let loaded = 0;
    for (const track of pl.tracks) {
      try {
        const res = await client.kazagumo.search(track.uri, { requester: `${message.author.tag} (Playlist: ${name})` });
        if (res?.tracks?.[0]) {
          player.queue.add(res.tracks[0]);
          loaded++;
        }
      } catch {}
    }

    if (!player.playing && !player.paused) await player.play();

    const totalDur = pl.tracks.reduce((a, t) => a + (t.length || 0), 0);
    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.queue} Playlist Loaded`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Loaded **${name}** into the queue!\n\n` +
      `${e.list} **Tracks Loaded:** \`${loaded}/${pl.tracks.length}\`\n` +
      `${e.time} **Total Duration:** \`${formatDuration(totalDur)}\`\n` +
      `${e.headphones} **Requested by:** ${message.author.tag}`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Use \`${client.getPrefix(message.guild.id)}queue\` to view the full queue`));
    return loadingMsg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
