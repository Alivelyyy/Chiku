const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "tremolo",
  aliases: ["trem"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply a tremolo effect that rapidly varies the volume.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "tremolo",
    { tremolo: { frequency: 2.0, depth: 0.5 } },
    `〰️ **Tremolo** effect is now active!\n> Volume rapidly oscillates creating a wavering sound effect.`,
    0xE67E22
  ),
};
