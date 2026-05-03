const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "lowpass",
  aliases: ["lp", "soft"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Apply a low-pass filter for a mellow, smooth audio experience.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "lowpass",
    { lowPass: { smoothing: 20.0 } },
    `🌊 **Low Pass** filter is now active!\n> High frequencies are cut for a smooth, mellow listening experience.`,
    0x3498DB
  ),
};
