const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Premium, checkPremium } = require("@database/premiumModel");
const { Voucher } = require("@database/voucherModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "activate",
  aliases: ["redeem", "activatepremium"],
  cooldown: "10",
  category: "premium",
  usage: "<voucher code>",
  description: "Activate Chiku Premium using a voucher code.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const code = args[0].toUpperCase();

    const alreadyPrem = await checkPremium(message.author.id);
    if (alreadyPrem) {
      return message.reply(send(error(`${e.diamond} You already have an active Premium subscription!`)));
    }

    const voucher = await Voucher.findOne({ code, used: false });
    if (!voucher) {
      return message.reply(send(error(`${e.no} Invalid or already used voucher code. Please check and try again.`)));
    }

    let expiresAt = null;
    if (voucher.duration) {
      expiresAt = new Date(Date.now() + voucher.duration * 24 * 60 * 60 * 1000);
    }

    await Premium.create({
      userId: message.author.id,
      activatedAt: new Date(),
      expiresAt,
      voucher: code,
      grantedBy: voucher.createdBy,
    });

    voucher.used = true;
    voucher.usedBy = message.author.id;
    voucher.usedAt = new Date();
    await voucher.save();

    const c = new ContainerBuilder().setAccentColor(0xF1C40F);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.diamond} Premium Activated!`)
    );
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Welcome to **Chiku Premium**, ${message.author.username}!\n\n` +
      `**Your Benefits:**\n` +
      `${e.diamond} Volume up to \`200%\`\n` +
      `${e.diamond} Up to \`25\` playlists & \`500\` tracks each\n` +
      `${e.diamond} 24/7 voice channel mode\n` +
      `${e.diamond} Autoplay similar tracks\n` +
      `${e.diamond} Priority playback & exclusive filters\n\n` +
      `${e.dot} **Expires:** ${expiresAt ? `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>` : "**Never** (Lifetime)"}\n` +
      `${e.dot} **Voucher:** \`${code}\``
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# Thank you for supporting Chiku & ApeX Development! ${e.trophy}`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
