const mongoose = require("mongoose");

const kvSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { versionKey: false });

const storeCache = new Map();

function createKVStore(namespace) {
  if (storeCache.has(namespace)) return storeCache.get(namespace);

  const modelName = `KV_${namespace}`;
  const Model =
    mongoose.models[modelName] || mongoose.model(modelName, kvSchema, `kv_${namespace}`);

  const store = {
    async get(key) {
      const doc = await Model.findById(key).lean();
      return doc ? doc.value : null;
    },
    async set(key, value) {
      await Model.findOneAndUpdate(
        { _id: key },
        { value },
        { upsert: true, new: true }
      );
      return value;
    },
    async delete(key) {
      await Model.deleteOne({ _id: key });
    },
    async has(key) {
      const doc = await Model.findById(key).lean();
      return !!doc;
    },
    async getAll() {
      const docs = await Model.find().lean();
      return docs.map((d) => ({ key: d._id, value: d.value }));
    },
  };

  storeCache.set(namespace, store);
  return store;
}

module.exports = { createKVStore };
