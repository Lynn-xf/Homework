// testAi.js
const { generateSummaryFromImage, pullModel } = require("./ollama");

async function test() {
  await pullModel("gemma3"); 
  const summary = await generateSummaryFromImage("./images/note1.png");
  console.log("AI Summary:", summary);
}

test();