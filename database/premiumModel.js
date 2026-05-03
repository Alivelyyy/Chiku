const mongoose = require("mongoose");

const premiumSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  activatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  voucher: { type: String, default: null },
  grantedBy: { type: String, default: null },
}, { versionKey: false });

const Premium =
  mongoose.models.Premium ||
  mongoose.model("Premium", premiumSchema, "premium");

async function checkPremium(userId) {
  const doc = await Premium.findOne({ userId }).lean();
  if (!doc) return false;
  if (doc.expiresAt && doc.expiresAt < new Date()) {
    await Premium.deleteOne({ userId });
    return false;
  }
  return true;
}

async function getPremiumData(userId) {
  const doc = await Premium.findOne({ userId }).lean();
  if (!doc) return null;
  if (doc.expiresAt && doc.expiresAt < new Date()) {
    await Premium.deleteOne({ userId });
    return null;
  }
  return doc;
}

module.exports = { Premium, checkPremium, getPremiumData };
