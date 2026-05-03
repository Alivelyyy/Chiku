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
const { checkPremium, getPremiumData } = require("@database/premiumModel");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "premium",
  aliases: ["prem", "upgrade"],
  cooldown: "5",
  category: "utility",
  usage: "",
  description: "View information about Chiku Premium and its benefits.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  premium: false,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const isPrem = await checkPremium(message.author.id);
    const premData = isPrem ? await getPremiumData(message.author.id) : null;

    const c = new ContainerBuilder().setAccentColor(isPrem ? 0xF1C40F : 0x2B2D31);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.diamond} Chiku Premium`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (isPrem) {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.yes} **You are a Premium user!**\n\n` +
          `${e.diamond} Activated: <t:${Math.floor(premData.activatedAt.getTime() / 1000)}:R>\n` +
          `${e.diamond} Status: ${premData.expiresAt ? `Expires <t:${Math.floor(premData.expiresAt.getTime() / 1000)}:R>` : "Lifetime"}`
        )
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.no} **You are not a Premium user yet.**\n\n` +
          `Upgrade to unlock exclusive features and support development.`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${isPrem ? "Your Premium Features" : "Premium Benefits"}:**\n\n` +
        `${e.diamond} **Volume up to 200%** (free: 100%)\n` +
        `${e.diamond} **Unlimited playlists** (free: 3)\n` +
        `${e.diamond} **500 tracks per playlist** (free: 50)\n` +
        `${e.diamond} **Priority queue position**\n` +
        `${e.diamond} **Advanced equalizer** (per-band)\n` +
        `${e.diamond} **Exclusive audio filters**\n` +
        `${e.diamond} **Synced lyrics display**\n` +
        `${e.diamond} **24/7 voice channel mode**\n` +
        `${e.diamond} **Autoplay similar tracks**\n` +
        `${e.diamond} **Premium badge on profile**\n` +
        `${e.diamond} **Early access to new features**\n` +
        `${e.diamond} **Priority customer support**`
      )
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    if (!isPrem) {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**How to get Premium:**\n\n` +
          `${e.arrow} Visit our website at \`chiku.bot/premium\`\n` +
          `${e.arrow} Plans start at \`$4.99/month\` (user) or \`$9.99/month\` (server)\n` +
          `${e.arrow} Or use a voucher code: \`${client.getPrefix(message.guild.id)}activate <code>\``
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("View Premium Plans").setEmoji(e.diamond).setStyle(ButtonStyle.Link).setURL("https://chiku.bot/premium"),
          new ButtonBuilder().setLabel("Support Server").setStyle(ButtonStyle.Link).setURL(client.support)
        )
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Thank you for supporting Chiku! Enjoy your premium features.`
        )
      );
    }

    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
