const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "previous",
  aliases: ["prev"],
  cooldown: "3",
  category: "music",
  usage: "",
  description: "Play the previously played track.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);

    const prev = player.queue.previous;
    if (!prev || (Array.isArray(prev) && prev.length === 0)) {
      return message.reply(send(error(`${e.previous} There's no previously played track available.`)));
    }

    const prevTrack = Array.isArray(prev) ? prev[prev.length - 1] : prev;
    const artwork   = prevTrack.thumbnail || extractYTThumbnail(prevTrack.uri);

    player.queue.unshift(prevTrack);
    await player.skip();

    const c = new ContainerBuilder().setAccentColor(0x5865F2);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.previous} Playing Previous Track`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (artwork) {
      c.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${prevTrack.title}](${prevTrack.uri})**\n` +
              `-# ${e.mic} ${prevTrack.author || "Unknown"}  ${e.dot}  ${e.time} ${prevTrack.isStream ? "🔴 LIVE" : formatDuration(prevTrack.length)}  ${e.dot}  ${prevTrack.requester}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${prevTrack.title}](${prevTrack.uri})**\n` +
          `-# ${e.mic} ${prevTrack.author || "Unknown"}  ${e.dot}  ${e.time} ${prevTrack.isStream ? "🔴 LIVE" : formatDuration(prevTrack.length)}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.previous} Rewound by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
