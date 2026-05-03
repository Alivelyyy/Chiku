const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getPlayer } = require("@plugins/player");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "speed",
  aliases: ["setspeed", "rate"],
  cooldown: "3",
  category: "filters",
  usage: "<0.5 - 3.0>",
  description: "Adjust the playback speed. Default is 1.0 (normal).",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    if (!player) return message.reply(send(error(`${e.music} No active player.`)));

    const speed = parseFloat(args[0]);
    if (isNaN(speed) || speed < 0.5 || speed > 3.0) {
      return message.reply(send(error(`${e.warn} Please provide a speed value between \`0.5\` and \`3.0\`.\nExample: \`${client.getPrefix(message.guild.id)}speed 1.5\``)));
    }

    await player.shoukaku.setFilters({ timescale: { speed } });
    player._currentFilter = `speed(${speed})`;

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.filter} Speed Adjusted`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `⏩ **Speed** set to \`${speed}x\`\n` +
      `${e.dot} \`< 1.0\` = Slower playback\n` +
      `${e.dot} \`1.0\` = Normal speed\n` +
      `${e.dot} \`> 1.0\` = Faster playback`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Changed by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
