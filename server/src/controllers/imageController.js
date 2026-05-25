const { z } = require("zod");
const mongoose = require("mongoose");
const axios = require("axios");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/appError");
const { User } = require("../models/User");
const { Image } = require("../models/Image");
const { generateImageWithPollinations, editImageWithPollinations } = require("../services/pollinationsAI");
const { editImageWithDALLE, analyzeImageWithVision } = require("../services/openai");
const { uploadPngBuffer } = require("../services/cloudinaryUpload");

const generateSchema = z.object({
  prompt: z.string().min(3).max(400),
});

const editSchema = z.object({
  imageId: z.string(),
  prompt: z.string().min(3).max(400),
});

const analyzeSchema = z.object({
  imageUrl: z.string().url(),
  prompt: z.string().optional(),
});

const generate = asyncHandler(async (req, res) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid prompt", 400);

  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Deduct 1 credit atomically (prevents race conditions)
  const updated = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: 1 } },
    { $inc: { credits: -1 } },
    { new: true }
  );
  if (!updated) throw new AppError("Insufficient credits", 402);

  const prompt = parsed.data.prompt.trim();

  // Generate via Pollinations AI (real AI image generation based on prompt)
  const bytes = await generateImageWithPollinations({ prompt });

  // Upload to Cloudinary
  const uploaded = await uploadPngBuffer({ buffer: bytes, folder: "maze/generated" });

  // Persist image
  const imageDoc = await Image.create({
    userId,
    prompt,
    imageUrl: uploaded.url,
    cloudinaryPublicId: uploaded.publicId,
  });

  // Append history item (latest first)
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        history: {
          $each: [
            {
              imageId: imageDoc._id,
              prompt,
              imageUrl: uploaded.url,
              createdAt: new Date(),
            },
          ],
          $position: 0,
          $slice: 200,
        },
      },
    }
  );

  res.json({
    ok: true,
    imageUrl: uploaded.url,
    creditsRemaining: updated.credits,
  });
});

const history = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.json({ ok: true, credits: user?.credits ?? 0, history: user?.history ?? [] });
});

const downloadImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.query;
  if (!imageUrl) throw new AppError("Image URL is required", 400);

  try {
    // Fetch the image from the URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    // Determine content type
    const contentType = response.headers['content-type'] || 'image/png';

    // Set headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="maze-image-${Date.now()}.png"`);
    res.setHeader('Content-Length', response.data.length);

    // Send the image data
    res.send(response.data);
  } catch (error) {
    console.error('Error downloading image:', error.message);
    throw new AppError("Failed to download image", 500);
  }
});

const deleteImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  if (!imageId) throw new AppError("Image ID is required", 400);

  // Find the image to verify it belongs to the user
  const image = await Image.findOne({ _id: imageId, userId });
  if (!image) throw new AppError("Image not found", 404);

  // Delete from Image collection
  await Image.deleteOne({ _id: imageId });

  // Remove from user's history
  await User.updateOne(
    { _id: userId },
    { $pull: { history: { imageId: new mongoose.Types.ObjectId(imageId) } } }
  );

  res.json({ ok: true, message: "Image deleted successfully" });
});

const editImage = asyncHandler(async (req, res) => {
  const parsed = editSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid input", 400);

  const { imageId, prompt } = parsed.data;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Find the original image to verify it belongs to the user
  const originalImage = await Image.findOne({ _id: imageId, userId });
  if (!originalImage) throw new AppError("Image not found", 404);

  // Deduct 1 credit atomically
  const updated = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: 1 } },
    { $inc: { credits: -1 } },
    { new: true }
  );
  if (!updated) throw new AppError("Insufficient credits", 402);

  // Use DALL-E Edit API for true image editing
  const editedImageUrl = await editImageWithDALLE({ 
    imageUrl: originalImage.imageUrl, 
    prompt 
  });

  // Create new image document
  const newImageDoc = await Image.create({
    userId,
    prompt: `${originalImage.prompt} (edited: ${prompt})`,
    imageUrl: editedImageUrl,
    cloudinaryPublicId: null, // DALL-E Edit returns URL, not Cloudinary upload
  });

  // Append to history
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        history: {
          $each: [
            {
              imageId: newImageDoc._id,
              prompt: `${originalImage.prompt} (edited: ${prompt})`,
              imageUrl: editedImageUrl,
              createdAt: new Date(),
            },
          ],
          $position: 0,
          $slice: 200,
        },
      },
    }
  );

  res.json({
    ok: true,
    imageUrl: editedImageUrl,
    creditsRemaining: updated.credits,
  });
});

const analyzeImage = asyncHandler(async (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid input", 400);

  const { imageUrl, prompt = "Describe this image in detail" } = parsed.data;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Deduct 1 credit atomically
  const updated = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: 1 } },
    { $inc: { credits: -1 } },
    { new: true }
  );
  if (!updated) throw new AppError("Insufficient credits", 402);

  // Use OpenAI Vision API to analyze image
  const analysis = await analyzeImageWithVision({ imageUrl, prompt });

  res.json({
    ok: true,
    analysis,
    creditsRemaining: updated.credits,
  });
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Upload to Cloudinary
  const uploaded = await uploadPngBuffer({ buffer: req.file.buffer, folder: "maze/uploads" });

  res.json({
    ok: true,
    imageUrl: uploaded.url,
  });
});

module.exports = { generate, history, downloadImage, deleteImage, editImage, analyzeImage, uploadImage };

