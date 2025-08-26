const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require("express-fileupload");
const path = require("path");
const { pullModel } = require("./src/utils/ollama");

const app = express();

const indexRouter = require('./src/routes/index');

app.use(express.json());
app.use(cors({exposedHeaders: ['Authorization'],origin: '*'}));
app.use(fileUpload());
app.use("/images", express.static(path.join(__dirname, "utils/images")));
pullModel("gemma3");


app.use('/api', indexRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Homework API');
});
ap

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = app;