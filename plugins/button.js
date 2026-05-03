const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const e = require("@assets/emojis/black.js");

function npControls(player) {
  const isPaused = player?.paused ?? false;
  const loopMode = player?.loop ?? "none";

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("np_previous")
      .setEmoji(e.previous)
      .setLabel("Prev")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("np_pause")
      .setEmoji(isPaused ? e.play : e.pause)
      .setLabel(isPaused ? "Resume" : "Pause")
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("np_skip")
      .setEmoji(e.skip)
      .setLabel("Skip")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("np_stop")
      .setEmoji(e.stop)
      .setLabel("Stop")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("np_loop")
      .setEmoji(loopMode === "track" ? e.loopOne : e.loop)
      .setLabel(loopMode === "none" ? "Loop" : loopMode === "track" ? "Loop: Song" : "Loop: Queue")
      .setStyle(loopMode !== "none" ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("np_shuffle")
      .setEmoji(e.shuffle)
      .setLabel("Shuffle")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("np_voldown")
      .setEmoji(e.volumeDown)
      .setLabel("Vol −")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("np_volup")
      .setEmoji(e.volume)
      .setLabel("Vol +")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("np_queue")
      .setEmoji(e.queue)
      .setLabel("Queue")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("np_lyrics")
      .setEmoji(e.lyrics)
      .setLabel("Lyrics")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
}

function queueNav(page, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`queue_prev_${page}`)
      .setEmoji(e.previous)
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`queue_page_${page}`)
      .setLabel(`${page} / ${totalPages}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`queue_next_${page}`)
      .setEmoji(e.skip)
      .setLabel("Next")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages)
  );
}

function searchResults(tracks) {
  const row  = new ActionRowBuilder();
  const nums = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
  tracks.slice(0, 5).forEach((_, i) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`search_${i}`)
        .setEmoji(nums[i])
        .setStyle(ButtonStyle.Secondary)
    );
  });
  row.addComponents(
    new ButtonBuilder()
      .setCustomId("search_cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)
  );
  return row;
}

function filterButtons(activeFilter) {
  const filters = [
    { id: "bassboost", label: "Bass",     emoji: "🔈" },
    { id: "nightcore", label: "Nightcore",emoji: "⬆️" },
    { id: "vaporwave", label: "Vaporwave",emoji: "⬇️" },
    { id: "8d",        label: "8D Audio", emoji: "🌀" },
    { id: "karaoke",   label: "Karaoke",  emoji: "🎤" },
    { id: "reset",     label: "Reset",    emoji: "✖️" },
  ];

  const row = new ActionRowBuilder();
  filters.forEach(({ id, label, emoji: em }) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`filter_${id}`)
        .setEmoji(em)
        .setLabel(label)
        .setStyle(
          id === "reset"        ? ButtonStyle.Danger
          : id === activeFilter ? ButtonStyle.Success
          :                       ButtonStyle.Secondary
        )
    );
  });
  return [row];
}

function eqPresetButtons(activePreset) {
  const presets  = [
    { id: "flat",      label: "Flat"   },
    { id: "bassboost", label: "Bass"   },
    { id: "treble",    label: "Treble" },
    { id: "pop",       label: "Pop"    },
    { id: "rock",      label: "Rock"   },
  ];
  const presets2 = [
    { id: "jazz",      label: "Jazz"   },
    { id: "metal",     label: "Metal"  },
  ];

  const row1 = new ActionRowBuilder();
  presets.forEach(({ id, label }) => {
    row1.addComponents(
      new ButtonBuilder()
        .setCustomId(`eq_${id}`)
        .setLabel(label)
        .setStyle(id === activePreset ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  });

  const row2 = new ActionRowBuilder();
  presets2.forEach(({ id, label }) => {
    row2.addComponents(
      new ButtonBuilder()
        .setCustomId(`eq_${id}`)
        .setLabel(label)
        .setStyle(id === activePreset ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  });
  row2.addComponents(
    new ButtonBuilder()
      .setCustomId("eq_reset")
      .setLabel("Reset All")
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2];
}

function voteskipButtons(yesCount, noCount, needed) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voteskip_yes")
      .setLabel(`✅  Yes  (${yesCount}/${needed})`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("voteskip_no")
      .setLabel(`❌  No  (${noCount})`)
      .setStyle(ButtonStyle.Danger)
  );
}

module.exports = {
  npControls,
  queueNav,
  searchResults,
  filterButtons,
  eqPresetButtons,
  voteskipButtons,
};
