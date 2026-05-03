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
const { formatNumber } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

const PER_PAGE = 12;

function buildPage(guilds, page) {
  const totalPages  = Math.ceil(guilds.length / PER_PAGE);
  const slice       = guilds.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalUsers  = guilds.reduce((a, g) => a + g.memberCount, 0);
  const totalVoice  = guilds.reduce((a, g) => a + (g.voiceStates?.cache?.size ?? 0), 0);

  const lines = slice.map((g, i) => {
    const num = (page - 1) * PER_PAGE + i + 1;
    return (
      `\`${String(num).padStart(2, "0")}.\` **${g.name}**\n` +
      `> ${e.users} \`${formatNumber(g.memberCount)}\` members  ${e.dot}  \`${g.id}\`  ${e.dot}  ${g.preferredLocale}`
    );
  });

  const c = new ContainerBuilder().setAccentColor(0x5865F2);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.list} Server List — Page ${page}/${totalPages}`)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(lines.join("\n\n"))
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${e.globe} \`${formatNumber(guilds.length)}\` total servers  ${e.dot}  ` +
      `${e.users} \`${formatNumber(totalUsers)}\` total users  ${e.dot}  ` +
      `${e.headphones} \`${totalVoice}\` in voice\n` +
      `-# Page ${page}/${totalPages}  ${e.dot}  Sorted by member count`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("servers_prev")
      .setEmoji(e.previous)
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId("servers_info")
      .setLabel(`${page} / ${totalPages}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("servers_next")
      .setEmoji(e.skip)
      .setLabel("Next")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages)
  );
  c.addActionRowComponents(row);
  return { container: c, totalPages };
}

module.exports = {
  name: "servers",
  aliases: ["guilds", "serverlist"],
  cooldown: "",
  category: "owner",
  usage: "[page]",
  description: "List all servers the bot is in. Owner only.",
  args: false, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const guilds = [...client.guilds.cache.values()].sort((a, b) => b.memberCount - a.memberCount);
    let page     = Math.max(1, parseInt(args[0]) || 1);

    const { container, totalPages } = buildPage(guilds, page);
    const m = await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    if (totalPages <= 1) return;

    const collector = m.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id && i.customId.startsWith("servers_"),
      time: 120000,
      idle: 60000,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});
      if (interaction.customId === "servers_prev") page = Math.max(1, page - 1);
      if (interaction.customId === "servers_next") page = Math.min(totalPages, page + 1);
      const { container: updated } = buildPage(guilds, page);
      await m.edit({ components: [updated], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    });

    collector.on("end", () => {
      m.edit({ components: [] }).catch(() => {});
    });
  },
};
