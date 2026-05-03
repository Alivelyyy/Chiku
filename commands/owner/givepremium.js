const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Premium } = require("@database/premiumModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "givepremium",
  aliases: ["grantpremium", "addpremium", "gprem"],
  cooldown: "",
  category: "owner",
  usage: "<@user> [days / lifetime]",
  description: "Grant Premium to a user directly. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const target = message.mentions.users.first();
    if (!target) return message.reply(send(error(`${e.warn} Please mention a user to grant Premium.`)));

    const durationArg = args[1]?.toLowerCase();
    let expiresAt = null;
    let durationStr = "Lifetime";

    if (durationArg && durationArg !== "lifetime") {
      const days = parseInt(durationArg);
      if (isNaN(days) || days < 1) {
        return message.reply(send(error(`${e.warn} Invalid duration. Use a number of days or \`lifetime\`.`)));
      }
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      durationStr = `${days} day${days !== 1 ? "s" : ""}`;
    }

    await Premium.findOneAndUpdate(
      { userId: target.id },
      { userId: target.id, activatedAt: new Date(), expiresAt, voucher: null, grantedBy: message.author.id },
      { upsert: true, new: true }
    );

    const c = new ContainerBuilder().setAccentColor(0xF1C40F);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.diamond} Premium Granted`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Successfully granted **Premium** to **${target.tag}**!\n\n` +
      `${e.dot} **User:** ${target.tag} (\`${target.id}\`)\n` +
      `${e.dot} **Duration:** ${durationStr}\n` +
      `${e.dot} **Granted by:** ${message.author.tag}\n` +
      `${e.dot} **Expires:** ${expiresAt ? `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>` : "**Never** (Lifetime)"}`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
