const express = require('express');
const router = express.Router();
const controller = require('../controllers/comment');

const authMiddleware = require('../middlewares/authenticateWithJwt');

// Define routes for comments
router.route('/')
    .all(authMiddleware)
    .get(controller.getAllComments) // Get all comments
    .post(controller.createComment); //post comments to notes by noteId

// Define routes for specific comment operations
router.route('/:id')
    .all(authMiddleware)
    .get(controller.getCommentById) //get all comments by commentId
    .put(controller.updateComment) //update comment by commentId
    .delete(controller.deleteComment);//delete comment by commentId


module.exports = router;