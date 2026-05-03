const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { getPlayer, getFilters } = require("@plugins/player");
const { filterButtons } = require("@plugins/button");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

const FILTER_DESCRIPTIONS = {
  bassboost: `${e.equalizer} **Bass Boost** — Amplifies low frequencies for a heavy bass effect.`,
  nightcore: `⬆️ **Nightcore** — Speeds up and raises the pitch for an energetic feel.`,
  vaporwave: `⬇️ **Vaporwave** — Slows down and lowers the pitch for a dreamy aesthetic.`,
  "8d": `🌀 **8D Audio** — Rotates audio for an immersive surround-sound experience.`,
  karaoke: `${e.mic} **Karaoke** — Removes the main vocal channel from the track.`,
  soft: `🌊 **Soft** — Applies a low-pass filter for a mellow, gentle sound.`,
  reset: `${e.close} **Reset** — Removes all applied filters and restores default audio.`,
};

module.exports = {
  name: "filter",
  aliases: ["filters", "fx", "effect"],
  cooldown: "3",
  category: "music",
  usage: "[filter name]",
  description: "Apply or remove an audio filter. Run without arguments to see the filter panel.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: true,
  queue: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    const filters = getFilters();

    if (!args[0]) {
      const active = player._currentFilter || null;
      const filterList = Object.entries(FILTER_DESCRIPTIONS)
        .filter(([k]) => k !== "reset")
        .map(([, v]) => v)
        .join("\n");
      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.filter} Audio Filters`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(filterList));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.info} You can also use \`${client.getPrefix(message.guild.id)}filter <name>\` directly.\n-# Currently active: **${active ? active : "None"}**`));
      const [fRow] = filterButtons(active);
      c.addActionRowComponents(fRow);
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const filterName = args[0].toLowerCase().replace(/ /g, "");
    if (!filters[filterName]) return message.reply(send(error(`${e.warn} Unknown filter: \`${filterName}\`\nAvailable: \`${Object.keys(filters).join("`, `")}\``)));

    if (filterName === "reset") {
      await player.shoukaku.setFilters({});
      player._currentFilter = null;
    } else {
      await player.shoukaku.setFilters(filters[filterName]);
      player._currentFilter = filterName;
    }

    const [fRow] = filterButtons(player._currentFilter);
    const active = player._currentFilter;
    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.filter} Audio Filters`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(filterName === "reset" ? `${e.yes} All filters have been **reset** to default audio.` : `${e.yes} Applied the **${filterName}** filter.\n\n${FILTER_DESCRIPTIONS[filterName]}`));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Active: **${active || "None"}** • Changed by ${message.author.tag}`));
    c.addActionRowComponents(fRow);
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};