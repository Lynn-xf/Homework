const express = require('express');
const cors = require('cors');
var path = require('path');

const app = express();

const indexRouter = require('./src/routes/index');

main().catch(err => console.log(err));

app.use(express.json());
app.use(cors({exposedHeaders: ['Authorization'],origin: '*'}));

app.use('/api', indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const PORT = process.env.PORT || 3000;
module.exports = app;