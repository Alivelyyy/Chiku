const { applyFilter } = require("@utils/filterHelper");
const e = require("@assets/emojis/black.js");

const BANDS = [
  { band: 0, gain: 0.6 }, { band: 1, gain: 0.7 }, { band: 2, gain: 0.8 },
  { band: 3, gain: 0.55 }, { band: 4, gain: 0.25 }, { band: 5, gain: 0.0 },
  { band: 6, gain: -0.25 }, { band: 7, gain: -0.45 }, { band: 8, gain: -0.55 },
  { band: 9, gain: -0.7 }, { band: 10, gain: -0.3 }, { band: 11, gain: -0.25 },
  { band: 12, gain: 0.0 }, { band: 13, gain: 0.0 }, { band: 14, gain: 0.0 },
];

module.exports = {
  name: "bassboost",
  aliases: ["bass", "bb"],
  cooldown: "3",
  category: "filters",
  usage: "",
  description: "Amplify the bass frequencies for a heavy, punchy sound.",
  args: false, vote: false, new: false, admin: false, owner: false, premium: false,
  botPerms: [], userPerms: [], player: true, queue: true, inVoiceChannel: true, sameVoiceChannel: true,
  execute: async (client, message) => applyFilter(
    client, message, "bassboost",
    { equalizer: BANDS },
    `${e.equalizer} **Bass Boost** is now active!\n> Low frequencies are amplified for a heavy, punchy sound.`,
    0x9B59B6
  ),
};
