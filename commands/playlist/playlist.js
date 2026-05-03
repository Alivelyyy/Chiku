const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require("discord.js");
const { Playlist, getLimits } = require("@database/playlistModel");
const { send } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "playlist",
  aliases: ["pl", "pldash"],
  cooldown: "5",
  category: "playlist",
  usage: "",
  description: "View your playlist dashboard with quick actions.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const playlists = await Playlist.find({ userId: message.author.id }).lean();
    const limits = await getLimits(message.author.id);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.queue} Playlist Dashboard`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (!playlists.length) {
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `You have no playlists yet!\n\n` +
        `${e.arrow} Create one with \`${client.getPrefix(message.guild.id)}pl-create <name>\`\n` +
        `${e.arrow} Add tracks with \`${client.getPrefix(message.guild.id)}pl-add <name> | <song>\``
      ));
    } else {
      const lines = playlists.map((pl, i) => {
        const dur = pl.tracks.reduce((a, t) => a + (t.length || 0), 0);
        return `\`${i + 1}.\` **${pl.name}** — \`${pl.tracks.length}\` tracks · \`${formatDuration(dur)}\``;
      });
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));
    }

    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${e.list} **${playlists.length}/${limits.playlists}** playlists used\n\n` +
      `**Quick Commands:**\n` +
      `${e.arrow} \`${client.getPrefix(message.guild.id)}pl-create <name>\` — Create a playlist\n` +
      `${e.arrow} \`${client.getPrefix(message.guild.id)}pl-load <name>\` — Play a playlist\n` +
      `${e.arrow} \`${client.getPrefix(message.guild.id)}pl-info <name>\` — View details\n` +
      `${e.arrow} \`${client.getPrefix(message.guild.id)}pl-add <name> | <song>\` — Add a track`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# ${e.diamond} Premium: up to 25 playlists & 500 tracks each`
    ));
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("pl_refresh").setLabel("Refresh").setEmoji(e.loading).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel("Premium Info").setEmoji(e.diamond).setStyle(ButtonStyle.Link).setURL(client.support)
      )
    );
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
