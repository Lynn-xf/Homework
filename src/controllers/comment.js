const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { generateComment } = require("../utils/ollama");
const { Comment } = require("../models"); // Sequelize Comment model

// ✅ Validation
const commentValidator = () => [
  body("description")
    .notEmpty().withMessage("Description is required")
    .isString().withMessage("Description must be a string"),

  body("commentBy")
    .notEmpty().withMessage("Commenter is required")
    .isInt().withMessage("Commenter must be a valid user ID"),

  body("commentTo")
    .notEmpty().withMessage("Commented note is required")
    .isInt().withMessage("Commented note must be a valid note ID"),

  body("ai_prompt_comment").optional().isString(),
  body("ai_comment").optional().isString(),
];

// ✅ Get all comments (with optional filters)
exports.getAllComments = asyncHandler(async (req, res) => {
  const { description, commentBy, commentTo } = req.query;

  const where = {};
  if (description) where.description = { [Op.like]: `%${description}%` };
  if (commentBy) where.commentBy = commentBy;
  if (commentTo) where.commentTo = commentTo;

  const comments = await Comment.findAll({ where });
  res.status(200).json(comments);
});

// ✅ Create a new comment
exports.createComment = [
  commentValidator(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let ai_comment = null;
    if (req.body.ai_prompt_comment && !ai_comment) {
      ai_comment = await generateComment(req.body.ai_prompt_comment);
    }

    const newComment = await Comment.create({
      id: uuidv4(),
      description: req.body.description,
      commentBy: req.body.commentBy,
      commentTo: req.body.commentTo,
      ai_prompt_comment: req.body.ai_prompt_comment || "",
      ai_comment,
    });

    res.status(201).json(newComment);
  }),
];

// ✅ Get comment by ID
exports.getCommentById = asyncHandler(async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }
  res.status(200).json(comment);
});

// ✅ Update comment
exports.updateComment = [
  commentValidator(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.commentBy !== req.user.user_id) {
      return res.status(403).json({ error: "You are not allowed to update this comment" });
    }

    await comment.update({
      description: req.body.description,
      ai_prompt_comment: req.body.ai_prompt_comment || comment.ai_prompt_comment,
      ai_comment: req.body.ai_comment || comment.ai_comment,
    });

    res.status(200).json(comment);
  }),
];

// ✅ Delete comment
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  if (comment.commentBy !== req.user.user_id) {
    return res.status(403).json({ error: "You are not allowed to delete this comment" });
  }

  await comment.destroy();
  res.status(200).json({ message: "Comment deleted successfully" });
});

