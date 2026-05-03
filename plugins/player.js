const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");
const { formatDuration, formatProgressBar, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

function getPlayer(client, guildId) {
  return client.kazagumo?.players?.get(guildId) || null;
}

function _getArtwork(track) {
  return track.thumbnail || extractYTThumbnail(track.uri) || null;
}

function _loopLabel(loop) {
  if (loop === "track") return `${e.loopOne} Track`;
  if (loop === "queue") return `${e.loop} Queue`;
  return "Off";
}

function buildNowPlayingBody(player) {
  const track = player.queue?.current;
  if (!track) return null;

  const position = player.shoukaku?.position ?? 0;
  const duration = track.length ?? 0;
  const bar      = formatProgressBar(position, duration, 26);
  const posStr   = formatDuration(position);
  const durStr   = track.isStream ? "🔴 LIVE" : formatDuration(duration);
  const vol      = player.volume ?? 100;
  const volEmoji = vol === 0 ? e.volumeMute : vol < 50 ? e.volumeDown : e.volume;
  const state    = player.paused ? `${e.paused} Paused` : `${e.playing} Playing`;

  return (
    `**[${track.title}](${track.uri})**\n` +
    `${e.mic} ${track.author || "Unknown"}\n\n` +
    `\`${bar}\`\n` +
    `-# ${posStr} ${e.dash} ${durStr}\n\n` +
    `${state}  ${e.dot}  ${e.loop} ${_loopLabel(player.loop)}  ${e.dot}  ${volEmoji} \`${vol}%\``
  );
}

function buildNPContainer(player) {
  const { npControls } = require("@plugins/button");
  const track = player.queue?.current;
  if (!track) return null;

  const position = player.shoukaku?.position ?? 0;
  const duration = track.length ?? 0;
  const bar      = formatProgressBar(position, duration, 28);
  const posStr   = formatDuration(position);
  const durStr   = track.isStream ? "🔴 LIVE" : formatDuration(duration);
  const vol      = player.volume ?? 100;
  const volEmoji = vol === 0 ? e.volumeMute : vol < 50 ? e.volumeDown : e.volume;
  const state    = player.paused ? `${e.pause} **Paused**` : `${e.play} **Playing**`;
  const qSize    = player.queue?.length ?? 0;
  const color    = player.paused ? 0xFEE75C : 0x9B59B6;
  const artwork  = _getArtwork(track);

  const c = new ContainerBuilder().setAccentColor(color);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.cd} Now Playing`)
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
            `-# ${e.mic} ${track.author || "Unknown Artist"}`
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
    );
  } else {
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**[${track.title}](${track.uri})**\n` +
        `-# ${e.mic} ${track.author || "Unknown Artist"}`
      )
    );
  }

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `\`${bar}\`\n` +
      `-# ${e.rewind} ${posStr}  ${e.dash}  ${durStr} ${e.forward}`
    )
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${state}  ${e.dot}  ${e.loop} ${_loopLabel(player.loop)}  ${e.dot}  ${volEmoji} \`${vol}%\``
    )
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${e.queue} ${qSize} track${qSize !== 1 ? "s" : ""} up next  ${e.dot}  ${e.headphones} ${track.requester}`
    )
  );

  const [row1, row2] = npControls(player);
  c.addActionRowComponents(row1, row2);
  return c;
}

function buildTrackStartCard(player) {
  const { npControls } = require("@plugins/button");
  const track = player.queue?.current;
  if (!track) return null;

  const duration = track.length ?? 0;
  const bar      = formatProgressBar(0, duration, 28);
  const durStr   = track.isStream ? "🔴 LIVE" : formatDuration(duration);
  const vol      = player.volume ?? 100;
  const qSize    = player.queue?.length ?? 0;
  const artwork  = _getArtwork(track);

  const c = new ContainerBuilder().setAccentColor(0x9B59B6);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.play} Now Playing`)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (artwork) {
    try {
      const gallery = new MediaGalleryBuilder()
        .addItems(
          new MediaGalleryItemBuilder().setURL(artwork)
        );
      c.addMediaGalleryComponents(gallery);
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown Artist"}  ${e.dot}  ${e.time} ${durStr}`
        )
      );
    } catch {
      c.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${track.title}](${track.uri})**\n` +
              `-# ${e.mic} ${track.author || "Unknown Artist"}  ${e.dot}  ${e.time} ${durStr}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    }
  } else {
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**[${track.title}](${track.uri})**\n` +
        `-# ${e.mic} ${track.author || "Unknown Artist"}  ${e.dot}  ${e.time} ${durStr}`
      )
    );
  }

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `\`${bar}\`\n` +
      `-# 0:00  ${e.dash}  ${durStr}`
    )
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${e.play} **Playing**  ${e.dot}  ${e.loop} Loop: ${_loopLabel(player.loop)}  ${e.dot}  ${e.volume} \`${vol}%\``
    )
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${e.queue} ${qSize} track${qSize !== 1 ? "s" : ""} up next  ${e.dot}  ${e.headphones} Requested by ${track.requester}`
    )
  );

  const [row1, row2] = npControls(player);
  c.addActionRowComponents(row1, row2);
  return c;
}

function buildQueueText(queue, page = 1, perPage = 10) {
  const tracks     = [...queue];
  const totalPages = Math.ceil(tracks.length / perPage) || 1;
  const start      = (page - 1) * perPage;
  const slice      = tracks.slice(start, start + perPage);

  if (!slice.length) return { text: `${e.info} No tracks in the queue.`, totalPages };

  const lines = slice.map((t, i) => {
    const num = start + i + 1;
    const dur = t.isStream ? "🔴 LIVE" : formatDuration(t.length);
    return (
      `\`${String(num).padStart(2, "0")}.\` **[${t.title}](${t.uri})** \`${dur}\`\n` +
      `> ${e.mic} ${t.author || "Unknown"}  ${e.dot}  ${t.requester}`
    );
  });

  return { text: lines.join("\n\n"), totalPages };
}

