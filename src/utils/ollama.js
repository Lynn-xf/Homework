const fs = require("fs");
const path = require("path");
const { Ollama } = require("ollama");
const { s3Client, BUCKET_NAME } = require("./setupS3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

// List of Ollama hosts
const hosts = ["http://ollama1:11434", "http://ollama2:11434"];
let current = 0;

// Function to get next Ollama client (round-robin)
function getOllamaClient() {
  const client = new Ollama({ host: hosts[current] });
  current = (current + 1) % hosts.length;
  return client;
}

async function pullModel(modelName = "gemma3:4b") {
  try {
    for (const host of hosts) {
      const client = new Ollama({ host });
      await client.pull({ model: modelName });
      console.log(`Model ${modelName} pulled successfully on ${host}`);
    }
  } catch (err) {
    console.error(`Error pulling model ${modelName}:`, err);
  }
}

async function generateSummaryFromImage(imagePath) {
  try {
    const absolutePath = path.resolve(imagePath);
    const imageData = fs.readFileSync(absolutePath);

    const ollama = getOllamaClient();

    const response = await ollama.chat({
      model: "gemma3:4b",
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

async function generateSummaryFromS3(s3Key) {
  try {
    if (!s3Key) {
      throw new Error('S3 key is required');
    }

    // Download image from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const imageData = Buffer.concat(chunks);

    const ollama = getOllamaClient();

    const aiResponse = await ollama.chat({
      model: "gemma3:4b",
      messages: [
        {
          role: "user",
          content: "Summarize the content of this image:",
          images: [imageData],
        },
      ],
    });

    return aiResponse.message?.content || "No summary generated.";
  } catch (err) {
    console.error("Error generating summary from S3 image:", err);
    return "AI summary could not be generated from S3 image.";
  }
}

module.exports = {
  generateSummaryFromImage,
  generateSummaryFromS3,
  pullModel,
};
