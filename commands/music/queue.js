const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, SectionBuilder, ThumbnailBuilder, MessageFlags,
} = require("discord.js");
const { getPlayer, buildQueueText } = require("@plugins/player");
const { queueNav } = require("@plugins/button");
const { send, error } = require("@plugins/embed");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "queue",
  aliases: ["q", "list"],
  cooldown: "3",
  category: "music",
  usage: "[page]",
  description: "View the current music queue with full pagination.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: false,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    const prefix = client.getPrefix(message.guild.id);
    const perPage = 10;
    const page = Math.max(1, parseInt(args[0]) || 1);
    const current = player.queue.current;
    const total = player.queue.length;

    if (!current && total === 0) return message.reply(send(error(`${e.queue} The queue is empty.\n> Use \`${prefix}play <song>\` to start playing.`)));

    const { text, totalPages } = buildQueueText(player.queue, page, perPage);
    const totalDuration = [...player.queue].reduce((a, t) => a + (t.length || 0), 0);
    const artwork = current ? (current.thumbnail || extractYTThumbnail(current.uri)) : null;

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.queue} Music Queue`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (current) {
      const dur = current.isStream ? "🔴 LIVE" : formatDuration(current.length);
      if (artwork) {
        c.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.playing} **Now Playing**\n**[${current.title}](${current.uri})** \`${dur}\`\n-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${current.requester}`)).setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork)));
      } else {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.playing} **Now Playing**\n**[${current.title}](${current.uri})** \`${dur}\`\n-# ${e.mic} ${current.author || "Unknown"}  ${e.dot}  ${current.requester}`));
      }
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    }

    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${e.list} ${total} track${total !== 1 ? "s" : ""} in queue  ${e.dot}  ${e.time} ${formatDuration(totalDuration)} total  ${e.dot}  Page ${page}/${totalPages}`));
    if (totalPages > 1) c.addActionRowComponents(queueNav(page, totalPages));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};