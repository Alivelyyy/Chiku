const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { getPlayer, getEQPresets } = require("@plugins/player");
const { eqPresetButtons } = require("@plugins/button");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

const PRESET_DESCRIPTIONS = {
  flat:      `${e.equalizer} **Flat** — Clean, unmodified audio. Default Lavalink output.`,
  bassboost: `${e.equalizer} **Bass Boost** — Amplifies low frequencies for a deep, punchy sound.`,
  treble:    `${e.equalizer} **Treble** — Boosts high frequencies for crisp, bright audio.`,
  pop:       `${e.equalizer} **Pop** — Balanced mid-boost that suits vocals and pop music perfectly.`,
  rock:      `${e.equalizer} **Rock** — Strong lows and highs for that punchy guitar sound.`,
  jazz:      `${e.equalizer} **Jazz** — Warm, balanced tone that brings out the subtlety of jazz.`,
  metal:     `${e.equalizer} **Metal** — Heavy low-mid boost with sharp treble for metal tracks.`,
};

module.exports = {
  name: "equalizer",
  aliases: ["eq", "eqpreset"],
  cooldown: "3",
  category: "music",
  usage: "[preset]",
  description: "View and apply professional EQ presets. Runs without args for the panel.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player  = getPlayer(client, message.guild.id);
    const presets = getEQPresets();

    if (args[0]) {
      const name = args[0].toLowerCase();
      if (!presets[name]) {
        return message.reply(send(error(
          `${e.warn} Unknown preset: \`${name}\`\n` +
          `Available: \`${Object.keys(presets).join("`, `")}\``
        )));
      }
      await player.shoukaku.setFilters(presets[name]);
      player._currentEQ = name === "flat" ? null : name;

      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.equalizer} Equalizer`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        name === "flat"
          ? `${e.yes} Equalizer **reset** to flat (no EQ applied).`
          : `${e.yes} Applied the **${name.charAt(0).toUpperCase() + name.slice(1)}** EQ preset.\n\n${PRESET_DESCRIPTIONS[name]}`
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# Active EQ: **${player._currentEQ || "Flat"}**  ${e.dot}  Changed by ${message.author.tag}`
      ));
      const [r1, r2] = eqPresetButtons(player._currentEQ || "flat");
      c.addActionRowComponents(r1, r2);
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const active = player._currentEQ || "flat";
    const descList = Object.entries(PRESET_DESCRIPTIONS).map(([, v]) => v).join("\n");

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.equalizer} Equalizer Presets`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(descList));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# Active: **${active.charAt(0).toUpperCase() + active.slice(1)}**  ${e.dot}  Click a button or use \`${client.getPrefix(message.guild.id)}eq <preset>\``
    ));

    const [r1, r2] = eqPresetButtons(active);
    c.addActionRowComponents(r1, r2);

    const m = await message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });

    const collector = m.createMessageComponentCollector({
      filter: async (i) => {
        if (i.user.id !== message.author.id) {
          await i.reply({ content: `${e.no} Only **${message.author.tag}** can use this panel.`, ephemeral: true }).catch(() => {});
          return false;
        }
        return i.customId.startsWith("eq_");
      },
      time: 60000,
      idle: 30000,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});
      const preset = interaction.customId.replace("eq_", "");
      const p2     = getPlayer(client, interaction.guildId);
      if (!p2) return;
      const targetPreset = preset === "reset" ? "flat" : preset;
      await p2.shoukaku.setFilters(presets[targetPreset] || {});
      p2._currentEQ = targetPreset === "flat" ? null : targetPreset;

      const activeNow = p2._currentEQ || "flat";
      const [nr1, nr2] = eqPresetButtons(activeNow);
      const nc = new ContainerBuilder().setAccentColor(0x9B59B6);
      nc.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.equalizer} Equalizer Presets`));
      nc.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      nc.addTextDisplayComponents(new TextDisplayBuilder().setContent(descList));
      nc.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      nc.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.yes} Switched to **${activeNow.charAt(0).toUpperCase() + activeNow.slice(1)}** preset.\n` +
        `-# Changed by ${interaction.user.tag}`
      ));
      nc.addActionRowComponents(nr1, nr2);
      await m.edit({ components: [nc], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    });

    collector.on("end", () => {
      m.edit({ components: [] }).catch(() => {});
    });
  },
};
