const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { formatDuration } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

const STATIONS = [
  { id: "lofi",       emoji: "🌙", name: "Lo-Fi Beats",    genre: "Lo-Fi / Chill",   query: "lofi hip hop radio beats to relax study to live",        desc: "Relaxing lo-fi beats for studying & chilling 24/7",    color: 0x9B59B6 },
  { id: "chillhop",   emoji: "☕", name: "Chillhop",        genre: "Chill Hop",        query: "chillhop music radio live 24/7 stream",                  desc: "Smooth hip-hop beats to vibe to all day",              color: 0x3498DB },
  { id: "jazz",       emoji: "🎷", name: "Jazz Café",       genre: "Jazz",             query: "jazz café radio live smooth jazz music 24/7",            desc: "Smooth jazz for a calm, warm atmosphere",              color: 0xE67E22 },
  { id: "house",      emoji: "🎛️", name: "Deep House",      genre: "Electronic",       query: "deep house music radio live stream 24/7",                desc: "Deep, melodic house grooves non-stop",                 color: 0x1ABC9C },
  { id: "classical",  emoji: "🎻", name: "Classical",       genre: "Classical",        query: "classical music radio live 24/7 mozart beethoven",       desc: "Timeless orchestral masterpieces",                     color: 0xF1C40F },
  { id: "synthwave",  emoji: "🌆", name: "Synthwave",       genre: "Retrowave",        query: "synthwave retrowave music radio live neon 80s",           desc: "80s-inspired retro electronic nostalgia",              color: 0xE91E63 },
  { id: "epic",       emoji: "⚔️", name: "Epic / Gaming",   genre: "Epic / Cinematic", query: "epic gaming orchestral music radio live 24/7",           desc: "Powerful cinematic soundtracks & game music",          color: 0xED4245 },
  { id: "ambient",    emoji: "🌌", name: "Ambient",         genre: "Ambient",          query: "ambient meditation relaxation music radio live",          desc: "Peaceful soundscapes & meditation sounds",             color: 0x2C3E50 },
  { id: "kpop",       emoji: "🌸", name: "K-Pop Hits",      genre: "K-Pop",            query: "kpop radio live 24/7 mix best hits korean pop",          desc: "Non-stop K-Pop bangers & viral hits",                  color: 0xFF69B4 },
  { id: "hiphop",     emoji: "🎤", name: "Hip-Hop",         genre: "Hip-Hop / Trap",   query: "hip hop trap radio live 24/7 mix rap beats",             desc: "Non-stop hip-hop, trap & rap bangers",                 color: 0x8E44AD },
];

function buildBrowserPage(selected = null) {
  const c = new ContainerBuilder().setAccentColor(0x9B59B6);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${e.radio} Radio Stations`)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const lines = STATIONS.map((s) => {
    const active = selected === s.id ? ` ${e.playing}` : "";
    return `${s.emoji} **${s.name}**${active} — \`${s.genre}\`\n> ${s.desc}`;
  });

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(lines.join("\n\n"))
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${e.list} ${STATIONS.length} stations available  ${e.dot}  Powered by YouTube Search  ${e.dot}  Chiku by ApeX Development`
    )
  );

  const row1 = new ActionRowBuilder();
  const row2 = new ActionRowBuilder();

  STATIONS.slice(0, 5).forEach((s) => {
    row1.addComponents(
      new ButtonBuilder()
        .setCustomId(`radio_${s.id}`)
        .setEmoji(s.emoji)
        .setLabel(s.name.split(" ")[0])
        .setStyle(selected === s.id ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  });

  STATIONS.slice(5).forEach((s) => {
    row2.addComponents(
      new ButtonBuilder()
        .setCustomId(`radio_${s.id}`)
        .setEmoji(s.emoji)
        .setLabel(s.name.split(" ")[0])
        .setStyle(selected === s.id ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
  });

  c.addActionRowComponents(row1, row2);
  return c;
}

function buildPlayingCard(station, track) {
  const c = new ContainerBuilder().setAccentColor(station.color);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${station.emoji} Radio — ${station.name}`)
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${e.play} **Now streaming:** [${track.title}](${track.uri})\n` +
      `${e.mic} ${track.author || "Unknown"}  ${e.dot}  \`${track.isStream ? "🔴 LIVE" : formatDuration(track.length)}\`\n\n` +
      `> ${e.note} ${station.desc}`
    )
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${e.radio} \`${station.genre}\`  ${e.dot}  Powered by YouTube Search`
    )
  );
  return c;
}

