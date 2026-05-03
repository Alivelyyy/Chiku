const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "rotation",
  aliases: ["rotate", "rot"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply an audio rotation effect (similar to 8D but slower).",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "rotation",
    { rotation: { rotationHz: 0.1 } },
    `🔄 **Rotation** effect is now active!\n> Audio slowly rotates between left and right channels.`,
    0x3498DB
  ),
};
