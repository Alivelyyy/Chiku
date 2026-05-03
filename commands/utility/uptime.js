const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");
const { formatUptime } = require("@utils/formatters");

module.exports = {
  name: "uptime",
  aliases: ["up"],
  cooldown: "5",
  category: "utility",
  usage: "",
  description: "Check how long Chiku has been running without restart.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const totalMs   = process.uptime() * 1000;
    const totalSec  = Math.floor(totalMs / 1000);
    const days      = Math.floor(totalSec / 86400);
    const hours     = Math.floor((totalSec % 86400) / 3600);
    const minutes   = Math.floor((totalSec % 3600) / 60);
    const seconds   = totalSec % 60;
    const readyAt   = client.readyAt
      ? `<t:${Math.floor(client.readyAt.getTime() / 1000)}:R>`
      : "Unknown";

    const uptimeStr = formatUptime(totalMs);
    const stability = days >= 7 ? "🟢 Stable" : days >= 1 ? "🟡 Normal" : "🔵 Fresh Start";

    const mem     = process.memoryUsage();
    const memUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.time} Uptime`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.yes} **Running for:** \`${uptimeStr}\`\n` +
        `${e.dot} **Days:** \`${days}\`  ${e.dot}  **Hours:** \`${hours}\`  ${e.dot}  **Minutes:** \`${minutes}\`  ${e.dot}  **Seconds:** \`${seconds}\`\n\n` +
        `${e.bot} **Last started:** ${readyAt}\n` +
        `${e.dot} **Stability:** ${stability}\n` +
        `${e.cpu} **Memory:** \`${memUsed}MB\`  ${e.dot}  **Shard:** \`${client.shard?.ids?.[0] ?? 0}\``
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.music} Chiku by ApeX Development  ${e.dot}  Always online`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
