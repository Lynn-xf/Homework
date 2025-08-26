const fs = require("fs");
const path = require("path");
const { Ollama } = require("ollama");

const ollama = new Ollama({ host: "http://localhost:11434" });

async function pullModel(modelName) {
  try {
    await ollama.pull({ model: modelName });
    console.log(`Model ${modelName} pulled successfully.`);
  } catch (err) {
    console.error(`Error pulling model ${modelName}:`, err);
  }
}

async function generateSummaryFromImage(imagePath) {
  try {
    const absolutePath = path.resolve(imagePath);
    const imageData = fs.readFileSync(absolutePath);

    const response = await ollama.chat({
      model: "gemma3",
      messages: [
        {
          role: "user",
          content: "Summarize the content of this image:",
          images: [imageData], 
        },
      ],
    });

    return response.message?.content || "No summary generated.";
  } catch (err) {
    console.error("Error generating summary from image:", err);
    return "AI summary could not be generated from image.";
  }
}

module.exports = {
  generateSummaryFromImage,
  pullModel,
};