module.exports = {
  name: "radio",
  aliases: ["r", "station", "radioplay"],
  cooldown: "5",
  category: "music",
  usage: "[station name]",
  description: "Browse and stream curated internet radio stations — Lo-Fi, Jazz, K-Pop, and more.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: ["Connect", "Speak"], userPerms: [],
  player: false, queue: false, inVoiceChannel: true, sameVoiceChannel: false,
  execute: async (client, message, args) => {
    if (!message.member?.voice?.channel) {
      return message.reply(send(error(`${e.headphones} You need to be in a **voice channel** to use radio.`)));
    }

    if (args[0]) {
      const query   = args.join(" ").toLowerCase();
      const station = STATIONS.find(
        (s) => s.id.includes(query) || s.name.toLowerCase().includes(query) || s.genre.toLowerCase().includes(query)
      );
      if (!station) {
        return message.reply(send(error(
          `${e.warn} Unknown station: \`${query}\`\n` +
          `Available: ${STATIONS.map(s => `\`${s.id}\``).join(", ")}`
        )));
      }
      return playStation(client, message, station);
    }

    const m = await message.reply({
      components: [buildBrowserPage()],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = m.createMessageComponentCollector({
      filter: async (i) => {
        if (!i.member?.voice?.channel) {
          await i.reply(send(error(`${e.headphones} Join a voice channel first.`))).catch(() => {});
          return false;
        }
        if (i.user.id !== message.author.id) {
          await i.reply({
            content: `${e.no} Only **${message.author.tag}** can use this radio browser.`,
            ephemeral: true,
          }).catch(() => {});
          return false;
        }
        return i.customId.startsWith("radio_");
      },
      time: 120000,
      idle: 60000,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});
      const stationId = interaction.customId.replace("radio_", "");
      const station   = STATIONS.find((s) => s.id === stationId);
      if (!station) return;

      await m.edit({ components: [buildBrowserPage(stationId)], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

      const track = await findAndPlayStation(client, interaction, station);
      if (track) {
        await m.edit({ components: [buildPlayingCard(station, track)], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        collector.stop("playing");
      } else {
        await m.edit({ components: [buildBrowserPage()], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }
    });

    collector.on("end", (_, reason) => {
      if (reason !== "playing") {
        m.edit({ components: [] }).catch(() => {});
      }
    });
  },
};

async function findAndPlayStation(client, interactionOrMessage, station) {
  const isInteraction = !!interactionOrMessage.guildId;
  const guildId  = isInteraction ? interactionOrMessage.guildId  : interactionOrMessage.guild.id;
  const channelId = isInteraction ? interactionOrMessage.channelId : interactionOrMessage.channel.id;
  const voiceId  = interactionOrMessage.member?.voice?.channelId;
  const requester = isInteraction ? interactionOrMessage.user.tag : interactionOrMessage.author.tag;

  if (!voiceId) return null;

  try {
    let player = client.kazagumo.players.get(guildId);
    if (!player) {
      player = await client.kazagumo.createPlayer({
        guildId,
        textId:  channelId,
        voiceId,
        volume:  100,
        deaf:    true,
      });
    } else if (interactionOrMessage.member?.voice?.channelId !== player.voiceId) {
      return null;
    }

    const result = await client.kazagumo.search(station.query, { requester });
    if (!result?.tracks?.length) return null;

    const track = result.tracks[0];
    player.queue.add(track);
    if (!player.playing && !player.paused) await player.play();
    return track;
  } catch {
    return null;
  }
}

async function playStation(client, message, station) {
  const track = await findAndPlayStation(client, message, station);
  if (!track) {
    return message.reply(send(error(`${e.no} Couldn't find a stream for **${station.name}**. Try again later.`)));
  }
  return message.reply({ components: [buildPlayingCard(station, track)], flags: MessageFlags.IsComponentsV2 });
}
