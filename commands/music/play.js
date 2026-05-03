const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getSettings } = require("@database/guildSettings");
const e = require("@assets/emojis/black.js");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");

module.exports = {
  name: "play",
  aliases: ["p"],
  cooldown: "2",
  category: "music",
  usage: "<song name / url>",
  description: "Play a song or playlist from YouTube, Spotify, SoundCloud, and more.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: ["Connect", "Speak"], userPerms: [],
  player: false, queue: false, inVoiceChannel: true, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const query = args.join(" ");

    let settings;
    try {
      settings = await getSettings(message.guild.id);
    } catch {
      settings = { defaultVolume: 100 };
    }
    const volume = Math.min(200, Math.max(1, settings.defaultVolume || 100));

    let player = client.kazagumo.players.get(message.guild.id);

    if (!player) {
      try {
        player = await client.kazagumo.createPlayer({
          guildId: message.guild.id,
          textId:  message.channel.id,
          voiceId: message.member.voice.channel.id,
          volume,
          deaf: true,
        });
      } catch (err) {
        return message.reply(
          send(error(
            `${e.no} Could not connect to voice channel.\n` +
            `-# ${err?.message || "The audio server may be unavailable. Try again in a moment."}`
          ))
        );
      }
    } else if (message.member.voice.channelId !== player.voiceId) {
      return message.reply(
        send(error(`${e.headphones} I'm already playing in a different voice channel.`))
      );
    }

    const loadingC = new ContainerBuilder().setAccentColor(0x9B59B6);
    loadingC.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.loading} Searching for **${query}**...`)
    );
    const loadingMsg = await message.reply({
      components: [loadingC],
      flags: MessageFlags.IsComponentsV2,
    });

    let result;
    try {
      result = await client.kazagumo.search(query, { requester: message.author });
    } catch (err) {
      if (!player.queue.totalSize) player.destroy().catch(() => {});
      return loadingMsg.edit(
        send(error(`${e.no} Search failed — the audio server may be offline. Try again shortly.`))
      );
    }

    if (!result?.tracks?.length) {
      if (!player.queue.totalSize) player.destroy().catch(() => {});
      return loadingMsg.edit(send(error(`${e.search} No results found for **${query}**. Try a different search.`)));
    }

    if (result.type === "PLAYLIST") {
      const beforeLen = player.queue.totalSize;
      player.queue.add(result.tracks);

      if (!player.playing && !player.paused) {
        try {
          await player.play();
        } catch (err) {
          return loadingMsg.edit(
            send(error(`${e.no} Failed to start playback. The audio server may have disconnected.`))
          );
        }
      }

      const totalDur  = result.tracks.reduce((a, t) => a + (t.length || 0), 0);
      const startPos  = Math.max(1, beforeLen);
      const endPos    = player.queue.totalSize - 1;

      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.music} Playlist Added`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${result.playlistName || "Playlist"}**\n\n` +
          `${e.list} Tracks: \`${result.tracks.length}\`\n` +
          `${e.time} Duration: \`${formatDuration(totalDur)}\`\n` +
          `${e.headphones} Requested by: ${message.author.tag}`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Queue position: #${startPos}–#${endPos > 0 ? endPos : result.tracks.length}  ${e.dot}  ${player.queue.totalSize} total tracks`
        )
      );
      return loadingMsg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const track = result.tracks[0];
    const wasIdle = !player.playing && !player.paused;
    player.queue.add(track);

    if (wasIdle) {
      try {
        await player.play();
      } catch (err) {
        return loadingMsg.edit(
          send(error(`${e.no} Failed to start playback. The audio server may have disconnected.`))
        );
      }
      return loadingMsg.delete().catch(() => {});
    }

    const pos     = player.queue.length;
    const artwork = track.thumbnail || extractYTThumbnail(track.uri);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.note} Added to Queue`)
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
              `${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} \`${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}\`\n` +
              `${e.headphones} Requested by: ${message.author.tag}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} \`${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}\`\n` +
          `${e.headphones} Requested by: ${message.author.tag}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.list} Queue position: **#${pos}**  ${e.dot}  ${player.queue.length} total track${player.queue.length !== 1 ? "s" : ""}`
      )
    );
    return loadingMsg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
