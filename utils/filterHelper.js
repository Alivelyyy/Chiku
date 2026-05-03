const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { send, error } = require("@plugins/embed");
const { getPlayer } = require("@plugins/player");
const e = require("@assets/emojis/black.js");

async function applyFilter(client, message, filterName, filterData, description, color = 0x9B59B6) {
  const player = getPlayer(client, message.guild.id);
  const prefix = client.getPrefix(message.guild.id);

  if (!player) {
    return message.reply(send(error(`${e.music} No active player. Use \`${prefix}play\` to start music.`)));
  }
  if (!message.member.voice?.channel) {
    return message.reply(send(error(`${e.headphones} You must be in a voice channel.`)));
  }
  if (message.member.voice.channelId !== player.voiceId) {
    return message.reply(send(error(`${e.headphones} You must be in the same voice channel as me.`)));
  }

  try {
    if (filterName === "reset") {
      await player.shoukaku.setFilters({});
      player._currentFilter = null;
    } else {
      await player.shoukaku.setFilters(filterData);
      player._currentFilter = filterName;
    }
  } catch {
    return message.reply(send(error(`${e.no} Failed to apply the filter. Please try again.`)));
  }

  const c = new ContainerBuilder().setAccentColor(color);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${e.filter} Filter Applied`));
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(description));
  c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
    `-# Active: **${player._currentFilter || "None"}**  ${e.dot}  Applied by ${message.author.tag}`
  ));
  return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
}

module.exports = { applyFilter };
