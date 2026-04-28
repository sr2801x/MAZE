const { z } = require("zod");
const mongoose = require("mongoose");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/appError");
const { User } = require("../models/User");
const { Image } = require("../models/Image");
const { generateImageWithPollinations } = require("../services/pollinationsAI");
const { uploadPngBuffer } = require("../services/cloudinaryUpload");

const generateSchema = z.object({
  prompt: z.string().min(3).max(400),
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

module.exports = { generate, history };

