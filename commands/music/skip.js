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
  name: "skip",
  aliases: ["s", "next", "fs"],
  cooldown: "1",
  category: "music",
  usage: "",
  description: "Skip the current track and play the next one.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    const current = player.queue.current;
    const next = player.queue[0] || null;
    const prefix = client.getPrefix(message.guild.id);
    if (!current) return message.reply(send(error(`${e.skip} Nothing is currently playing.`)));

    await player.skip();

    const artwork = next ? (next.thumbnail || extractYTThumbnail(next.uri)) : null;
    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.skip} Track Skipped`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`~~[${current.title}](${current.uri})~~\n-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(current.length)}`));

    if (next) {
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      if (artwork) {
        c.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.play} **Up Next**\n**[${next.title}](${next.uri})**\n-# ${e.mic} ${next.author || "Unknown"}  ${e.dot}  ${e.time} ${next.isStream ? "🔴 LIVE" : formatDuration(next.length)}  ${e.dot}  ${next.requester}`)).setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork)));
      } else {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.play} **Up Next:** [${next.title}](${next.uri})\n-# ${e.mic} ${next.author || "Unknown"}  ${e.dot}  ${next.isStream ? "🔴 LIVE" : formatDuration(next.length)}`));
      }
    } else {
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.info} The queue is now empty.\n-# Use \`${prefix}play <song>\` to add more tracks!`));
    }

    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${e.skip} Skipped by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};