const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");
const {
  getPlayer,
  buildNPContainer,
  buildQueueText,
  getFilters,
  getEQPresets,
} = require("@plugins/player");
const { npControls, queueNav, filterButtons, eqPresetButtons } = require("@plugins/button");
const { checkPremium } = require("@database/premiumModel");
const { send, error } = require("@plugins/embed");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const logger = require("@plugins/logger");
const e = require("@assets/emojis/black.js");

const VOICE_REQUIRED = new Set([
  "np_pause", "np_skip", "np_stop", "np_previous",
  "np_loop", "np_shuffle", "np_voldown", "np_volup",
  "filter_bassboost", "filter_nightcore", "filter_vaporwave",
  "filter_8d", "filter_karaoke", "filter_soft", "filter_reset",
]);

function needsVoice(id) {
  return VOICE_REQUIRED.has(id) || id.startsWith("eq_");
}

function needsPlayer(id) {
  return needsVoice(id) || id === "np_queue" || id === "np_lyrics";
}

function buildSkeletonCard(color, text) {
  const c = new ContainerBuilder().setAccentColor(color);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  return c;
}

module.exports = {
  name: "interactionCreate",
  once: false,
  execute: async (client, interaction) => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    try {
      const player = getPlayer(client, interaction.guildId);

      if (needsPlayer(customId)) {
        if (!player) {
          return interaction.reply(
            send(error(`${e.music} No active player. Start music with \`play\`.`))
          ).catch(() => {});
        }
      }

      if (needsVoice(customId)) {
        if (!interaction.member?.voice?.channel) {
          return interaction.reply(
            send(error(`${e.headphones} You must be in a **voice channel** to use controls.`))
          ).catch(() => {});
        }
        if (interaction.member.voice.channelId !== player.voiceId) {
          return interaction.reply(
            send(error(`${e.headphones} You must be in the **same voice channel** as me.`))
          ).catch(() => {});
        }
      }

      if (customId === "np_pause") {
        await interaction.deferUpdate();
        await player.pause(!player.paused);
        const updated = buildNPContainer(player);
        if (updated) {
          await interaction.message.edit({ components: [updated], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }

      } else if (customId === "np_skip") {
        const skipped = player.queue.current;
        if (!skipped) {
          await interaction.deferUpdate().catch(() => {});
          return;
        }
        const next = player.queue[0];

        await interaction.deferUpdate();

        if (player._npMessage?.id === interaction.message.id) {
          player._npMessage = null;
        }

        await player.skip();

        const artwork = next ? (next.thumbnail || extractYTThumbnail(next.uri)) : null;
        const c = new ContainerBuilder().setAccentColor(0x5865F2);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.skip} Track Skipped`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `~~[${skipped.title}](${skipped.uri})~~\n` +
            `-# ${e.mic} ${skipped.author || "Unknown"}`
          )
        );
        if (next) {
          c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
          );
          if (artwork) {
            c.addSectionComponents(
              new SectionBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `${e.play} **Up Next**\n**[${next.title}](${next.uri})**\n` +
                    `-# ${e.mic} ${next.author || "Unknown"}  ${e.dot}  ${next.isStream ? "🔴 LIVE" : formatDuration(next.length)}`
                  )
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
            );
          } else {
            c.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `${e.play} **Up Next:** [${next.title}](${next.uri})\n` +
                `-# ${e.mic} ${next.author || "Unknown"}`
              )
            );
          }
        }
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# ${e.skip} Skipped by ${interaction.user.tag}`)
        );
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId === "np_stop") {
        const current = player.queue.current;
        const stats   = player._sessionStats || { tracksPlayed: 0, totalDuration: 0 };

        if (player._npMessage?.id === interaction.message.id) {
          player._npMessage = null;
        }

        await interaction.deferUpdate();
        await player.destroy();

        const c = new ContainerBuilder().setAccentColor(0xED4245);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.stop} Session Ended`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.headphones} Disconnected from voice channel.\n\n` +
            `${e.list} **Tracks played:** \`${stats.tracksPlayed}\`\n` +
            `${e.time} **Total playtime:** \`${formatDuration(stats.totalDuration)}\``
          )
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# ${e.stop} Stopped by ${interaction.user.tag}`)
        );
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId === "np_previous") {
        const prev = player.queue.previous;
        if (!prev?.length) {
          return interaction.reply(
            send(error(`${e.previous} No previous track available.`))
          ).catch(() => {});
        }
        const prevTrack = Array.isArray(prev) ? prev[prev.length - 1] : prev;

        if (player._npMessage?.id === interaction.message.id) {
          player._npMessage = null;
        }

        await interaction.deferUpdate();
        player.queue.unshift(prevTrack);
        await player.skip();

        const artwork = prevTrack.thumbnail || extractYTThumbnail(prevTrack.uri);
        const c = new ContainerBuilder().setAccentColor(0x5865F2);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.previous} Playing Previous`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        if (artwork) {
          c.addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `**[${prevTrack.title}](${prevTrack.uri})**\n` +
                  `-# ${e.mic} ${prevTrack.author || "Unknown"}  ${e.dot}  ${prevTrack.isStream ? "🔴 LIVE" : formatDuration(prevTrack.length)}`
                )
              )
              .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
          );
        } else {
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${prevTrack.title}](${prevTrack.uri})**\n` +
              `-# ${e.mic} ${prevTrack.author || "Unknown"}`
            )
          );
        }
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# ${e.previous} Rewound by ${interaction.user.tag}`)
        );
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId === "np_loop") {
        await interaction.deferUpdate();
        const modes = ["none", "track", "queue"];
        const next  = modes[(modes.indexOf(player.loop || "none") + 1) % modes.length];
        player.setLoop(next);
        const updated = buildNPContainer(player);
        if (updated) {
          await interaction.message.edit({ components: [updated], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }

      } else if (customId === "np_shuffle") {
        if (player.queue.length < 2) {
          return interaction.reply(
            send(error(`${e.shuffle} You need at least **2 tracks** in the queue to shuffle.`))
          ).catch(() => {});
        }
        await interaction.deferUpdate();
        player.queue.shuffle();
        const next    = player.queue[0];
        const artwork = next ? (next.thumbnail || extractYTThumbnail(next.uri)) : null;

        const c = new ContainerBuilder().setAccentColor(0x9B59B6);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.shuffle} Queue Shuffled`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.yes} ${player.queue.length} tracks reshuffled.`
          )
        );
        if (next) {
          c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
          );
          if (artwork) {
            c.addSectionComponents(
              new SectionBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `${e.play} **Up Next**\n**[${next.title}](${next.uri})**\n` +
                    `-# ${e.mic} ${next.author || "Unknown"}  ${e.dot}  ${next.isStream ? "🔴 LIVE" : formatDuration(next.length)}`
                  )
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
            );
          } else {
            c.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `${e.play} **Up Next:** [${next.title}](${next.uri})`
              )
            );
          }
        }
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# ${e.shuffle} Shuffled by ${interaction.user.tag}`)
        );
        await interaction.followUp({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId === "np_voldown") {
        await interaction.deferUpdate();
        const newVol = Math.max(0, (player.volume || 100) - 10);
        await player.setVolume(newVol);
        const updated = buildNPContainer(player);
        if (updated) {
          await interaction.message.edit({ components: [updated], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }

      } else if (customId === "np_volup") {
        const newVol = Math.min(200, (player.volume || 100) + 10);

        if (newVol > 100) {
          const isPrem = await checkPremium(interaction.user.id).catch(() => false);
          if (!isPrem) {
            return interaction.reply(
              send(error(
                `${e.diamond} Volume above \`100%\` requires **Chiku Premium**.\n` +
                `> Use \`premium\` to view benefits or \`activate <code>\` to unlock.`
              ))
            ).catch(() => {});
          }
        }

        await interaction.deferUpdate();
        await player.setVolume(newVol);
        const updated = buildNPContainer(player);
        if (updated) {
          await interaction.message.edit({ components: [updated], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }

      } else if (customId === "np_queue") {
        await interaction.deferUpdate();
        const current     = player.queue.current;
        const total       = player.queue.length;
        const prefix      = client.getPrefix(interaction.guildId);
        const { text, totalPages } = buildQueueText(player.queue, 1, 10);

        const c = new ContainerBuilder().setAccentColor(0x9B59B6);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.queue} Current Queue`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        if (current) {
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${e.playing} **Now Playing**\n` +
              `**[${current.title}](${current.uri})** \`${current.isStream ? "🔴 LIVE" : formatDuration(current.length)}\`\n` +
              `-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${current.requester}`
            )
          );
          c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
          );
        }
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            total > 0 ? text : `${e.info} No more tracks queued. Use \`${prefix}play <song>\` to add more!`
          )
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# ${e.list} ${total} track${total !== 1 ? "s" : ""} in queue  ${e.dot}  Page 1/${totalPages}`
          )
        );
        if (totalPages > 1) {
          c.addActionRowComponents(queueNav(1, totalPages));
        }
        await interaction.followUp({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId === "np_lyrics") {
        await interaction.deferUpdate();
        const track = player?.queue?.current;
        if (!track) return;

        const lyricsQuery = `${track.title} ${track.author || ""}`.trim();
        try {
          const Genius  = require("genius-lyrics");
          const GClient = new Genius.Client();
          const results = await GClient.songs.search(lyricsQuery);

          if (!results.length) {
            return interaction.followUp(
              send(error(`${e.lyrics} No lyrics found for **${track.title}**.`))
            ).catch(() => {});
          }

          const song    = results[0];
          const lyrics  = await song.lyrics();
          const trimmed = lyrics.length > 1800
            ? lyrics.slice(0, 1800) + `\n\n*... (use \`lyrics\` command for full text)*`
            : lyrics;

          const c = new ContainerBuilder().setAccentColor(0x9B59B6);
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${e.lyrics} ${song.title}\n-# ${e.mic} ${song.artist.name}`
            )
          );
          c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
          );
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(trimmed)
          );
          c.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# ${e.link} [View on Genius](${song.url})  ${e.dot}  Powered by Genius`
            )
          );
          await interaction.followUp({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        } catch {
          await interaction.followUp(
            send(error(`${e.no} Could not fetch lyrics. Try \`lyrics\` command instead.`))
          ).catch(() => {});
        }

      } else if (customId.startsWith("queue_prev_") || customId.startsWith("queue_next_")) {
        await interaction.deferUpdate();
        const p = getPlayer(client, interaction.guildId);
        if (!p) return;

        const parts   = customId.split("_");
        const curPage = parseInt(parts[parts.length - 1]) || 1;
        const page    = customId.startsWith("queue_prev_")
          ? Math.max(1, curPage - 1)
          : curPage + 1;

        const { text, totalPages } = buildQueueText(p.queue, page, 10);
        const total   = p.queue.length;
        const current = p.queue.current;

        if (page > totalPages) return;

        const c = new ContainerBuilder().setAccentColor(0x9B59B6);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.queue} Music Queue`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        if (current) {
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${e.playing} **Now Playing**\n` +
              `**[${current.title}](${current.uri})** \`${current.isStream ? "🔴 LIVE" : formatDuration(current.length)}\`\n` +
              `-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${current.requester}`
            )
          );
          c.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
          );
        }
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(total > 0 ? text : `${e.info} No tracks queued.`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# ${e.list} ${total} track${total !== 1 ? "s" : ""}  ${e.dot}  Page ${page}/${totalPages}`
          )
        );
        c.addActionRowComponents(queueNav(page, totalPages));
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId.startsWith("search_")) {
        if (customId === "search_cancel") {
          await interaction.message.delete().catch(() => {});
          return;
        }

        const index  = parseInt(customId.replace("search_", ""));
        const cacheKey = `${interaction.guildId}_${interaction.user.id}`;
        const tracks = client._searchCache?.get(cacheKey);

        if (!tracks?.[index]) {
          return interaction.reply(
            send(error(`${e.search} Search session expired. Please search again.`))
          ).catch(() => {});
        }

        if (!interaction.member?.voice?.channelId) {
          return interaction.reply(
            send(error(`${e.headphones} Join a voice channel first.`))
          ).catch(() => {});
        }

        await interaction.deferUpdate();
        const track = tracks[index];
        let p = getPlayer(client, interaction.guildId);

        if (!p) {
          p = await client.kazagumo.createPlayer({
            guildId: interaction.guildId,
            textId:  interaction.channelId,
            voiceId: interaction.member.voice.channelId,
            volume:  100,
            deaf:    true,
          });
        } else if (interaction.member.voice.channelId !== p.voiceId) {
          return interaction.followUp(
            send(error(`${e.headphones} You must be in the same voice channel as me.`))
          ).catch(() => {});
        }

        p.queue.add(track);
        if (!p.playing && !p.paused) await p.play();
        client._searchCache.delete(cacheKey);

        const qPos    = p.queue.length;
        const artwork = track.thumbnail || extractYTThumbnail(track.uri);

        const c = new ContainerBuilder().setAccentColor(0x57F287);
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
                  `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}`
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
            `-# ${e.list} Position #${qPos}  ${e.dot}  Added by ${interaction.user.tag}`
          )
        );
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId.startsWith("filter_")) {
        const filterName = customId.replace("filter_", "");
        const filters    = getFilters();
        if (!filters[filterName]) {
          await interaction.deferUpdate().catch(() => {});
          return;
        }

        await interaction.deferUpdate();

        if (filterName === "reset") {
          await player.shoukaku.setFilters({});
          player._currentFilter = null;
        } else {
          await player.shoukaku.setFilters(filters[filterName]);
          player._currentFilter = filterName;
        }

        const displayName = filterName === "reset"
          ? "None"
          : filterName.charAt(0).toUpperCase() + filterName.slice(1);

        const [fRow]      = filterButtons(player._currentFilter);
        const c = new ContainerBuilder().setAccentColor(0x9B59B6);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${e.filter} Audio Filters`)
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            filterName === "reset"
              ? `${e.yes} All filters **reset** to default audio.`
              : `${e.yes} **${displayName}** filter applied.`
          )
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# ${e.filter} Active: **${player._currentFilter || "None"}**  ${e.dot}  Changed by ${interaction.user.tag}`
          )
        );
        c.addActionRowComponents(fRow);
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      } else if (customId.startsWith("eq_")) {
        const presetName = customId.replace("eq_", "");
        const presets    = getEQPresets();
        const target     = presetName === "reset" ? "flat" : presetName;
        if (!presets[target]) {
          await interaction.deferUpdate().catch(() => {});
          return;
        }

        await interaction.deferUpdate();
        await player.shoukaku.setFilters(presets[target]);
        player._currentEQ = target === "flat" ? null : target;

        const activeNow  = player._currentEQ || "flat";
        const displayEQ  = activeNow.charAt(0).toUpperCase() + activeNow.slice(1);
        const [er1, er2] = eqPresetButtons(activeNow);

        const c = new ContainerBuilder().setAccentColor(0x9B59B6);
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${e.equalizer} Equalizer — ${displayEQ}\n` +
            `-# ${e.yes} Preset changed by ${interaction.user.tag}`
          )
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            target === "flat"
              ? `${e.yes} Equalizer **reset** — no EQ applied.`
              : `${e.yes} **${displayEQ}** EQ preset is now active.`
          )
        );
        c.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# ${e.equalizer} Active: **${displayEQ}**  ${e.dot}  Changed by ${interaction.user.tag}`
          )
        );
        c.addActionRowComponents(er1, er2);
        await interaction.message.edit({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }

    } catch (err) {
      logger.error(`[Interaction] ${customId} failed:`, err.message);
      try {
        const errC = new ContainerBuilder().setAccentColor(0xED4245);
        errC.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.no} Something went wrong. Please try again.\n-# Error: ${err.message?.slice(0, 100) || "Unknown"}`
          )
        );
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ components: [errC], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        } else {
          await interaction.followUp({ components: [errC], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }
      } catch {}
    }
  },
};
