const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId:        { type: String, required: true, unique: true },
  prefix:         { type: String,  default: "!" },
  djRole:         { type: String,  default: null },
  musicChannel:   { type: String,  default: null },
  alwaysOn:       { type: Boolean, default: false },
  autoplay:       { type: Boolean, default: false },
  defaultVolume:  { type: Number,  default: 100, min: 1, max: 200 },
  announceSongs:  { type: Boolean, default: true },
  deleteNPAfter:  { type: Number,  default: 0 },
  language:       { type: String,  default: "en" },
}, { versionKey: false });

const GuildSettings =
  mongoose.models.GuildSettings ||
  mongoose.model("GuildSettings", guildSettingsSchema, "guild_settings");

const cache     = new Map();
const TTL       = 5 * 60 * 1000;
const DEFAULTS  = {
  prefix:        "!",
  djRole:        null,
  musicChannel:  null,
  alwaysOn:      false,
  autoplay:      false,
  defaultVolume: 100,
  announceSongs: true,
  deleteNPAfter: 0,
  language:      "en",
};

async function getSettings(guildId) {
  const cached = cache.get(guildId);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;

  let doc = await GuildSettings.findOne({ guildId }).lean();
  if (!doc) {
    doc = await GuildSettings.create({ guildId });
    doc = doc.toObject();
  }
  cache.set(guildId, { data: doc, ts: Date.now() });
  return doc;
}

async function updateSettings(guildId, update) {
  const doc = await GuildSettings.findOneAndUpdate(
    { guildId },
    { $set: update },
    { upsert: true, new: true }
  ).lean();
  cache.set(guildId, { data: doc, ts: Date.now() });
  return doc;
}

function invalidateCache(guildId) {
  cache.delete(guildId);
}

function getSafe(settings, key) {
  return settings?.[key] ?? DEFAULTS[key];
}

module.exports = {
  GuildSettings,
  getSettings,
  updateSettings,
  invalidateCache,
  getSafe,
  DEFAULTS,
};
