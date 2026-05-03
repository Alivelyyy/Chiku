const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "distortion",
  aliases: ["distort", "dist"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply a distortion effect to the audio.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "distortion",
    {
      distortion: {
        sinOffset: 0.0, sinScale: 1.0,
        cosOffset: 0.0, cosScale: 1.0,
        tanOffset: 0.0, tanScale: 1.0,
        offset: 0.0, scale: 1.5,
      },
    },
    `⚡ **Distortion** is now active!\n> A distortion effect has been applied to the audio.`,
    0xE74C3C
  ),
};
