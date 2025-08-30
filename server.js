const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const { pullModel } = require("./src/utils/ollama");

const app = express();

const indexRouter = require('./src/routes/index');

app.use(express.json());
app.use(cors({exposedHeaders: ['Authorization'],origin: '*'}));
app.use(fileUpload());
app.use('/images', (req, res, next) => {
  const reqPath = req.path; // e.g. /file.jpg
  const p1 = path.join(__dirname, 'src', 'utils', 'images', reqPath);
  if (fs.existsSync(p1)) return res.sendFile(p1);

  const p2 = path.join(__dirname, 'utils', 'images', reqPath);
  if (fs.existsSync(p2)) return res.sendFile(p2);

  next();
});

app.use("/images", express.static(path.join(__dirname, "utils/images")));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/webclient', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

pullModel("gemma3:4b");


app.use('/api', indexRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Homework API');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = app;
