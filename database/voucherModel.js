const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  usedBy: { type: String, default: null },
  usedAt: { type: Date, default: null },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  duration: { type: Number, default: null },
}, { versionKey: false });

const Voucher =
  mongoose.models.Voucher ||
  mongoose.model("Voucher", voucherSchema, "vouchers_v2");

function generateCode(length = 16) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

module.exports = { Voucher, generateCode };
