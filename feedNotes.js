// feedNotes.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_URL = "http://ec2-54-252-250-12.ap-southeast-2.compute.amazonaws.com/api/notes";
const AUTH_TOKEN ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpc19hZG1pbiI6dHJ1ZSwiaWF0IjoxNzU2NDM4Mjk5LCJleHAiOjE3NTY0NDE4OTl9.PlkJVzSrAONz2M_Cx1gChMZSRGMll_HojU_JbJ5xsU4"; // replace with your real token

// folder where all images are stored
const IMAGES_DIR = path.resolve("./images");

// auto read all image files in folder
const imageFiles = fs.readdirSync(IMAGES_DIR).filter(file =>
  /\.(png|jpg|jpeg|gif)$/i.test(file)
);

async function createNoteFromImage(imageFile, index) {
  const form = new FormData();
  const title = `Note from ${imageFile}`;
  const description = `Auto-generated note #${index + 1} with image ${imageFile}`;

  form.append("note_title", title);
  form.append("note_description", description);
  form.append("note_picture", fs.createReadStream(path.join(IMAGES_DIR, imageFile)));

  try {
    const res = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });
    console.log(`✅ Created note ${index + 1}:`, res.data);
  } catch (err) {
    console.error(`❌ Error creating note ${index + 1}:`, err.response?.data || err.message);
  }
}

async function main() {
  for (let i = 0; i < imageFiles.length; i++) {
    await createNoteFromImage(imageFiles[i], i);
  }
}

main();
