const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");
const yaml = require("js-yaml");
const fs = require("fs");

const YML = yaml.load(fs.readFileSync("./config.yml", "utf8"));
const GENIUS_TOKEN = YML.BOT?.GENIUS_TOKEN || null;

function cleanQuery(str) {
  return str
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?(official|video|lyrics|audio|mv|hd|hq|4k|live|feat|ft\.?|remix|prod|cover).*?\)/gi, "")
    .replace(/[\|\-–—].*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  name: "lyrics",
  aliases: ["ly", "lyric"],
  cooldown: "10",
  category: "music",
  usage: "[song name]",
  description: "Fetch lyrics for the current or a specified track.",
  args: false,
  vote: false,
  new: false,
  admin: false,
  owner: false,
  botPerms: [],
  userPerms: [],
  player: false,
  queue: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (client, message, args) => {
    let query = args.join(" ").trim();

    if (!query) {
      const player = client.kazagumo.players.get(message.guild.id);
      const track = player?.queue?.current;
      if (!track) {
        return message.reply(
          send(error(`${e.lyrics} No track is playing. Provide a song name or start playing music.`))
        );
      }
      query = cleanQuery(`${track.title} ${track.author || ""}`).trim();
    } else {
      query = cleanQuery(query);
    }

    const loadingC = new ContainerBuilder().setAccentColor(0x9B59B6);
    loadingC.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${e.loading} Searching for lyrics of **${query}**...`)
    );
    const loadingMsg = await message.reply({
      components: [loadingC],
      flags: MessageFlags.IsComponentsV2,
    });

    try {
      const Genius = require("genius-lyrics");
      const GeniusClient = GENIUS_TOKEN
        ? new Genius.Client(GENIUS_TOKEN)
        : new Genius.Client();

      const searches = await GeniusClient.songs.search(query);

      if (!searches.length) {
        const altQuery = query.split(" ").slice(0, 3).join(" ");
        const altSearch = await GeniusClient.songs.search(altQuery).catch(() => []);
        if (!altSearch.length) {
          return loadingMsg.edit(send(error(`${e.lyrics} No lyrics found for **${query}**. Try searching with fewer words.`)));
        }
        const song = altSearch[0];
        const lyrics = await song.lyrics().catch(() => null);
        if (!lyrics) return loadingMsg.edit(send(error(`${e.lyrics} Lyrics unavailable for this track.`)));
        return sendLyrics(loadingMsg, song, lyrics);
      }

      const song = searches[0];
      const lyrics = await song.lyrics().catch(() => null);

      if (!lyrics) {
        return loadingMsg.edit(send(error(`${e.lyrics} Lyrics are unavailable for this track.`)));
      }

      return sendLyrics(loadingMsg, song, lyrics);
    } catch (err) {
      console.error("[Lyrics] Error:", err?.message);
      return loadingMsg.edit(
        send(error(`${e.no} Failed to fetch lyrics. Please try again later.`))
      );
    }
  },
};

async function sendLyrics(loadingMsg, song, lyrics) {
  const e = require("@assets/emojis/black.js");
  const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

  const maxLength = 3800;
  const trimmed =
    lyrics.length > maxLength
      ? lyrics.slice(0, maxLength) + "\n\n*... (lyrics truncated)*"
      : lyrics;

  const c = new ContainerBuilder().setAccentColor(0x9B59B6);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.lyrics} ${song.title}`)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${e.mic} **Artist:** ${song.artist.name}\n` +
      `${e.link} [View on Genius](${song.url})\n`
    )
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(trimmed)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# Powered by Genius • Chiku by ApeX Development`)
  );

  return loadingMsg.edit({ components: [c], flags: MessageFlags.IsComponentsV2 });
}
