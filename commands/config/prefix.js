const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { updateSettings, getSettings } = require("@database/guildSettings");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "prefix",
  aliases: ["setprefix", "changeprefix"],
  cooldown: "5",
  category: "config",
  usage: "[new prefix]",
  description: "View or change the bot command prefix for this server.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: ["ManageGuild"],
  player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const settings   = await getSettings(message.guild.id);
    const current    = settings.prefix || client.prefix;

    if (!args[0]) {
      const c = new ContainerBuilder().setAccentColor(0x5865F2);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.cog} Server Prefix`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${e.dot} **Current Prefix:** \`${current}\`\n\n` +
        `${e.arrow} \`${current}prefix <new prefix>\` — Change the prefix\n` +
        `${e.warn} Prefix must be **5 characters or less**`
      ));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const newPrefix = args[0];
    if (newPrefix.length > 5) {
      return message.reply(send(error(`${e.warn} Prefix must be **5 characters or less**.`)));
    }
    if (newPrefix === current) {
      return message.reply(send(error(`${e.warn} The prefix is already \`${current}\`.`)));
    }

    await updateSettings(message.guild.id, { prefix: newPrefix });
    client.guildPrefixes.set(message.guild.id, newPrefix);

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.cog} Prefix Updated`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Prefix changed successfully!\n\n` +
      `${e.dot} **Old Prefix:** \`${current}\`\n` +
      `${e.dot} **New Prefix:** \`${newPrefix}\`\n\n` +
      `${e.arrow} Try it: \`${newPrefix}help\``
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Changed by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
