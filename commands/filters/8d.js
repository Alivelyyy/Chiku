const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "8d",
  aliases: ["8daudio", "surround"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply the 8D audio rotation effect for an immersive surround-sound experience.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "8d",
    { rotation: { rotationHz: 0.2 } },
    `🌀 **8D Audio** is now active!\n> Audio rotates around your head for an immersive listening experience.\n\n${e.info} Tip: Use headphones for the best effect.`,
    0x3498DB
  ),
};
