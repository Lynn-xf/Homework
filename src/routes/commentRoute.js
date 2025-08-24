const express = require('express');
const router = express.Router();
const controller = require('../controllers/comment');

const authMiddleware = require('../middlewares/authWithJwt');

// Define routes for comments
router.route('/')
    .all(authMiddleware)
    .get(controller.getAllcomments) // Get all comments
    .post(controller.createComment); //post comments to notes by noteId

// Define routes for specific comment operations
router.route('/:id')
    .all(authMiddleware)
    .get(controller.getcommentById) //get all comments by commentId
    .put(controller.updateComment) //update comment by commentId
    .delete(controller.deleteComment);//delete comment by commentId

module.exports = router;