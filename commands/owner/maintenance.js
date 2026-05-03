const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "maintenance",
  aliases: ["maint", "lockdown"],
  cooldown: "",
  category: "owner",
  usage: "[on/off/status]",
  description: "Toggle maintenance mode — blocks all non-owner commands. Owner only.",
  args: false, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const input = args[0]?.toLowerCase();

    if (input === "status" || !input) {
      const isOn = client._maintenance ?? false;
      const c = new ContainerBuilder().setAccentColor(isOn ? 0xED4245 : 0x57F287);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.maintenance} Maintenance Mode`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.dot} **Status:** ${isOn ? `${e.warn} **ON** — Bot is in maintenance mode` : `${e.yes} **OFF** — Bot is operating normally`}\n\n` +
        `${e.dot} **Effect:** When ON, all non-owner commands are blocked with a maintenance message.\n` +
        `${e.dot} **Toggle:** Use \`${client.getPrefix(message.guild.id)}maintenance on/off\``
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${e.maintenance} Owner Panel  ${e.dot}  Chiku by ApeX Development`));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    if (input === "on") {
      client._maintenance = true;
      const c = new ContainerBuilder().setAccentColor(0xED4245);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.maintenance} Maintenance Mode — ON`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.warn} **Maintenance mode is now active.**\n\n` +
        `All non-owner commands are now blocked. Users will receive a maintenance notice.\n\n` +
        `> ${e.info} Use \`${client.getPrefix(message.guild.id)}maintenance off\` to restore normal operation.`
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Activated by ${message.author.tag}`));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    if (input === "off") {
      client._maintenance = false;
      const c = new ContainerBuilder().setAccentColor(0x57F287);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.maintenance} Maintenance Mode — OFF`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.yes} **Maintenance mode has been lifted.**\n\n` +
        `All commands are now available to users again. Normal operation resumed.`
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Deactivated by ${message.author.tag}`));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const { send, error } = require("@plugins/embed");
    return message.reply(send(error(`${e.warn} Usage: \`${client.getPrefix(message.guild.id)}maintenance [on/off/status]\``)));
  },
};
