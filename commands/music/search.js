const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { searchResults } = require("@plugins/button");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "search",
  aliases: ["find", "lookup"],
  cooldown: "5",
  category: "music",
  usage: "<query>",
  description: "Search for a track and pick from the top 5 results.",
  args: true, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: ["Connect", "Speak"], userPerms: [],
  player: false, queue: false, inVoiceChannel: true, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    const query  = args.join(" ");
    const prefix = client.getPrefix(message.guild.id);

    const loadingC = new ContainerBuilder().setAccentColor(0x9B59B6);
    loadingC.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${e.loading} Searching for **${query}**...`));
    const loadingMsg = await message.reply({ components: [loadingC], flags: MessageFlags.IsComponentsV2 });

    let result;
    try {
      result = await client.kazagumo.search(query, { requester: message.author.tag, engine: "ytsearch" });
    } catch {
      return loadingMsg.edit(send(error(`${e.no} Search failed. Please try again.`)));
    }

    if (!result?.tracks?.length) {
      return loadingMsg.edit(send(error(`${e.search} No results found for **${query}**.`)));
    }

    const tracks = result.tracks.slice(0, 5);
    if (!client._searchCache) client._searchCache = new Map();
    const key = `${message.guild.id}_${message.author.id}`;
    client._searchCache.set(key, tracks);
    setTimeout(() => client._searchCache?.delete(key), 60000);

    const lines = tracks.map((t, i) =>
      `\`${i + 1}.\` **[${t.title}](${t.uri})**\n` +
      `> ${e.mic} ${t.author || "Unknown"}  ${e.dot}  \`${t.isStream ? "🔴 LIVE" : formatDuration(t.length)}\``
    );

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.search} Search Results`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Results for **${query}**\n\n` + lines.join("\n\n")
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# Click a number to queue that track  ${e.dot}  Expires in 60s`
    ));
    c.addActionRowComponents(searchResults(tracks));
    return loadingMsg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
