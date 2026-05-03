const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "leaveserver",
  aliases: ["leaveguild", "lg"],
  cooldown: "",
  category: "owner",
  usage: "<guild_id>",
  description: "Force the bot to leave a specific server. Owner only.",
  args: true, vote: false, new: false, admin: false, owner: true, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const guildId = args[0]?.trim();
    if (!guildId) {
      return message.reply(send(error(
        `${e.warn} Please provide a guild ID.\n` +
        `Usage: \`${client.getPrefix(message.guild.id)}leaveserver <guild_id>\``
      )));
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return message.reply(send(error(
        `${e.warn} I'm not in a guild with ID \`${guildId}\`.\n` +
        `-# Use \`${client.getPrefix(message.guild.id)}servers\` to see a list of guilds I'm in.`
      )));
    }

    if (guild.id === message.guild.id) {
      return message.reply(send(error(`${e.warn} You can't make me leave the guild you're running this command in.`)));
    }

    const guildName     = guild.name;
    const guildMembers  = guild.memberCount;
    const guildOwner    = await guild.fetchOwner().catch(() => null);

    const player = client.kazagumo?.players?.get(guildId);
    if (player) await player.destroy().catch(() => {});

    await guild.leave();

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.close} Left Server`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} Successfully left **${guildName}**.\n\n` +
      `${e.dot} **Guild ID:** \`${guildId}\`\n` +
      `${e.dot} **Members:** \`${guildMembers.toLocaleString()}\`\n` +
      `${e.dot} **Owner:** ${guildOwner ? `${guildOwner.user.tag} (\`${guildOwner.id}\`)` : "Unknown"}\n` +
      `${e.dot} **Executed by:** ${message.author.tag}`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Owner Action  ${e.dot}  Chiku by ApeX Development`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
