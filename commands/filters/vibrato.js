const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "vibrato",
  aliases: ["vib"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply a vibrato effect that rapidly varies the pitch.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "vibrato",
    { vibrato: { frequency: 2.0, depth: 0.5 } },
    `🎶 **Vibrato** effect is now active!\n> Pitch rapidly oscillates creating a wavering, expressive sound.`,
    0x1ABC9C
  ),
};
