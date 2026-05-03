const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { Playlist } = require("@database/playlistModel");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "pl-dupes",
  aliases: ["pldupes", "playlist-dupes", "removedupes"],
  cooldown: "5",
  category: "playlist",
  usage: "<name>",
  description: "Remove duplicate tracks from one of your playlists.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: false, queue: false, inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const name = args.join(" ");
    const pl = await Playlist.findOne({ userId: message.author.id, name });
    if (!pl) return message.reply(send(error(`${e.warn} No playlist named **${name}**.`)));

    const before = pl.tracks.length;
    const seen = new Set();
    pl.tracks = pl.tracks.filter((t) => {
      if (seen.has(t.uri)) return false;
      seen.add(t.uri);
      return true;
    });
    const removed = before - pl.tracks.length;

    if (removed === 0) {
      const c = new ContainerBuilder().setAccentColor(0x57F287);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.yes} No Duplicates Found`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`All \`${before}\` tracks in **${name}** are unique!`));
      return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
    }

    pl.updatedAt = new Date();
    await pl.save();

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.clear} Duplicates Removed`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Removed \`${removed}\` duplicate track${removed !== 1 ? "s" : ""} from **${name}**.\n` +
      `${e.list} Playlist now has \`${pl.tracks.length}\` unique tracks.`
    ));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
