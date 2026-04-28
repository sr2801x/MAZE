const axios = require("axios");
const { AppError } = require("../utils/appError");

async function generateImageWithPuter({ prompt }) {
  try {
    // Use Puter.js AI image generation API (free, no API key required)
    const url = "https://api.puter.com/v1/ai/text2img";
    
    const response = await axios.post(
      url,
      {
        prompt: prompt,
        model: "dall-e-3", // Use DALL-E 3 for high quality
        quality: "standard",
        size: "1024x1024"
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 120000
      }
    );

    if (response.status === 200 && response.data.image_url) {
      // Download the generated image
      const imageUrl = response.data.image_url;
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      
      return Buffer.from(imageResponse.data);
    } else {
      throw new AppError("Failed to generate image with Puter AI", 502);
    }
  } catch (error) {
    if (error.response?.status === 429) {
      throw new AppError("Puter AI rate limit exceeded", 429);
    } else if (error.code === "ECONNABORTED") {
      throw new AppError("Image generation timed out", 504);
    }
    throw new AppError(`Puter AI error: ${error.message}`, 502);
  }
}

module.exports = { generateImageWithPuter };
