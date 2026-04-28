const { initCloudinary } = require("../config/cloudinary");
const { AppError } = require("../utils/appError");

async function uploadPngBuffer({ buffer, folder }) {
  const cloudinary = initCloudinary();
  const dataUri = `data:image/png;base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder || "maze/generated",
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (_e) {
    throw new AppError("Cloudinary upload failed", 502);
  }
}

module.exports = { uploadPngBuffer };

