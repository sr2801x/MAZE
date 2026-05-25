const axios = require("axios");
const FormData = require("form-data");
const { AppError } = require("../utils/appError");

async function editImageWithDALLE({ imageUrl, prompt }) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError("OPENROUTER_API_KEY not configured", 500);
  }

  try {
    // Download the image from the URL
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Create form data with the image file
    const form = new FormData();
    form.append('image', imageBuffer, 'image.png');
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1024x1024');

    const response = await axios.post(
      "https://api.openrouter.ai/api/v1/images/edits",
      form,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          ...form.getHeaders(),
        },
      }
    );

    return response.data.data[0].url;
  } catch (error) {
    console.error("DALL-E Edit error:", error.response?.data || error.message);
    throw new AppError(`DALL-E Edit failed: ${error.message}`, 500);
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
