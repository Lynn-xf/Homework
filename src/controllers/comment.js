const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { Comment, User, Note } = require("../models"); // Sequelize models
const { getArtSuggestion } = require("../utils/harvardArt");
const { Op } = require("sequelize");
const { getCommentsCached } = require("../utils/memCached");

// ✅ Validation
const commentValidator = () => [
  body("description")
    .notEmpty().withMessage("Description is required")
    .isString().withMessage("Description must be a string"),

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

  // Fetch all comments from ElastiCache first,
  // then fetch from Database if there is no cache
  const comments = await getCommentsCached();

  // Manually attach user information by looking up cognitoId
  for (let comment of comments) {
    const user = await User.findOne({
      where: { cognitoId: comment.commentBy },
      attributes: ["username", "cognitoId"]
    });
    comment.dataValues.User = user;
    //comment.User = user;
  }

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
    try {
      let ai_comment = "";

      // Process AI comment if ai_prompt_comment is provided
      if (req.body.ai_prompt_comment && req.body.ai_prompt_comment.trim()) {
        try {
          console.log("🎨 Generating AI comment with prompt:", req.body.ai_prompt_comment);
          ai_comment = await getArtSuggestion(req.body.ai_prompt_comment);
          console.log("✅ AI comment generated:", ai_comment);
        } catch (error) {
          console.error("❌ Error generating AI comment:", error);
          ai_comment = "Sorry, I couldn't generate an AI comment at this time.";
        }
      }

      // User Comment
      const newComment = await Comment.create({
        description: req.body.description,
        commentBy: req.user.user_id,  // This is the cognitoId from JWT
        commentTo: req.body.commentTo,
        ai_prompt_comment: req.body.ai_prompt_comment || "",
        ai_comment
      });

      // Fetch the created comment with associations for response
      const createdComment = await Comment.findByPk(newComment.id, {
        include: [
          {
            model: Note,
            as: "Note",
            attributes: ["note_title", "id"]
          }
        ]
      });

      // Manually attach user information
      const user = await User.findOne({
        where: { cognitoId: newComment.commentBy },
        attributes: ["username", "cognitoId"]
      });
      createdComment.dataValues.User = user;

      res.status(201).json({ message: "Comment created successfully"});
    } catch (err) {
      console.error("Failed to create comment: " + err.message);
      //return res.status(500).json({errors: "Internal Server Error", details: err.message});
      return res.status(500).json({errors: "Internal Server Error", details: err.message, user: req.user.user_id });
    }
  }),
];

// ✅ Get comment by ID
exports.getCommentById = asyncHandler(async (req, res) => {
  const comment = await Comment.findByPk(req.params.id, {
    include: [
      {
        model: Note,
        as: "Note",
        attributes: ["note_title", "id"]
      }
    ]
  });
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  // Manually attach user information
  const user = await User.findOne({
    where: { cognitoId: comment.commentBy },
    attributes: ["username", "cognitoId"]
  });
  comment.dataValues.User = user;

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

    // Check if user owns this comment (using cognitoId)
    if (comment.commentBy !== req.user.user_id) {
      return res.status(403).json({ error: "You are not allowed to update this comment" });
    }

    // Process AI comment if ai_prompt_comment is updated
    let ai_comment = comment.ai_comment;
    if (req.body.ai_prompt_comment && req.body.ai_prompt_comment.trim() && 
        req.body.ai_prompt_comment !== comment.ai_prompt_comment) {
      try {
        console.log("🎨 Regenerating AI comment with new prompt:", req.body.ai_prompt_comment);
        ai_comment = await getArtSuggestion(req.body.ai_prompt_comment);
        console.log("✅ New AI comment generated:", ai_comment);
      } catch (error) {
        console.error("❌ Error regenerating AI comment:", error);
        ai_comment = "Sorry, I couldn't generate an AI comment at this time.";
      }
    }

    await comment.update({
      description: req.body.description,
      ai_prompt_comment: req.body.ai_prompt_comment || comment.ai_prompt_comment,
      ai_comment: ai_comment,
    });

    // Return updated comment with associations
    const updatedComment = await Comment.findByPk(req.params.id, {
      include: [
        {
          model: Note,
          as: "Note",
          attributes: ["note_title", "id"]
        }
      ]
    });

    // Manually attach user information
    const user = await User.findOne({
      where: { cognitoId: updatedComment.commentBy },
      attributes: ["username", "cognitoId"]
    });
    updatedComment.dataValues.User = user;

    res.status(200).json(updatedComment);
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

