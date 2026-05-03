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
  name: "dj",
  aliases: ["djrole", "setdj"],
  cooldown: "5",
  category: "config",
  usage: "[@role / reset]",
  description: "Set or remove a DJ role. Only DJs can control music when set.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  premium: false,
  botPerms: [],
  userPerms: ["ManageGuild"],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const settings = await getSettings(message.guild.id);

    if (!args[0]) {
      const currentRole = settings.djRole
        ? message.guild.roles.cache.get(settings.djRole)
        : null;

      const c = new ContainerBuilder().setAccentColor(0x9B59B6);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.headphones} DJ Role`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.dot} **Current DJ Role:** ${currentRole ? `<@&${currentRole.id}>` : "`Not set`"}\n\n` +
          `**Usage:**\n` +
          `${e.arrow} \`${client.getPrefix(message.guild.id)}dj @Role\` — Set a DJ role\n` +
          `${e.arrow} \`${client.getPrefix(message.guild.id)}dj reset\` — Remove the DJ role\n\n` +
          `> ${e.info} When a DJ role is set, only members with that role (or server admins) can control music.`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    if (args[0].toLowerCase() === "reset" || args[0].toLowerCase() === "none") {
      await updateSettings(message.guild.id, { djRole: null });

      const c = new ContainerBuilder().setAccentColor(0xED4245);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.headphones} DJ Role Removed`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `The DJ role restriction has been **removed**.\n` +
          `All server members can now use music commands.`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    const role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.find(
        (r) => r.name.toLowerCase() === args.join(" ").toLowerCase()
      );

    if (!role) {
      return message.reply(
        send(error(`${e.warn} Please mention a valid role or provide its name.\nExample: \`${client.getPrefix(message.guild.id)}dj @DJ\``))
      );
    }

    await updateSettings(message.guild.id, { djRole: role.id });

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.headphones} DJ Role Set`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.dot} **DJ Role:** <@&${role.id}>\n\n` +
        `Only members with this role (or server admins) can now control music.\n` +
        `${e.arrow} Use \`${client.getPrefix(message.guild.id)}dj reset\` to remove the restriction.`
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
