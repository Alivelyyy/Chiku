const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "stop",
  aliases: ["disconnect", "dc"],
  cooldown: "3",
  category: "music",
  usage: "",
  description: "Stop the player, clear the queue, and disconnect the bot.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    const current = player.queue.current;
    const qLen = player.queue.length;
    const stats = player._sessionStats || { tracksPlayed: 0, totalDuration: 0 };
    const artwork = current ? (current.thumbnail || extractYTThumbnail(current.uri)) : null;
    const prefix = client.getPrefix(message.guild.id);

    await player.destroy();

    const tracksCleared = String(qLen);
    const totalPlayed = String(stats.tracksPlayed);
    const playtime = formatDuration(stats.totalDuration);
    const playCmd = prefix + "play <song>";

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent("## " + e.stop + " Session Ended"));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (current) {
      const trackInfo = e.stop + " **Stopped while playing:**\n~~[" + current.title + "](" + current.uri + ")~~\n-# " + e.mic + " " + (current.author || "Unknown") + "  " + e.dot + "  " + e.time + " " + formatDuration(current.length);
      if (artwork) {
        c.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(trackInfo))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
        );
      } else {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(trackInfo));
      }
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    }

    const summary = e.list + " **Tracks cleared:** " + tracksCleared + "\n" +
      e.list + " **Total played this session:** " + totalPlayed + "\n" +
      e.time + " **Playtime:** " + playtime + "\n\n" +
      e.headphones + " Disconnected from voice channel.";
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(summary));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

    const footer = "-# " + e.play + " Use !" + playCmd + " to start a new session  " + e.dot + "  Stopped by " + message.author.tag;
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Play Again").setEmoji(e.play).setCustomId("stop_playagain").setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setLabel("Queue").setEmoji(e.queue).setCustomId("stop_queue").setStyle(ButtonStyle.Secondary).setDisabled(true)
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
