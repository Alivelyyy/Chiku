const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "leave",
  aliases: ["disconnect2", "bye"],
  cooldown: "5",
  category: "music",
  usage: "",
  description: "Make the bot leave the voice channel (without stop command).",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [],
  player: false, queue: false, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    const prefix = client.getPrefix(message.guild.id);

    if (!player) {
      return message.reply(send(error(`${e.headphones} I'm not in a voice channel.`)));
    }

    const channelName = message.guild.channels.cache.get(player.voiceId)?.name || "Voice Channel";
    const stats       = player._sessionStats || { tracksPlayed: 0, totalDuration: 0 };
    await player.destroy();

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.stop} Left Voice Channel`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.yes} Left **${channelName}** successfully.\n\n` +
        `${e.list} **Tracks played:** \`${stats.tracksPlayed}\`\n` +
        `${e.time} **Total playtime:** \`${formatDuration(stats.totalDuration)}\`\n\n` +
        `${e.play} Use \`${prefix}join\` or \`${prefix}play\` to connect again.`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Disconnected by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
