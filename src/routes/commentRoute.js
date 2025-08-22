const express = require('express');
const router = express.Router();
const controller = require('../controllers/comment');

const authMiddleware = require('../middlewares/authWithJwt');

// Define routes for comments
router.get('/')
    .all(authMiddleware)
    .get(controller.getAllComments)
    .post(controller.createComment); //post comments to notes by noteId

// Define routes for specific comment operations
router.get('/:id')
    .all(authMiddleware)
    .get(controller.getCommentById) //get all comments by commentId
    .put(controller.updateComment) //update comment by commentId
    .delete(controller.deleteComment);//delete comment by commentId

module.exports = router;