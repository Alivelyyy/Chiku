const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { getPremiumData } = require("@database/premiumModel");
const { Playlist } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "profile",
  aliases: ["premprofile", "mypremium"],
  cooldown: "5",
  category: "premium",
  usage: "",
  description: "View your Chiku Premium profile and subscription details.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const data = await getPremiumData(message.author.id);
    const plCount = await Playlist.countDocuments({ userId: message.author.id });

    if (!data) {
      const c = new ContainerBuilder().setAccentColor(0x2B2D31);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.diamond} Premium Profile`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.no} **You are not a Premium user.**\n\n` +
        `Use \`${client.getPrefix(message.guild.id)}activate <code>\` to activate Premium.\n` +
        `Use \`${client.getPrefix(message.guild.id)}premium\` to view benefits.`
      ));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const activatedStr = `<t:${Math.floor(new Date(data.activatedAt).getTime() / 1000)}:D>`;
    const expiresStr = data.expiresAt
      ? `<t:${Math.floor(new Date(data.expiresAt).getTime() / 1000)}:R>`
      : "**Never** (Lifetime)";

    const c = new ContainerBuilder().setAccentColor(0xF1C40F);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.diamond} Premium Profile`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} **Status:** Active Premium\n\n` +
      `${e.dot} **User:** ${message.author.tag}\n` +
      `${e.dot} **Activated:** ${activatedStr}\n` +
      `${e.dot} **Expires:** ${expiresStr}\n` +
      `${e.dot} **Voucher:** \`${data.voucher || "Direct Grant"}\`\n` +
      `${e.dot} **Playlists:** \`${plCount}/25\`\n\n` +
      `**Active Benefits:**\n` +
      `${e.diamond} Volume up to \`200%\`\n` +
      `${e.diamond} \`25\` playlists · \`500\` tracks each\n` +
      `${e.diamond} 24/7 mode & Autoplay\n` +
      `${e.diamond} Priority playback`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# Thank you for supporting ApeX Development! ${e.trophy}`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
