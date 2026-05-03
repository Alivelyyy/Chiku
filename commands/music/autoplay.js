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
const { getPlayer } = require("@plugins/player");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "autoplay",
  aliases: ["ap", "autoq"],
  cooldown: "5",
  category: "music",
  usage: "",
  description: "Toggle autoplay — automatically queues related songs when the queue ends. (Premium)",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  premium: true,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: true,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const isPrem = await checkPremium(message.author.id);
    if (!isPrem) {
      const prefix = client.getPrefix(message.guild.id);
      return message.reply(
        send(error(`${e.diamond} Autoplay is a **Premium** feature.\nUse \`${prefix}premium\` to learn more.`))
      );
    }

    const settings = await getSettings(message.guild.id);
    const newState = !settings.autoplay;
    await updateSettings(message.guild.id, { autoplay: newState });

    const player = getPlayer(client, message.guild.id);
    if (player) player._autoplay = newState;

    const c = new ContainerBuilder().setAccentColor(newState ? 0x57F287 : 0xED4245);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${e.music} Autoplay — ${newState ? "Enabled" : "Disabled"}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        newState
          ? `${e.yes} **Autoplay is now ON.** I will automatically queue related tracks when the queue ends.\n\n> ${e.info} Use \`${client.getPrefix(message.guild.id)}autoplay\` again to disable.`
          : `${e.no} **Autoplay is now OFF.** I will stop after the queue ends.`
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
