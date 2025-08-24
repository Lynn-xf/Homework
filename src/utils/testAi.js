const { generateSummaryFromImage } = require("./ollama");

async function test() {
  const summary = await generateSummaryFromImage("./utils/images/note1.png");
  console.log("AI Summary:", summary);
}

test();
