const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

if (!global._blacklist) global._blacklist = new Set();

module.exports = {
  name: "blacklist",
  aliases: ["bl", "ban"],
  cooldown: "",
  category: "owner",
  usage: "<@user / user id> [reason]",
  description: "Blacklist a user from using the bot. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!target) return message.reply(send(error(`${e.warn} User not found.`)));
    if (client.owners.includes(target.id)) return message.reply(send(error(`${e.no} You cannot blacklist a bot owner.`)));

    const reason = args.slice(1).join(" ") || "No reason provided.";
    const isBlacklisted = global._blacklist.has(target.id);

    if (isBlacklisted) {
      global._blacklist.delete(target.id);
      const c = new ContainerBuilder().setAccentColor(0x57F287);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} User Unblacklisted`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${target.tag} (\`${target.id}\`) has been **removed from the blacklist**.\nThey can now use the bot again.`
      ));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    global._blacklist.add(target.id);
    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.no} User Blacklisted`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.dot} **User:** ${target.tag} (\`${target.id}\`)\n` +
      `${e.dot} **Reason:** ${reason}\n` +
      `${e.dot} **Blacklisted by:** ${message.author.tag}\n\n` +
      `> Use \`${client.getPrefix(message.guild.id)}blacklist ${target.id}\` again to unblacklist.`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
