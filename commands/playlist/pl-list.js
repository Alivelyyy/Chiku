const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist, getLimits } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-list",
  aliases: ["pllist", "playlists", "myplaylists"],
  cooldown: "5",
  category: "playlist",
  usage: "[@user]",
  description: "View all your playlists (or another user's).",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const playlists = await Playlist.find({ userId: target.id }).lean();
    const limits = await getLimits(target.id);

    if (!playlists.length) {
      return message.reply(send(error(
        `${e.queue} ${target.id === message.author.id ? "You have" : `**${target.username}** has`} no playlists yet.\n` +
        `Use \`${client.getPrefix(message.guild.id)}pl-create <name>\` to create one!`
      )));
    }

    const lines = playlists.map((pl, i) => {
      const dur = pl.tracks.reduce((a, t) => a + (t.length || 0), 0);
      return `\`${i + 1}.\` **${pl.name}** — \`${pl.tracks.length}\` tracks · \`${formatDuration(dur)}\``;
    });

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `## ${e.queue} ${target.id === message.author.id ? "Your" : `${target.username}'s`} Playlists`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# ${playlists.length}/${limits.playlists} playlists used • Use \`${client.getPrefix(message.guild.id)}pl-info <name>\` for details`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
