const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, query, validationResult } = require('express-validator');
const Comment = require('../models/comment');

exports.getAllcomments = [
    query('description', 'commentBy', 'commentTo').optional().trim(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const description = req.query.description || '';
        const commentBy = req.query.commentBy || '';
        const commentTo = req.query.commentTo || '';
        const query = {
            description: { $regex: description, $options: 'i' },
            commentBy: commentBy ? mongoose.Types.ObjectId(commentBy) : undefined,
            commentTo: commentTo ? mongoose.Types.ObjectId(commentTo) : undefined
        };
        const comments = await Comment.find(query).populate('commentBy', 'username').populate('commentTo', 'note_title').exec();
        res.status(200).json(comments);
    })
];

const commentValidator = () => {
    return [
        body('description')
            .notEmpty().withMessage('Description is required')
            .isString().withMessage('Description must be a string'),
        body('commentBy')
            .notEmpty().withMessage('Commenter is required')
            .isMongoId().withMessage('Commenter must be a valid MongoDB ObjectId'),
        body('commentTo')
            .notEmpty().withMessage('Commented note is required')
            .isMongoId().withMessage('Commented note must be a valid MongoDB ObjectId')
        // Optional fields for AI comments
    ];
}

exports.createComment = [
    commentValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const comment = new Comment({
            description: req.body.description,
            commentBy: req.body.commentBy,
            commentTo: req.body.commentTo,
            // Optional fields for AI comments
            ai_prompt_comment: req.body.ai_prompt_comment || null,
            ai_comment: req.body.ai_comment || null
        });

        await comment.save();
        res.status(201).json(comment);
    })];

exports.getcommentById = [
    asyncHandler(async (req, res, next) => {
        const comment = await Comment.findById(req.params.id).populate('commentBy', 'username').populate('commentTo', 'note_title').exec();
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment);
    })
];

exports.updateComment = [
    commentValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user is allowed to update the comment
        if (comment.commentBy.toString() !== req.user.user_id && !req.user.is_admin) {
            return res.status(403).json({ error: 'You are not allowed to modify this comment' });
        }

        // Update the comment fields
        comment.description = req.body.description;
        comment.commentBy = req.body.commentBy;
        comment.commentTo = req.body.commentTo;
        comment.ai_prompt_comment = req.body.ai_prompt_comment || comment.ai_prompt_comment;
        comment.ai_comment = req.body.ai_comment || comment.ai_comment;

        await comment.save();
        res.status(200).json(comment);
    })
];

exports.deleteComment = [
    asyncHandler(async (req, res, next) => {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user is allowed to delete the comment
        if (comment.commentBy.toString() !== req.user.user_id && !req.user.is_admin) {
            return res.status(403).json({ error: 'You are not allowed to delete this comment' });
        }

        await comment.remove();
        res.status(204).send();
    })
];
