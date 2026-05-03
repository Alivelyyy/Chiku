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
const { send } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

const BOT_ID = "1500425524009500802";
const VOTE_URL = `https://top.gg/bot/${BOT_ID}/vote`;
const TOPGG_URL = `https://top.gg/bot/${BOT_ID}`;

module.exports = {
  name: "vote",
  aliases: ["upvote", "topgg"],
  cooldown: "5",
  category: "music",
  usage: "",
  description: "Vote for Chiku on top.gg to support the bot!",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.sparkle} Vote for Chiku`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Voting for Chiku on **top.gg** helps more servers discover the bot!\n\n` +
        `${e.yes} Voting is **free** and takes 10 seconds\n` +
        `${e.yes} You can vote every **12 hours**\n` +
        `${e.yes} Your support means a lot to the team\n\n` +
        `> ${e.info} Voting unlocks exclusive perks and helps Chiku grow!`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.diamond} Chiku by ApeX Development`)
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Vote on top.gg")
        .setStyle(ButtonStyle.Link)
        .setURL(VOTE_URL)
        .setEmoji("⬆️"),
      new ButtonBuilder()
        .setLabel("View Bot Page")
        .setStyle(ButtonStyle.Link)
        .setURL(TOPGG_URL)
        .setEmoji("🔗")
    );

    c.addActionRowComponents(row);

    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
