const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");

const CATEGORIES = {
  music: { label: "Music", emoji: e.music, color: 0x9B59B6 },
  filters: { label: "Filters", emoji: e.filter, color: 0x9B59B6 },
  playlist: { label: "Playlist", emoji: e.queue, color: 0x9B59B6 },
  premium: { label: "Premium", emoji: e.diamond, color: 0x9B59B6 },
  config: { label: "Config", emoji: e.cog, color: 0x9B59B6 },
  utility: { label: "Utility", emoji: e.stats, color: 0x9B59B6 },
  information: { label: "Info", emoji: e.info, color: 0x9B59B6 },
  owner: { label: "Owner", emoji: e.crown, color: 0x9B59B6 },
};

const CATEGORY_DESCS = {
  music: "Playback, queue, search, autoplay, and audio controls.",
  filters: "Bass boost, nightcore, 8D, karaoke, pitch, and more.",
  playlist: "Create, load, and manage your saved playlists.",
  premium: "Premium-only controls and quality-of-life features.",
  config: "Prefix, DJ role, music channel, and 24/7 mode.",
  utility: "Stats, ping, uptime, invite, vote, and support.",
  information: "General information about Chiku.",
  owner: "Owner tools for maintenance and bot control.",
};

function buildMainPage(client, message) {
  const prefix = client.getPrefix(message.guild.id);
  const isOwner = client.owners.includes(message.author.id);
  const avatarURL = client.user.displayAvatarURL({ extension: "png", size: 256 });
  const categories = {};

  client.commands.forEach((cmd) => {
    const cat = cmd.category || "utility";
    if (cat === "owner" && !isOwner) return;
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const total = client.commands.size;
  const catLines = Object.entries(categories).map(([cat, count]) => {
    const data = CATEGORIES[cat] || { label: cat, emoji: e.dot };
    const desc = CATEGORY_DESCS[cat] || "No description.";
    return `${data.emoji} **${data.label}** \`${count}\`\n> ${desc}`;
  }).join("\n\n");

  const c = new ContainerBuilder().setAccentColor(0x9B59B6);
  c.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.music} Chiku Help Center\n-# Use \`${prefix}help <command>\` or \`${prefix}help <category>\``)).setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL)));
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(catLines));
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${e.bot} ${total} commands  ${e.dot}  Prefix: \`${prefix}\``));

  const row1 = new ActionRowBuilder();
  const row2 = new ActionRowBuilder();
  ["music", "filters", "playlist", "premium", "config"].forEach((cat) => {
    if (categories[cat]) row1.addComponents(new ButtonBuilder().setCustomId(`help_${cat}`).setEmoji(CATEGORIES[cat].emoji).setLabel(CATEGORIES[cat].label).setStyle(ButtonStyle.Secondary));
  });
  ["utility", "information"].forEach((cat) => {
    if (categories[cat]) row2.addComponents(new ButtonBuilder().setCustomId(`help_${cat}`).setEmoji(CATEGORIES[cat].emoji).setLabel(CATEGORIES[cat].label).setStyle(ButtonStyle.Secondary));
  });
  if (isOwner && categories.owner) row2.addComponents(new ButtonBuilder().setCustomId("help_owner").setEmoji(CATEGORIES.owner.emoji).setLabel(CATEGORIES.owner.label).setStyle(ButtonStyle.Secondary));
  row2.addComponents(new ButtonBuilder().setCustomId("help_close").setEmoji(e.close).setLabel("Close").setStyle(ButtonStyle.Danger));
  if (row1.components.length) c.addActionRowComponents(row1);
  if (row2.components.length) c.addActionRowComponents(row2);
  return c;
}

function buildCategoryPage(client, categoryKey, prefix) {
  const data = CATEGORIES[categoryKey] || { label: categoryKey, emoji: e.dot, color: 0x9B59B6 };
  const cmds = client.commands.filter((c) => (c.category || "utility") === categoryKey);
  const lines = cmds.map((cmd) => {
    const usage = cmd.usage ? ` ${cmd.usage}` : "";
    const aliases = cmd.aliases?.length ? ` *(also: ${cmd.aliases.map((a) => `\`${prefix}${a}\``).join(", ")})*` : "";
    return `\`${prefix}${cmd.name}${usage}\`${aliases}\n> ${cmd.description || "No description."}`;
  });
  const c = new ContainerBuilder().setAccentColor(data.color);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${data.emoji} ${data.label} Commands\n-# ${CATEGORY_DESCS[categoryKey] || ""}`));
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  for (let i = 0; i < lines.length; i += 8) {
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.slice(i, i + 8).join("\n\n")));
    if (i + 8 < lines.length) c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  }
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${e.list} ${cmds.size} commands  ${e.dot}  \`${prefix}help <command>\` for details`));
  c.addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("help_back").setEmoji(e.previous).setLabel("Back").setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId("help_close").setEmoji(e.close).setLabel("Close").setStyle(ButtonStyle.Danger)));
  return c;
}

