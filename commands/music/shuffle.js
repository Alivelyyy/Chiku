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
  name: "shuffle",
  aliases: ["mix", "randomize"],
  cooldown: "3",
  category: "music",
  usage: "",
  description: "Shuffle all tracks in the queue.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);

    if (player.queue.length < 2) {
      return message.reply(send(error(`${e.shuffle} You need at least **2 tracks** in the queue to shuffle.`)));
    }

    const count = player.queue.length;
    player.queue.shuffle();

    const next    = player.queue[0];
    const artwork = next ? (next.thumbnail || extractYTThumbnail(next.uri)) : null;

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.shuffle} Queue Shuffled`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.yes} Successfully reshuffled **${count}** tracks.`
      )
    );

    if (next) {
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      if (artwork) {
        c.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `${e.play} **Up Next**\n**[${next.title}](${next.uri})**\n` +
                `-# ${e.mic} ${next.author || "Unknown"}  ${e.dot}  ${e.time} ${next.isStream ? "🔴 LIVE" : formatDuration(next.length)}`
              )
            )
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
        );
      } else {
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.play} **Up Next:** [${next.title}](${next.uri})\n` +
            `-# ${e.mic} ${next.author || "Unknown"}  ${e.dot}  ${next.isStream ? "🔴 LIVE" : formatDuration(next.length)}`
          )
        );
      }
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.shuffle} Shuffled by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
