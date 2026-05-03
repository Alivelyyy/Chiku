const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "eval",
  aliases: ["ev", "evaluate"],
  cooldown: "",
  category: "owner",
  usage: "<code>",
  description: "Evaluate JavaScript code. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const code = args.join(" ");
    const startTime = Date.now();

    let result, type, isError = false;
    try {
      result = await eval(code);
      type = typeof result;
      if (typeof result !== "string") result = require("util").inspect(result, { depth: 1 });
    } catch (err) {
      result = err.message;
      type = "error";
      isError = true;
    }

    const elapsed = Date.now() - startTime;
    const output = String(result).slice(0, 1800);

    const c = new ContainerBuilder().setAccentColor(isError ? 0xED4245 : 0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${isError ? e.no : e.yes} Eval — ${isError ? "Error" : "Success"}`)
    );
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Input:**\n\`\`\`js\n${code.slice(0, 500)}\n\`\`\`\n` +
      `**Output:**\n\`\`\`${isError ? "" : "js"}\n${output}\n\`\`\``
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# Type: ${type} • Time: ${elapsed}ms`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
