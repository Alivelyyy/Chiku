const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getPlayer } = require("@plugins/player");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pitch",
  aliases: ["setpitch"],
  cooldown: "3",
  category: "filters",
  usage: "<0.5 - 2.0>",
  description: "Adjust the pitch of the audio. Default is 1.0 (normal).",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    if (!player) return message.reply(send(error(`${e.music} No active player.`)));

    const pitch = parseFloat(args[0]);
    if (isNaN(pitch) || pitch < 0.5 || pitch > 2.0) {
      return message.reply(send(error(`${e.warn} Please provide a pitch value between \`0.5\` and \`2.0\`.\nExample: \`${client.getPrefix(message.guild.id)}pitch 1.5\``)));
    }

    await player.shoukaku.setFilters({ timescale: { pitch } });
    player._currentFilter = `pitch(${pitch})`;

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.filter} Pitch Adjusted`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `🎵 **Pitch** set to \`${pitch}x\`\n` +
      `${e.dot} \`< 1.0\` = Lower pitch (deeper voice)\n` +
      `${e.dot} \`1.0\` = Normal pitch\n` +
      `${e.dot} \`> 1.0\` = Higher pitch (chipmunk effect)`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Changed by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
