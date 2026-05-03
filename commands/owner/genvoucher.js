const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Voucher, generateCode } = require("@database/voucherModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "genvoucher",
  aliases: ["gencode", "createvoucher", "genv"],
  cooldown: "",
  category: "owner",
  usage: "[days / lifetime] [amount]",
  description: "Generate premium voucher codes. Owner only.",
  args: false, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const durationArg = args[0]?.toLowerCase() || "lifetime";
    const amount = Math.min(10, Math.max(1, parseInt(args[1]) || 1));

    let duration = null;
    let durationStr = "Lifetime";

    if (durationArg !== "lifetime") {
      duration = parseInt(durationArg);
      if (isNaN(duration) || duration < 1) {
        return message.reply(send(error(`${e.warn} Invalid duration. Use a number of days or \`lifetime\`.`)));
      }
      durationStr = `${duration} day${duration !== 1 ? "s" : ""}`;
    }

    const codes = [];
    for (let i = 0; i < amount; i++) {
      let code;
      do { code = generateCode(); } while (await Voucher.exists({ code }));
      await Voucher.create({ code, createdBy: message.author.id, duration });
      codes.push(code);
    }

    try {
      const dmC = new ContainerBuilder().setAccentColor(0xF1C40F);
      dmC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.diamond} Generated Voucher Codes`));
      dmC.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      dmC.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.dot} **Duration:** ${durationStr}\n` +
        `${e.dot} **Amount:** \`${codes.length}\`\n` +
        `${e.dot} **Generated:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
        `**Codes:**\n${codes.map((c) => `\`${c}\``).join("\n")}`
      ));
      dmC.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      dmC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Keep these codes safe!`));
      await message.author.send({ components: [dmC], flags: MessageFlags.IsComponentsV2 });
    } catch {}

    const c = new ContainerBuilder().setAccentColor(0xF1C40F);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.diamond} Vouchers Generated`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Generated \`${codes.length}\` voucher code${codes.length !== 1 ? "s" : ""}!\n` +
      `${e.dot} **Duration:** ${durationStr}\n\n` +
      `${e.grab} Codes have been sent to your DMs.`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
