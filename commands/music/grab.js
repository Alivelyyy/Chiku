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
const { getPlayer } = require("@plugins/player");
const { send, error, success } = require("@plugins/embed");
const { formatDuration, formatProgressBar, extractYTThumbnail } = require("@utils/formatters");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "grab",
  aliases: ["save", "dm", "bookmark"],
  cooldown: "10",
  category: "music",
  usage: "",
  description: "Save the current track to your DMs with full track info.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const player  = getPlayer(client, message.guild.id);
    const track   = player.queue.current;

    if (!track) {
      return message.reply(send(error(`${e.music} Nothing is currently playing.`)));
    }

    const position = player.shoukaku?.position ?? 0;
    const duration = track.length ?? 0;
    const bar      = formatProgressBar(position, duration, 24);
    const artwork  = track.thumbnail || extractYTThumbnail(track.uri);

    const c = new ContainerBuilder().setAccentColor(0x9B59B6);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${e.grab} Track Saved`)
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (artwork) {
      c.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**[${track.title}](${track.uri})**\n` +
              `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${track.isStream ? "🔴 LIVE" : formatDuration(duration)}`
            )
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(artwork))
      );
    } else {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**[${track.title}](${track.uri})**\n` +
          `-# ${e.mic} ${track.author || "Unknown"}  ${e.dot}  ${e.time} ${track.isStream ? "🔴 LIVE" : formatDuration(duration)}`
        )
      );
    }

    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`${bar}\`\n` +
        `-# Saved at ${formatDuration(position)}  ${e.dash}  ${formatDuration(duration)}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.headphones} **Requested by:** ${track.requester}\n` +
        `${e.info} **Saved from:** ${message.guild.name}`
      )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${e.music} Chiku by ApeX Development`)
    );
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Open Track")
          .setEmoji(e.link)
          .setStyle(ButtonStyle.Link)
          .setURL(track.uri)
      )
    );

    try {
      await message.author.send({ components: [c], flags: MessageFlags.IsComponentsV2 });
      return message.reply(send(success(`${e.grab} Track saved! Check your DMs.`)));
    } catch {
      return message.reply(
        send(error(`${e.no} Couldn't send you a DM. Please enable **DMs from server members** and try again.`))
      );
    }
  },
};
