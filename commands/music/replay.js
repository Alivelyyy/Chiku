const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, SectionBuilder, ThumbnailBuilder, MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "replay",
  aliases: ["restart", "restartsong"],
  cooldown: "3",
  category: "music",
  usage: "",
  description: "Restart the currently playing track from the beginning.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    const track  = player.queue?.current;
    if (!track) return message.reply(send(error(`${e.music} Nothing is currently playing.`)));
    if (track.isStream) return message.reply(send(error(`${e.warn} Cannot replay a live stream.`)));

    await player.shoukaku.seekTo(0);

    const artwork   = track.thumbnail || extractYTThumbnail(track.uri);
    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.replay} Replaying Track`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (artwork) {
      c.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${track.title}](${track.uri})**\n` +
              `-# ${e.mic} ${track.author || "Unknown Artist"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**[${track.title}](${track.uri})**\n` +
        `-# ${e.mic} ${track.author || "Unknown Artist"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
      ));
    }

    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# ${e.replay} Restarted from the beginning  ${e.dot}  ${e.headphones} ${message.author.tag}`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
