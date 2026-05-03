const { MessageFlags } = require("discord.js");
const { getPlayer, buildNPContainer } = require("@plugins/player");
const { send, error } = require("@plugins/embed");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "nowplaying",
  aliases: ["np", "playing", "current"],
  cooldown: "3",
  category: "music",
  usage: "",
  description: "Show the currently playing track with live controls.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true,
  inVoiceChannel: false, sameVoiceChannel: false,
  execute: async (client, message) => {
    const player = getPlayer(client, message.guild.id);
    if (!player?.queue?.current) return message.reply(send(error(`${e.music} Nothing is currently playing.`)));
    const container = buildNPContainer(player);
    if (!container) return message.reply(send(error(`${e.music} Nothing is currently playing.`)));
    return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  },
};