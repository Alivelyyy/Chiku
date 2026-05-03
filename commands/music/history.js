const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "history",
  aliases: ["recent", "played"],
  cooldown: "3",
  category: "music",
  usage: "",
  description: "View recently played tracks in this session.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const player  = getPlayer(client, message.guild.id);
    const history = player.queue?.previous;

    if (!history?.length) {
      return message.reply(send(error(
        `${e.history} No track history yet for this session.\n` +
        `-# Play some tracks to build up a history.`
      )));
    }

    const tracks  = [...history].reverse();
    const perPage = 10;
    let page      = 1;
    const totalPages = Math.ceil(tracks.length / perPage);

    function buildPage(p) {
      const start = (p - 1) * perPage;
      const slice = tracks.slice(start, start + perPage);
      const lines = slice.map((t, i) => {
        const num = start + i + 1;
        const dur = t.isStream ? "🔴 LIVE" : formatDuration(t.length);
        return (
          `\`${String(num).padStart(2, "0")}.\` **[${t.title}](${t.uri})** \`${dur}\`\n` +
          `> ${e.mic} ${t.author || "Unknown"}  ${e.dot}  ${t.requester || "Unknown"}`
        );
      });

      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.history} Track History`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n\n")));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# ${e.list} ${tracks.length} track${tracks.length !== 1 ? "s" : ""} played this session  ${e.dot}  Page ${p}/${totalPages}`
      ));

      if (totalPages > 1) {
        c.addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("hist_prev")
              .setEmoji(e.previous)
              .setLabel("Prev")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(p <= 1),
            new ButtonBuilder()
              .setCustomId("hist_page")
              .setLabel(`${p} / ${totalPages}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("hist_next")
              .setEmoji(e.skip)
              .setLabel("Next")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(p >= totalPages)
          )
        );
      }
      return c;
    }

    const m = await message.reply({
      components: [buildPage(page)],
      flags: MessageFlags.IsComponentsV2,
    });

    if (totalPages <= 1) return;

    const collector = m.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 90000,
      idle: 45000,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});
      if (interaction.customId === "hist_prev") page = Math.max(1, page - 1);
      if (interaction.customId === "hist_next") page = Math.min(totalPages, page + 1);
      await m.edit({ components: [buildPage(page)], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    });

    collector.on("end", () => {
      m.edit({ components: [] }).catch(() => {});
    });
  },
};
