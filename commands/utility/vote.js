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
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "vote",
  aliases: ["topgg", "votebot"],
  cooldown: "5",
  category: "utility",
  usage: "",
  description: "Vote for Chiku on top.gg and get rewarded!",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const voteUrl = `https://top.gg/bot/${client.user.id}/vote`;

    const c = new ContainerBuilder().setAccentColor(0xF1C40F);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.trophy} Vote for Chiku`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Support **Chiku** by voting on **top.gg** — it helps more people discover the bot!\n\n` +
        `**Why vote?**\n` +
        `${e.dot} Voting only takes **10 seconds**\n` +
        `${e.dot} You can vote every **12 hours**\n` +
        `${e.dot} Helps **Chiku** reach more servers\n` +
        `${e.dot} Shows your support for **ApeX Development**\n` +
        `${e.dot} Keeps the bot **free for everyone**\n\n` +
        `${e.trophy} Every vote counts! You're one click away.`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${e.trophy} Thank you for supporting Chiku & ApeX Development!`
      )
    );
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Vote on top.gg")
          .setStyle(ButtonStyle.Link)
          .setURL(voteUrl)
          .setEmoji(e.trophy),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(client.support)
          .setEmoji(e.users)
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
