const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./src/utils/mongodb');

connectToDatabase();
const app = express();

const indexRouter = require('./src/routes/index');

app.use(express.json());
app.use(cors({exposedHeaders: ['Authorization'],origin: '*'}));

app.use('/api', indexRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Homework API');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = app;