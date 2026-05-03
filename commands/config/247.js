const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { updateSettings, getSettings } = require("@database/guildSettings");
const { checkPremium } = require("@database/premiumModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "247",
  aliases: ["twentyfourseven", "alwayson"],
  cooldown: "5",
  category: "config",
  usage: "",
  description: "Toggle 24/7 mode — bot stays in voice channel even when the queue is empty. (Premium)",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  premium: true,
  botPerms: ["Connect", "Speak"],
  userPerms: ["ManageGuild"],
  player: false,
  queue: false,
  inVoiceChannel: true,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const isPrem = await checkPremium(message.author.id);
    if (!isPrem) {
      return message.reply(
        send(error(`${e.diamond} 24/7 mode is a **Premium** feature.\nUse \`${client.getPrefix(message.guild.id)}premium\` to learn more.`))
      );
    }

    const settings = await getSettings(message.guild.id);
    const newState = !settings.alwaysOn;
    await updateSettings(message.guild.id, { alwaysOn: newState });

    const c = new ContainerBuilder().setAccentColor(newState ? 0x57F287 : 0xED4245);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${e.headphones} 24/7 Mode — ${newState ? "Enabled" : "Disabled"}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        newState
          ? `${e.yes} **24/7 mode is now ON.** I will stay in the voice channel even when the queue is empty.\n\n> ${e.info} Use \`${client.getPrefix(message.guild.id)}247\` again to disable.`
          : `${e.no} **24/7 mode is now OFF.** I will leave the voice channel when the queue ends.`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.diamond} Premium Feature • Changed by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
