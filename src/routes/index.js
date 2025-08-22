const express = require('express');

const AuthRouter = require('./authRoute');
const NoteRouter = require('./noteRoute');
const CommentRouter = require('./commentRoute');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the Homework API');
});

router.use('/auth', AuthRouter);
router.use('/notes', NoteRouter);  
router.use('/comments', CommentRouter);

module.exports = router;