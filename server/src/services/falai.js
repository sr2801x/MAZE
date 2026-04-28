const axios = require("axios");
const { AppError } = require("../utils/appError");

async function generateImageWithFal({ prompt }) {
  const apiKey = process.env.FAL_API_KEY || "ad137c24-d65d-4d99-b841-ec1aded2fb5b:73c3ffbbbf71d932abc02d8322c5b2b7";
  if (!apiKey) {
    throw new AppError("Missing FAL_API_KEY for fal.ai generation", 500);
  }

  try {
    const url = "https://api.fal.ai/v1/fal-ai/flux/dev";
    
    const response = await axios.post(
      url,
      {
        input: {
          prompt: prompt,
          num_inference_steps: 4,
          guidance_scale: 3.5,
          num_images: 1,
          width: 1024,
          height: 1024
        }
      },
      {
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 120000
      }
    );

    if (response.status === 200 && response.data.images && response.data.images[0]) {
      // Download the generated image
      const imageUrl = response.data.images[0].url;
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      
      return Buffer.from(imageResponse.data);
    } else {
      throw new AppError("Failed to generate image with fal.ai", 502);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new AppError("fal.ai authentication failed (check FAL_API_KEY)", 502);
    } else if (error.response?.status === 429) {
      throw new AppError("fal.ai rate limit exceeded", 429);
    } else if (error.code === "ECONNABORTED") {
      throw new AppError("Image generation timed out", 504);
    }
    throw new AppError(`fal.ai error: ${error.message}`, 502);
  }
}

module.exports = { generateImageWithFal };
