const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const path = require("path");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "reload",
  aliases: ["rl", "reloadcmd"],
  cooldown: "",
  category: "owner",
  usage: "<command name>",
  description: "Reload a command without restarting the bot. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const cmdName = args[0].toLowerCase();
    const cmd = client.commands.get(cmdName) || client.commands.get(client.aliases.get(cmdName));
    if (!cmd) return message.reply(send(error(`${e.warn} No command found: \`${cmdName}\``)));

    const category = cmd.category || "utility";
    const filePath = path.join(process.cwd(), "commands", category, `${cmd.name}.js`);

    try {
      delete require.cache[require.resolve(filePath)];
      const newCmd = require(filePath);
      client.commands.set(newCmd.name, newCmd);
      if (newCmd.aliases?.length) {
        newCmd.aliases.forEach((alias) => client.aliases.set(alias, newCmd.name));
      }

      const c = new ContainerBuilder().setAccentColor(0x57F287);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} Command Reloaded`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `Successfully reloaded \`${newCmd.name}\`!\n` +
        `${e.dot} **Category:** ${newCmd.category}\n` +
        `${e.dot} **Aliases:** ${newCmd.aliases?.length ? newCmd.aliases.join(", ") : "None"}`
      ));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    } catch (err) {
      return message.reply(send(error(`${e.no} Failed to reload \`${cmdName}\`:\n\`\`\`\n${err.message}\n\`\`\``)));
    }
  },
};
