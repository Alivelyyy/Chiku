const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { updateSettings, getSettings } = require("@database/guildSettings");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "setup",
  aliases: ["setmusic", "musicsetup"],
  cooldown: "5",
  category: "config",
  usage: "[#channel / reset]",
  description: "Set a dedicated music text channel for the bot.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  premium: false,
  botPerms: ["ManageChannels"],
  userPerms: ["ManageGuild"],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const settings = await getSettings(message.guild.id);

    if (!args[0]) {
      const current = settings.musicChannel
        ? `<#${settings.musicChannel}>`
        : "`Not set`";

      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.cog} Music Channel Setup`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.dot} **Current Channel:** ${current}\n\n` +
          `**Usage:**\n` +
          `${e.arrow} \`${client.getPrefix(message.guild.id)}setup #channel\` — Set music channel\n` +
          `${e.arrow} \`${client.getPrefix(message.guild.id)}setup reset\` — Remove restriction\n\n` +
          `> ${e.info} When a music channel is set, the bot only responds to music commands in that channel.`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    if (args[0].toLowerCase() === "reset") {
      await updateSettings(message.guild.id, { musicChannel: null });

      const c = new ContainerBuilder().setAccentColor(0xED4245);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.cog} Music Channel Removed`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`The music channel restriction has been removed. Commands work in any channel.`)
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0].replace(/[<#>]/g, ""));

    if (!channel || channel.type !== 0) {
      return message.reply(send(error(`${e.warn} Please mention a valid text channel.`)));
    }

    await updateSettings(message.guild.id, { musicChannel: channel.id });

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.cog} Music Channel Set`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.dot} **Music Channel:** <#${channel.id}>\n\n` +
        `Music commands will now only work in ${channel}.\n` +
        `${e.arrow} Use \`${client.getPrefix(message.guild.id)}setup reset\` to remove this restriction.`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Set by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
