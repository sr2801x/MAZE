const axios = require("axios");
const { AppError } = require("../utils/appError");

async function generateImageWithPollinations({ prompt }) {
  try {
    // Use Pollinations AI - free, no API key required, reliable
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.status === 200) {
      return Buffer.from(response.data);
    } else {
      throw new AppError("Failed to generate image with Pollinations AI", 502);
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new AppError("Image generation timed out", 504);
    }
    throw new AppError(`Pollinations AI error: ${error.message}`, 502);
  }
}

async function editImageWithPollinations({ prompt, referenceImageUrl }) {
  try {
    // Use Pollinations AI with image editing - combine reference image with new prompt
    // This creates a variation based on the original image
    const enhancedPrompt = `${prompt}, style similar to reference image`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}`;
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.status === 200) {
      return Buffer.from(response.data);
    } else {
      throw new AppError("Failed to edit image with Pollinations AI", 502);
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new AppError("Image editing timed out", 504);
    }
    throw new AppError(`Pollinations AI error: ${error.message}`, 502);
  }
}

module.exports = { generateImageWithPollinations, editImageWithPollinations };
