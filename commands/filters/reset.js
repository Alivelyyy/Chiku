const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getPlayer } = require("@plugins/player");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "reset",
  aliases: ["resetfilter", "clearfilter", "nofilter"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Remove all active audio filters and restore default audio.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    if (!player) return message.reply(send(error(`${e.music} No active player.`)));
    if (!message.member.voice?.channel || message.member.voice.channelId !== player.voiceId) {
      return message.reply(send(error(`${e.headphones} You must be in the same voice channel as me.`)));
    }

    await player.shoukaku.setFilters({});
    player._currentFilter = null;

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.filter} Filters Reset`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.yes} All audio filters have been **reset** to default.\n` +
      `The audio is now playing at normal quality.`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Reset by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
