const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, MessageFlags,
} = require("discord.js");
const { getPlayer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "loop",
  aliases: ["repeat", "loopmode"],
  cooldown: "2",
  category: "music",
  usage: "[track / queue / off]",
  description: "Toggle loop mode: track, queue, or off.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message, args) => {
    const player = getPlayer(client, message.guild.id);
    const prefix = client.getPrefix(message.guild.id);
    const modes  = ["none", "track", "queue"];

    let mode;
    if (!args[0]) {
      const current = player.loop || "none";
      mode = modes[(modes.indexOf(current) + 1) % modes.length];
    } else {
      const input = args[0].toLowerCase();
      if      (["off", "none"].includes(input))          mode = "none";
      else if (["track", "song", "one"].includes(input)) mode = "track";
      else if (["queue", "all"].includes(input))         mode = "queue";
      else {
        return message.reply(send(error(
          `${e.warn} Invalid mode. Use: \`${prefix}loop track\`, \`${prefix}loop queue\`, or \`${prefix}loop off\``
        )));
      }
    }

    player.setLoop(mode);

    const modeData = {
      none:  { emoji: e.close,   label: "Off",         desc: "Loop is now **off**.                  The queue will play through once.", color: 0xED4245 },
      track: { emoji: e.loopOne, label: "Track Loop",  desc: `Now looping the **current track** on repeat.`,                           color: 0x57F287 },
      queue: { emoji: e.loop,    label: "Queue Loop",  desc: `Now looping the **entire queue**. It will restart when finished.`,       color: 0x57F287 },
    };

    const { emoji, label, desc, color } = modeData[mode];

    const c = new ContainerBuilder().setAccentColor(color);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emoji} Loop: ${label}`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${desc}\n\n` +
      `${e.info} **Options:**  \`${prefix}loop track\`  ${e.dot}  \`${prefix}loop queue\`  ${e.dot}  \`${prefix}loop off\``
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Changed by ${message.author.tag}`));
    return message.reply({ components: [c], flags: MessageFlags.IsComponentsV2 });
  },
};
