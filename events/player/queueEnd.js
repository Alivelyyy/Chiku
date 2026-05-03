const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { getSettings } = require("@database/guildSettings");
const { formatDuration, formatUptime } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");
const logger = require("@plugins/logger");
const { PlayerState } = require("kazagumo");

async function findAutoplayTrack(client, lastTrack, history = []) {
  const title = (lastTrack.title || "").replace(/\s*[\(\[].+?[\)\]]/g, "").trim();
  const artist = (lastTrack.author || "").split(/[,&]/)[0].trim();
  const historySet = new Set(history.map((t) => (t.title || "").toLowerCase().slice(0, 50)));
  historySet.add((lastTrack.title || "").toLowerCase().slice(0, 50));

  const queries = [
    `ytmsearch:${title} ${artist}`,
    `ytsearch:${artist} ${title} mix`,
    `ytmsearch:${artist}`,
    `ytsearch:${title} ${artist}`,
    `ytsearch:${artist} best songs`,
    `ytsearch:${title}`,
  ];

  for (const query of queries) {
    try {
      const result = await client.kazagumo.search(query, { requester: "Autoplay" });
      const candidates = (result?.tracks ?? []).filter((t) => {
        if (t.isStream) return false;
        if (t.length < 60_000 || t.length > 600_000) return false;
        const norm = (t.title || "").toLowerCase().slice(0, 50);
        return !historySet.has(norm);
      });
      if (candidates.length) {
        const pick = candidates[Math.min(candidates.length - 1, Math.floor(Math.random() * Math.min(5, candidates.length)))];
        return pick;
      }
    } catch (err) {
      logger.warn(`[Autoplay] Query "${query}" failed: ${err?.message}`);
    }
  }
  return null;
}

module.exports = {
  name: "playerEmpty",
  execute: async (client, player) => {
    logger.music(`Queue ended | Guild: ${player.guildId}`);
    if (player._npMessage) {
      await player._npMessage.delete().catch(() => {});
      player._npMessage = null;
    }

    let settings;
    try { settings = await getSettings(player.guildId); }
    catch { settings = { alwaysOn: false, autoplay: false }; }

    const isAlwaysOn = settings?.alwaysOn || player._alwaysOn || false;
    const isAutoplay = settings?.autoplay || player._autoplay || false;
    const prefix = client.getPrefix(player.guildId);
    const channel = client.channels.cache.get(player.textId);
    const stats = player._sessionStats || { tracksPlayed: 0, totalDuration: 0, startedAt: Date.now() };
    const sessionLen = Date.now() - (stats.startedAt || Date.now());
    const history = player._history || [];

    if (isAutoplay && player._lastTrack && player.state !== PlayerState.DESTROYED) {
      try {
        const pick = await findAutoplayTrack(client, player._lastTrack, history);
        if (pick) {
          player.queue.add(pick);
          if (!player._history) player._history = [];
          player._history.push(pick);
          if (player._history.length > 100) player._history.shift();
          
          // Wait a moment for the player to stabilize after queue end, then attempt play
          await new Promise(r => setTimeout(r, 500));
          
          // Check if player is still valid and connected before playing
          if (player.state === PlayerState.DESTROYED || !player.shoukaku?.node?.connected) {
            logger.warn(`[Autoplay] Player disconnected or destroyed in guild ${player.guildId}, aborting autoplay`);
            return;
          }
          
          if (!player.playing && !player.paused) {
            try {
              await player.play();
            } catch (playErr) {
              logger.error(`[Autoplay] play() failed: ${playErr?.message} | Player state: ${player.state}`);
              // Try to reconnect if play fails
              try {
                await player.connect();
                await player.play();
              } catch (reconnectErr) {
                logger.error(`[Autoplay] Reconnect and play failed: ${reconnectErr?.message}`);
              }
            }
          }
          if (channel) {
            const c = new ContainerBuilder().setAccentColor(0x2B2D31);
            c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.sparkle} Autoplay`));
            c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
            c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
              `${e.play} **[${pick.title}](${pick.uri})**\n` +
              `${e.mic} ${pick.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(pick.length)}\n\n` +
              `> ${e.info} Auto-queued based on **${player._lastTrack.title}**`
            ));
            c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
              `-# ${e.sparkle} Autoplay active  ${e.dot}  \`${prefix}autoplay\` to disable`
            ));
            await channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
          }
          return;
        }
        logger.warn(`[Autoplay] No suitable candidates for guild ${player.guildId} — stopping`);
      } catch (err) {
        logger.error(`[Autoplay] Error in guild ${player.guildId}: ${err?.message || String(err)}`);
      }
    }

    if (isAlwaysOn) {
      if (channel) {
        const c = new ContainerBuilder().setAccentColor(0x2B2D31);
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.headphones} Queue Ended — 24/7 Active`));
        c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `The queue is empty. Staying in the voice channel because **24/7 mode** is enabled.\n\n` +
          `${e.dot} **Tracks played:** \`${stats.tracksPlayed}\`\n` +
          `${e.dot} **Total duration:** \`${formatDuration(stats.totalDuration)}\`\n\n` +
          `${e.play} Add more music with \`${prefix}play <song>\`\n` +
          `${e.info} Disable 24/7 mode: \`${prefix}247\``
        ));
        c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${e.diamond} Chiku by ApeX Development`));
        await channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }
      return;
    }

    if (channel) {
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot+applications.commands&permissions=8`;
      const c = new ContainerBuilder().setAccentColor(0x2B2D31);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.cd} Session Ended`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `The queue has finished. Thanks for listening!\n\n` +
        `${e.list} **Tracks played:** \`${stats.tracksPlayed}\`\n` +
        `${e.time} **Total playtime:** \`${formatDuration(stats.totalDuration)}\`\n` +
        `${e.headphones} **Session length:** \`${formatUptime(sessionLen)}\``
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# ${e.music} Chiku by ApeX Development`
      ));
      c.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Invite Chiku").setEmoji(e.link).setStyle(ButtonStyle.Link).setURL(inviteUrl)
        )
      );
      await channel.send({ components: [c], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

    setTimeout(() => {
      if (player.state !== PlayerState.DESTROYED) player.destroy().catch(() => {});
    }, 2000);
  },
};
