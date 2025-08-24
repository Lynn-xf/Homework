const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, query, validationResult } = require('express-validator');
// const Comment = require('../models/comment');
let {comments} = require("../utils/data");
const { v4: uuidv4 } = require('uuid');
const { generateComment } = require('../utils/ollama');
//Validation 
const commentValidator = () => [
    body('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),
    body('commentBy')
        .notEmpty().withMessage('Commenter is required')
        .isString().withMessage('Commenter must be a string'), // no longer MongoId
    body('commentTo')
        .notEmpty().withMessage('Commented note is required')
        .isString().withMessage('Commented note must be a string') // no longer MongoId
    // Optional fields for AI comments
];

// Get all comments with optional filtering
exports.getAllcomments = [
    asyncHandler(async (req, res, next) => {
        const {description, commentBy, commentTo} = req.query;

        let filteredComments = comments;
        if (description) {
            filteredComments = filteredComments.filter(comment => 
                comment.description.toLowerCase().includes(description.toLowerCase())
            );
        }
        if (commentBy) {
            filteredComments = filteredComments.filter(comment =>
                comment.commentBy === commentBy
            );
        }
        if (commentTo) {
            filteredComments = filteredComments.filter(comment =>
                comment.commentTo === commentTo
            );
        }
        res.status(200).json(filteredComments);
    })
];

// Create a new comment
exports.createComment = [
    commentValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Generate AI comment if prompt is provided
        let ai_comment = null;
        if (req.body.ai_prompt_comment && !ai_comment) {
            ai_comment = await generateComment(req.body.ai_prompt_comment);
        }

        const newComment = {
            id: uuidv4(),
            description: req.body.description,
            commentBy: req.body.commentBy,
            commentTo: req.body.commentTo,
            ai_prompt_comment: req.body.ai_prompt_comment || '',
            ai_comment
        };
        comments.push(newComment);
        res.status(201).json(newComment);
    }),
];

// Get a comment by ID
exports.getcommentById = [
    asyncHandler(async (req, res, next) => {
        const comment = comments.find(c => c.id === req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment);
    })
];

// Update a comment by ID
exports.updateComment = [
    commentValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const index = comments.findIndex(c => c.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const existing = comments[index];

        if (existing.commentBy !== req.user.user_id) {
            return res.status(403).json({ error: 'You are not allowed to update this comment' });
        }

        const updatedComment = {
            ...existing,
            description: req.body.description,
            commentBy: req.body.commentBy,
            commentTo: req.body.commentTo,
            ai_prompt_comment: req.body.ai_prompt_comment || existing.ai_prompt_comment,
            ai_comment: req.body.ai_comment || existing.ai_comment
        };

        comments[index] = updatedComment;
        res.status(200).json(updatedComment);

    })
];

// Delete a comment by ID
exports.deleteComment = [
    asyncHandler(async (req, res, next) => {

        const index = comments.findIndex(c => c.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const existing = comments[index];

        if (existing.commentBy !== req.user.user_id) {
            return res.status(403).json({ error: 'You are not allowed to delete this comment' });
        }

        comments.splice(index, 1);
        res.status(200).json({ message: 'Comment deleted successfully' });
    })
];
