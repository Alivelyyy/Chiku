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
  name: "clear",
  aliases: ["clearqueue", "cq", "emptyqueue"],
  cooldown: "5",
  category: "music",
  usage: "",
  description: "Clear all queued tracks (keeps the current track playing).",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player  = getPlayer(client, message.guild.id);
    const current = player.queue.current;

    if (player.queue.length === 0) {
      return message.reply(send(error(`${e.queue} The queue is already empty.`)));
    }

    const count   = player.queue.length;
    const artwork = current ? (current.thumbnail || extractYTThumbnail(current.uri)) : null;
    player.queue.clear();

    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.clear} Queue Cleared`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.yes} Cleared **${count}** track${count !== 1 ? "s" : ""} from the queue.`
      )
    );

    if (current) {
      c.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );
      if (artwork) {
        c.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `${e.play} **Still Playing**\n**[${current.title}](${current.uri})**\n` +
                `-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(current.length)}`
              )
            )
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
        );
      } else {
        c.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.play} **Still Playing:** [${current.title}](${current.uri})\n` +
            `-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(current.length)}`
          )
        );
      }
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.clear} Cleared by ${message.author.tag}`)
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
