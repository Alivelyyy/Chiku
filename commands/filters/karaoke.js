const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "karaoke",
  aliases: ["vocal", "novocal"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply a karaoke filter to remove the center vocal channel.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "karaoke",
    { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
    `${e.mic} **Karaoke** mode is now active!\n> The center vocal channel has been filtered out. Sing along!`,
    0x1ABC9C
  ),
};
