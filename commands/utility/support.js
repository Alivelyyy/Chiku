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

module.exports = {
  name: "support",
  aliases: ["server", "helpserver"],
  cooldown: "5",
  category: "utility",
  usage: "",
  description: "Get the ApeX Development support server link.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const avatarURL = client.user.displayAvatarURL({ extension: "png", size: 256 });

    const c = new ContainerBuilder().setAccentColor(0x5865F2);

    c.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${e.users} ApeX Development\n` +
            `-# The team behind Chiku — Open-Source Discord Music Bot`
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL))
    );

    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Need help?** Join the **ApeX Development** support server!\n\n` +
        `${e.dot} ${e.info} Get help with bot setup and all commands\n` +
        `${e.dot} ${e.no}  Report bugs or issues directly to the team\n` +
        `${e.dot} ${e.sparkle} Request new features and suggest improvements\n` +
        `${e.dot} ${e.music} Stay updated on new releases and changelogs\n` +
        `${e.dot} ${e.diamond} Get early access to **Premium** features\n` +
        `${e.dot} ${e.users} Connect with the Chiku community`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.sparkle} Built with ❤️ by ApeX Development  ${e.dot}  Open-source & community-driven`
      )
    );
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Join Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(client.support)
          .setEmoji(e.users),
        new ButtonBuilder()
          .setLabel("Invite Chiku")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot+applications.commands&permissions=8`)
          .setEmoji(e.link)
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
