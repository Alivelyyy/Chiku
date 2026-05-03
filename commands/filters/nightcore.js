const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

module.exports = {
  name: "nightcore",
  aliases: ["nc", "anime"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Speed up the track and raise the pitch for an energetic nightcore effect.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "nightcore",
    { timescale: { speed: 1.2, pitch: 1.2, rate: 1.0 } },
    `⬆️ **Nightcore** mode is now active!\n> Speed and pitch are increased for that energetic anime-style sound.`,
    0x9B59B6
  ),
};
