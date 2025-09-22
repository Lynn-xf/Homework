const express = require('express');
const router = express.Router();
const controller = require('../controllers/comment');

const authenticateWithJwt = require('../middlewares/authenticateWithJwt');

// Define routes for comments
router.route('/')
    .get(controller.getAllComments) // Get all comments
    .post(authenticateWithJwt, controller.createComment); //post comments to notes by noteId

// Define routes for specific comment operations
router.route('/:id')
    .get(controller.getCommentById) //get all comments by commentId
    .put(authenticateWithJwt,controller.updateComment) //update comment by commentId
    .delete(authenticateWithJwt,controller.deleteComment); // delete comment by commentId


module.exports = router;
