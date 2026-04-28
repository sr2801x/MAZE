require('dotenv').config();
const { generateImageWithFal } = require('./src/services/falai');

async function testFal() {
  try {
    console.log('Testing fal.ai image generation...');
    console.log('FAL_API_KEY:', process.env.FAL_API_KEY ? 'SET' : 'NOT SET');
    
    const result = await generateImageWithFal({ prompt: "a cat sitting on a table" });
    console.log('Success! Image generated, size:', result.length, 'bytes');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFal();