function buildCommandPage(cmd, prefix) {
  const flags = [cmd.inVoiceChannel ? `${e.headphones} Voice Required` : null, cmd.sameVoiceChannel ? `${e.headphones} Same VC` : null, cmd.player ? `${e.music} Player Required` : null, cmd.premium ? `${e.diamond} Premium Only` : null, cmd.owner ? `${e.crown} Owner Only` : null, cmd.vote ? `${e.star} Vote Required` : null].filter(Boolean);
  const cat = CATEGORIES[cmd.category || "utility"] || { label: "Utility", emoji: e.dot, color: 0x9B59B6 };
  const usage = cmd.usage ? ` ${cmd.usage}` : "";
  const aliases = cmd.aliases?.length ? cmd.aliases.map((a) => `\`${prefix}${a}\``).join(", ") : "None";
  const c = new ContainerBuilder().setAccentColor(cat.color);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.info} \`${prefix}${cmd.name}\`\n-# ${cat.emoji} ${cat.label} command`));
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.arrow} **Description:** ${cmd.description || "No description."}\n\n${e.dot} **Syntax:** \`${prefix}${cmd.name}${usage}\`\n${e.dot} **Aliases:** ${aliases}\n${e.dot} **Cooldown:** ${cmd.cooldown ? `\`${cmd.cooldown}s\`` : "None"}`));
  if (flags.length) {
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(flags.join(`  ${e.dot}  `)));
  }
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Chiku by ApeX Development  ${e.dot}  Use \`${prefix}help\` for the full list`));
  c.addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("help_back").setEmoji(e.previous).setLabel("Back").setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId("help_close").setEmoji(e.close).setLabel("Close").setStyle(ButtonStyle.Danger)));
  return c;
}

module.exports = { name: "help", aliases: ["h", "commands", "cmds"], cooldown: "3", category: "utility", usage: "[command / category]", description: "View all commands or get detailed info on a specific command.", args: false, vote: false, new: false, admin: false, owner: false, premium: false, botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false, execute: async (client, message, args) => {
  const prefix = client.getPrefix(message.guild.id);
  if (args[0]) {
    const input = args[0].toLowerCase();
    const cmd = client.commands.get(input) || client.commands.get(client.aliases.get(input));
    if (cmd) return startCollector(client, message, await message.reply({ components: [buildCommandPage(cmd, prefix)], flags: MessageFlags.IsComponentsV2 }), null, prefix, cmd);
    if (CATEGORIES[input]) return startCollector(client, message, await message.reply({ components: [buildCategoryPage(client, input, prefix)], flags: MessageFlags.IsComponentsV2 }), input, prefix, null);
    const { send, error } = require("@plugins/embed");
    return message.reply(send(error(`${e.search} No command or category found for \`${input}\`.`)));
  }
  const m = await message.reply({ components: [buildMainPage(client, message)], flags: MessageFlags.IsComponentsV2 });
  startCollector(client, message, m, null, prefix, null);
}, };

function startCollector(client, message, m, currentCat, prefix, currentCmd) {
  const collector = m.createMessageComponentCollector({ filter: async (i) => {
    if (i.user.id !== message.author.id) { await i.reply({ content: `${e.no} Only **${message.author.tag}** can navigate this help menu.`, ephemeral: true }).catch(() => {}); return false; }
    return true;
  }, time: 120000, idle: 60000 });
  collector.on("collect", async (interaction) => {
    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate().catch(() => {});
    const id = interaction.customId;
    if (id === "help_close") return collector.stop("closed") && m.delete().catch(() => {});
    if (id === "help_back") return m.edit({ components: [currentCmd ? (currentCat ? buildCategoryPage(client, currentCat, prefix) : buildMainPage(client, message)) : buildMainPage(client, message)], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    if (id.startsWith("help_")) { const cat = id.replace("help_", ""); if (CATEGORIES[cat]) { currentCat = cat; currentCmd = null; await m.edit({ components: [buildCategoryPage(client, cat, prefix)], flags: MessageFlags.IsComponentsV2 }).catch(() => {}); } }
  });
  collector.on("end", (_, reason) => { if (reason !== "closed") m.edit({ components: [] }).catch(() => {}); });
}