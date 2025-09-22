import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

const API_URL = "http://localhost:3000/api/notes"; //accesss to api
const IMAGE_PATH = "./test.jpg";

// WT token h
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzU2NTUyNDYyLCJleHAiOjE3NTY1NTYwNjJ9.ZGecbluxEGMn8PCfY0ekUdbSBhQqhMtL1UouFLOvazM";

async function sendRequest(i) {
  const form = new FormData();
  form.append("note_title", `Test Note ${i}`);
  form.append("note_picture", fs.createReadStream(IMAGE_PATH));

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`, // use the token directly
      },
      body: form,
    });

    const data = await res.json();
    console.log(`✅ Request ${i} finished:`, data);
  } catch (err) {
    console.error(`❌ Request ${i} failed:`, err.message);
  }
}

async function runLoadTest() {
  const totalRequests = 60;
  const concurrency = 2;
  let running = [];

  for (let i = 1; i <= totalRequests; i++) {
    running.push(sendRequest(i));
    if (running.length >= concurrency) {
      await Promise.all(running);
      running = [];
    }
  }

  if (running.length > 0) {
    await Promise.all(running);
  }

  console.log("🎉 Load test complete.");
}

runLoadTest();
