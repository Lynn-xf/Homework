// utils/ollama.js
const ollama = require("ollama-node");
const fs = require("fs");
const path = require("path");

async function generateSummaryFromImage(imagePath) {
  try {
    const response = await ollama.generate({
      model: 'gemma3',
      prompt: 'Generate a concise summary for the content in this image:',
      image: imagePath,
      temperature: 0.7,
    });
    return response.text;
  } catch (err) {
    console.error('Error generating summary from image:', err);
    return 'AI summary could not be generated from image.';
  }
}


module.exports = {
  generateSummaryFromImage,
};
