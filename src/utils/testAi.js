// testAi.js
const { generateSummaryFromImage, pullModel } = require("./ollama");

async function test() {
  await pullModel("gemma3:4b"); 
  const summary = await generateSummaryFromImage("./images/pp.jpg");
  console.log("AI Summary:", summary);
}

test();
