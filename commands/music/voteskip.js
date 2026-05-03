const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, SectionBuilder, ThumbnailBuilder, MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { voteskipButtons } = require("@plugins/button");
const { send, error } = require("@plugins/embed");
const { formatDuration, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "voteskip",
  aliases: ["vs", "vskip"],
  cooldown: "10",
  category: "music",
  usage: "",
  description: "Start a vote to skip the current track. Majority wins.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    const track  = player.queue?.current;
    if (!track) return message.reply(send(error(`${e.music} Nothing is currently playing.`)));

    if (!client._voteSessions) client._voteSessions = new Map();
    if (client._voteSessions.has(message.guild.id)) {
      return message.reply(send(error(`${e.voteskip} A vote is already in progress. Please wait for it to finish.`)));
    }

    const voiceChannel = message.member.voice.channel;
    const members      = voiceChannel.members.filter(m => !m.user.bot);
    const needed       = Math.ceil(members.size / 2);

    const yesVotes = new Set([message.author.id]);
    const noVotes  = new Set();

    function buildVoteContainer(done = false, result = null) {
      const artwork = track.thumbnail || extractYTThumbnail(track.uri);
      const color   = done
        ? (result === "skip" ? 0x57F287 : result === "no" ? 0xED4245 : 0xFEE75C)
        : 0x5865F2;

      const c = new ContainerBuilder().setAccentColor(color);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.voteskip} Vote Skip`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

      if (artwork) {
        c.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**[${track.title}](${track.uri})**\n` +
                `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
              )
            )
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
        );
      } else {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${formatDuration(track.length)}`
        ));
      }

      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

      if (done) {
        const resultText =
          result === "skip"    ? `${e.yes} **Vote passed!** Track has been skipped.` :
          result === "no"      ? `${e.no} **Vote failed.** Not enough votes to skip.` :
                                 `${e.warn} **Vote timed out.** Not enough votes were cast.`;
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(resultText));
      } else {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `${e.yes} **Yes:** \`${yesVotes.size}\`  ${e.dot}  ${e.no} **No:** \`${noVotes.size}\`\n` +
          `> Need \`${needed}\` yes votes from \`${members.size}\` listeners to skip.`
        ));
        c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `-# ${e.clock || e.time} Vote expires in 30 seconds  ${e.dot}  Started by ${message.author.tag}`
        ));
        c.addActionRowComponents(voteskipButtons(yesVotes.size, noVotes.size, needed));
      }

      return c;
    }

    const session = { yesVotes, noVotes, needed, track, members };
    client._voteSessions.set(message.guild.id, session);

    const m = await message.reply({
      components: [buildVoteContainer()],
      flags: MessageFlags.IsComponentsV2,
    });

    session.messageId = m.id;
    session.update    = async () => {
      await m.edit({ components: [buildVoteContainer()], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    };

    const collector = m.createMessageComponentCollector({
      filter: async (i) => {
        if (!members.has(i.user.id)) {
          await i.reply(send(error(`${e.headphones} You must be in the voice channel to vote.`))).catch(() => {});
          return false;
        }
        return i.customId === "voteskip_yes" || i.customId === "voteskip_no";
      },
      time: 30000,
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate().catch(() => {});
      if (interaction.customId === "voteskip_yes") {
        noVotes.delete(interaction.user.id);
        yesVotes.add(interaction.user.id);
      } else {
        yesVotes.delete(interaction.user.id);
        noVotes.add(interaction.user.id);
      }

      if (yesVotes.size >= needed) {
        collector.stop("skip");
      } else if (noVotes.size > members.size - needed) {
        collector.stop("no");
      } else {
        await session.update();
      }
    });

    collector.on("end", async (_, reason) => {
      client._voteSessions.delete(message.guild.id);
      if (reason === "skip") {
        try { player.skip(); } catch (_) {}
        await m.edit({ components: [buildVoteContainer(true, "skip")], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      } else if (reason === "no") {
        await m.edit({ components: [buildVoteContainer(true, "no")], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      } else {
        await m.edit({ components: [buildVoteContainer(true, "timeout")], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }
    });
  },
};
