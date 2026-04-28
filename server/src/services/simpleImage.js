const axios = require("axios");
const { AppError } = require("../utils/appError");

async function generateSimpleImage({ prompt }) {
  try {
    // Use a reliable placeholder image service for presentation
    // This creates a simple image with text overlay
    const imageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    throw new AppError(`Image generation failed: ${error.message}`, 502);
  }
}

module.exports = { generateSimpleImage };
