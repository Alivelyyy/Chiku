const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-info",
  aliases: ["plinfo", "playlist-info"],
  cooldown: "5",
  category: "playlist",
  usage: "<name>",
  description: "View detailed information about one of your playlists.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const name = args.join(" ");
    const pl = await Playlist.findOne({ userId: message.author.id, name }).lean();
    if (!pl) return message.reply(send(error(`${e.warn} You don't have a playlist named **${name}**.`)));

    const totalDur = pl.tracks.reduce((a, t) => a + (t.length || 0), 0);
    const preview = pl.tracks.slice(0, 10);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.queue} ${pl.name}`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.list} **Tracks:** \`${pl.tracks.length}\`\n` +
      `${e.time} **Total Duration:** \`${formatDuration(totalDur)}\`\n` +
      `${e.dot} **Created:** <t:${Math.floor(new Date(pl.createdAt).getTime() / 1000)}:R>\n`
    ));

    if (preview.length) {
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      const lines = preview.map((t, i) =>
        `\`${i + 1}.\` **${t.title}** — \`${t.isStream ? "LIVE" : formatDuration(t.length)}\``
      );
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));
      if (pl.tracks.length > 10) {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `\n*... and ${pl.tracks.length - 10} more tracks*`
        ));
      }
    }

    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# Use \`${client.getPrefix(message.guild.id)}pl-load ${name}\` to play this playlist`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
