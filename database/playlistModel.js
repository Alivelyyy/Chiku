const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  title: String,
  author: String,
  uri: String,
  length: Number,
  isStream: Boolean,
  thumbnail: String,
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  tracks: { type: [trackSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

playlistSchema.index({ userId: 1, name: 1 }, { unique: true });

const Playlist =
  mongoose.models.Playlist ||
  mongoose.model("Playlist", playlistSchema, "playlists");

const FREE_LIMIT = { playlists: 3, tracks: 50 };
const PREMIUM_LIMIT = { playlists: 25, tracks: 500 };

async function isPremium(userId) {
  const { Premium } = require("./premiumModel");
  const doc = await Premium.findOne({ userId }).lean();
  if (!doc) return false;
  if (doc.expiresAt && doc.expiresAt < new Date()) return false;
  return true;
}

async function getLimits(userId) {
  return (await isPremium(userId)) ? PREMIUM_LIMIT : FREE_LIMIT;
}

module.exports = { Playlist, getLimits, FREE_LIMIT, PREMIUM_LIMIT };
