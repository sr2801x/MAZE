const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  if (!mongoUri) throw new Error("Missing MONGODB_URI");

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
}

module.exports = { connectDb };