function getFilters() {
  return {
    bassboost: {
      equalizer: [
        { band: 0, gain: 0.6 },  { band: 1, gain: 0.7 },
        { band: 2, gain: 0.8 },  { band: 3, gain: 0.55 },
        { band: 4, gain: 0.25 }, { band: 5, gain: 0.0 },
        { band: 6, gain: -0.25 },{ band: 7, gain: -0.45 },
        { band: 8, gain: -0.55 },{ band: 9, gain: -0.7 },
        { band: 10, gain: -0.3 },{ band: 11, gain: -0.25 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 },
        { band: 14, gain: 0.0 },
      ],
    },
    nightcore:  { timescale: { speed: 1.2, pitch: 1.2, rate: 1.0 } },
    vaporwave:  {
      timescale: { speed: 0.85, pitch: 0.85, rate: 1.0 },
      equalizer: [{ band: 0, gain: 0.3 }, { band: 1, gain: 0.3 }],
    },
    "8d":       { rotation: { rotationHz: 0.2 } },
    karaoke:    { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
    soft:       { lowPass: { smoothing: 20.0 } },
    reset:      {},
  };
}

function getEQPresets() {
  return {
    flat:       { equalizer: Array.from({ length: 15 }, (_, b) => ({ band: b, gain: 0.0 })) },
    bassboost:  {
      equalizer: [
        { band: 0, gain: 0.6 }, { band: 1, gain: 0.7 }, { band: 2, gain: 0.8 },
        { band: 3, gain: 0.55 }, { band: 4, gain: 0.25 }, { band: 5, gain: 0.0 },
        { band: 6, gain: -0.25 }, { band: 7, gain: -0.45 }, { band: 8, gain: -0.55 },
        { band: 9, gain: -0.7 }, { band: 10, gain: -0.3 }, { band: 11, gain: -0.25 },
        { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 },
      ],
    },
    treble:     {
      equalizer: [
        { band: 0, gain: -0.3 }, { band: 1, gain: -0.2 }, { band: 2, gain: -0.1 },
        { band: 3, gain: 0.0 },  { band: 4, gain: 0.1 },  { band: 5, gain: 0.2 },
        { band: 6, gain: 0.3 },  { band: 7, gain: 0.4 },  { band: 8, gain: 0.5 },
        { band: 9, gain: 0.5 },  { band: 10, gain: 0.5 }, { band: 11, gain: 0.5 },
        { band: 12, gain: 0.5 }, { band: 13, gain: 0.4 }, { band: 14, gain: 0.4 },
      ],
    },
    pop:        {
      equalizer: [
        { band: 0, gain: 0.2 }, { band: 1, gain: 0.3 }, { band: 2, gain: 0.25 },
        { band: 3, gain: 0.15 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.1 },
        { band: 6, gain: -0.1 }, { band: 7, gain: 0.1 }, { band: 8, gain: 0.25 },
        { band: 9, gain: 0.3 }, { band: 10, gain: 0.3 }, { band: 11, gain: 0.2 },
        { band: 12, gain: 0.1 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 },
      ],
    },
    rock:       {
      equalizer: [
        { band: 0, gain: 0.5 }, { band: 1, gain: 0.4 }, { band: 2, gain: 0.3 },
        { band: 3, gain: 0.1 }, { band: 4, gain: -0.1 }, { band: 5, gain: -0.2 },
        { band: 6, gain: -0.1 }, { band: 7, gain: 0.1 }, { band: 8, gain: 0.2 },
        { band: 9, gain: 0.3 }, { band: 10, gain: 0.4 }, { band: 11, gain: 0.4 },
        { band: 12, gain: 0.3 }, { band: 13, gain: 0.2 }, { band: 14, gain: 0.1 },
      ],
    },
    jazz:       {
      equalizer: [
        { band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.1 },
        { band: 3, gain: 0.0 }, { band: 4, gain: -0.1 }, { band: 5, gain: 0.1 },
        { band: 6, gain: 0.2 }, { band: 7, gain: 0.1 }, { band: 8, gain: 0.0 },
        { band: 9, gain: -0.1 }, { band: 10, gain: 0.0 }, { band: 11, gain: 0.1 },
        { band: 12, gain: 0.2 }, { band: 13, gain: 0.3 }, { band: 14, gain: 0.2 },
      ],
    },
    metal:      {
      equalizer: [
        { band: 0, gain: 0.4 }, { band: 1, gain: 0.3 }, { band: 2, gain: 0.1 },
        { band: 3, gain: -0.1 }, { band: 4, gain: -0.2 }, { band: 5, gain: 0.0 },
        { band: 6, gain: 0.2 }, { band: 7, gain: 0.4 }, { band: 8, gain: 0.5 },
        { band: 9, gain: 0.5 }, { band: 10, gain: 0.4 }, { band: 11, gain: 0.3 },
        { band: 12, gain: 0.2 }, { band: 13, gain: 0.1 }, { band: 14, gain: 0.0 },
      ],
    },
  };
}

module.exports = {
  getPlayer,
  buildNowPlayingBody,
  buildNPContainer,
  buildTrackStartCard,
  buildQueueText,
  getFilters,
  getEQPresets,
};
