const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", ImageSchema);

module.exports = { Image };

