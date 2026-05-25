const axios = require("axios");
const FormData = require("form-data");
const { AppError } = require("../utils/appError");

async function editImageWithDALLE({ imageUrl, prompt }) {
  try {
    // Use Pollinations AI for free image editing (generates variations based on prompt)
    const enhancedPrompt = `${prompt}, style similar to reference image, high quality`;
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
      throw new AppError("Failed to edit image", 502);
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new AppError("Image editing timed out", 504);
    }
    throw new AppError(`Image edit failed: ${error.message}`, 502);
  }
}

async function analyzeImageWithVision({ imageUrl, prompt = "Describe this image in detail" }) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError("OPENROUTER_API_KEY not configured", 500);
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://maze.app",
          "X-Title": "MAZE",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Vision API error:", error.response?.data || error.message);
    throw new AppError(`Vision API failed: ${error.message}`, 500);
  }
}

module.exports = { editImageWithDALLE, analyzeImageWithVision };
