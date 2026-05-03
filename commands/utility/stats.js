const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");
const { formatUptime, formatNumber } = require("@utils/formatters");
const counts = require("@utils/codestats.js");

module.exports = {
  name: "stats",
  aliases: ["statistics", "botstats", "botinfo"],
  cooldown: "10",
  category: "utility",
  usage: "",
  description: "View detailed real-time statistics about Chiku.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const avatarURL = client.user.displayAvatarURL({ extension: "png", size: 256 });

    const mem        = process.memoryUsage();
    const memUsed    = (mem.heapUsed  / 1024 / 1024).toFixed(1);
    const memTotal   = (mem.heapTotal / 1024 / 1024).toFixed(1);
    const memRss     = (mem.rss       / 1024 / 1024).toFixed(1);
    const uptime     = formatUptime(process.uptime() * 1000);
    const guilds     = client.guilds.cache.size;
    const users      = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const channels   = client.channels.cache.size;
    const players    = client.kazagumo?.players?.size ?? 0;
    const cmdCount   = client.commands.size;
    const ping       = client.ws.ping;
    const djs        = require("discord.js").version;
    const node       = process.version;

    const c = new ContainerBuilder().setAccentColor(0x5865F2);

    c.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${e.stats} Chiku — Statistics\n` +
            `-# Open-source Discord music bot by ApeX Development`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(avatarURL)
        )
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${e.globe} Community**\n` +
        `${e.dot} Servers: \`${formatNumber(guilds)}\`\n` +
        `${e.dot} Users: \`${formatNumber(users)}\`\n` +
        `${e.dot} Channels: \`${formatNumber(channels)}\``
      )
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${e.music} Music**\n` +
        `${e.dot} Active Players: \`${players}\`\n` +
        `${e.dot} Commands Loaded: \`${cmdCount}\`\n` +
        `${e.dot} Latency: \`${ping}ms\``
      )
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${e.cpu} System**\n` +
        `${e.dot} Uptime: \`${uptime}\`\n` +
        `${e.dot} Memory: \`${memUsed}MB / ${memTotal}MB\` (RSS: \`${memRss}MB\`)\n` +
        `${e.dot} Node.js: \`${node}\`\n` +
        `${e.dot} Discord.js: \`v${djs}\``
      )
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${e.files} Codebase**\n` +
        `${e.dot} Files: \`${counts.fileCount}\`\n` +
        `${e.dot} Lines of Code: \`${counts.totalLines?.toLocaleString() || "N/A"}\``
      )
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.sparkle} Chiku v1.0 by ApeX Development  ${e.dot}  discord.js v${djs}  ${e.dot}  Kazagumo v3`
      )
    );

    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
