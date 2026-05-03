const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const noprefixStore   = require("@database/noprefix");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "noprefixme",
  aliases: ["togglenoprefix", "mynp", "selfnoprefix"],
  cooldown: "5",
  category: "premium",
  usage: "",
  description: "Toggle no-prefix mode for yourself. Requires Chiku Premium.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: true,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const userId  = message.author.id;
    const current = await noprefixStore.get(userId);
    const prefix  = client.getPrefix(message.guild.id);

    if (current) {
      await noprefixStore.delete(userId);

      const c = new ContainerBuilder().setAccentColor(0xED4245);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.no} No-Prefix Disabled`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.yes} **No-prefix mode** has been **disabled** for your account.\n\n` +
          `You must now use the prefix \`${prefix}\` before all commands.\n\n` +
          `${e.info} Run \`${prefix}noprefixme\` again to re-enable it.`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# ${e.diamond} Chiku Premium  ${e.dot}  No-prefix is a Premium feature`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    } else {
      await noprefixStore.set(userId, true);

      const c = new ContainerBuilder().setAccentColor(0x57F287);
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${e.yes} No-Prefix Enabled`)
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${e.yes} **No-prefix mode** is now **enabled** for your account!\n\n` +
          `You can now type commands **without the \`${prefix}\` prefix**.\n` +
          `For example: \`play Lo-fi beats\` instead of \`${prefix}play Lo-fi beats\`\n\n` +
          `${e.warn} This only works while your **Premium subscription is active**.`
        )
      );
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# ${e.diamond} Chiku Premium  ${e.dot}  Run \`${prefix}noprefixme\` again to disable`
        )
      );
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }
  },
};
