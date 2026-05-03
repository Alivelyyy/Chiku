const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");

function qualityRating(ms) {
  if (ms < 50)  return { label: "Excellent", emoji: "🟢", color: 0x57F287 };
  if (ms < 100) return { label: "Good",      emoji: "🟢", color: 0x57F287 };
  if (ms < 200) return { label: "Fair",      emoji: "🟡", color: 0xFEE75C };
  if (ms < 400) return { label: "Poor",      emoji: "🟠", color: 0xE67E22 };
  return                { label: "Bad",       emoji: "🔴", color: 0xED4245 };
}

function pingBar(ms, max = 500, len = 20) {
  const pct    = Math.min(ms / max, 1);
  const filled = Math.round(pct * len);
  const empty  = len - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

module.exports = {
  name: "ping",
  aliases: ["latency", "ms", "pong"],
  cooldown: "5",
  category: "utility",
  usage: "",
  description: "Check the bot's latency and connection quality.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const loadingC = new ContainerBuilder().setAccentColor(0x5865F2);
    loadingC.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.loading} Measuring connection...`)
    );
    const sent = await message.reply({ components: [loadingC], flags: MessageFlags.IsComponentsV2 });

    const roundtrip = sent.createdTimestamp - message.createdTimestamp;
    const apiPing   = Math.round(client.ws.ping);
    const quality   = qualityRating(roundtrip);
    const bar       = pingBar(roundtrip);
    const shard     = client.shard?.ids?.[0] ?? 0;
    const players   = client.kazagumo?.players?.size ?? 0;

    const c = new ContainerBuilder().setAccentColor(quality.color);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${quality.emoji} Pong! — ${quality.label}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${quality.emoji} **Message Latency:** \`${roundtrip}ms\`\n` +
        `\`${bar}\` \`${roundtrip}ms / 500ms\`\n\n` +
        `${e.link} **WebSocket:** \`${apiPing}ms\`\n` +
        `${e.bot} **Status:** \`Online\`  ${e.dot}  **Shard:** \`${shard}\`\n` +
        `${e.music} **Active Players:** \`${players}\``
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${quality.emoji} Quality: **${quality.label}**  ${e.dot}  Chiku by ApeX Development`
      )
    );
    return sent.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
