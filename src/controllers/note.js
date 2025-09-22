const { Note, Comment, User } = require("../models");
const { generateSummaryFromImage, generateSummaryFromS3 } = require("../utils/ollama");
const { uploadNoteImage, deleteNoteImage } = require("../utils/s3Helper");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");

// ✅ Validation rules for creating notes
const noteValidator = () => [
  body("note_title")
    .notEmpty().withMessage("Title is required")
    .isString().withMessage("Title must be a string"),

  body("time")
    .optional()
    .isISO8601().withMessage("Time must be a valid date string"),
];

// ✅ Get all notes (with optional filters)
exports.getAllNotes = asyncHandler(async (req, res) => {
  const { note_title, ai_summary, time, owner } = req.query;

  let where = {};
  if (note_title) where.note_title = { [Op.like]: `%${note_title}%` };
  if (ai_summary) where.ai_summary = { [Op.like]: `%${ai_summary}%` };
  if (time) where.time = time;
  if (owner) where.ownerId = owner;

  // Normal users can only see their own notes, admins can see all notes
  if (!req.user.is_admin) {
    if (req.user.auth_provider === 'google') {
      // For Google users, use their Google ID directly (no database lookup)
      where.ownerId = req.user.user_id;
    } else {
      // For Cognito users, look up the user in database (existing flow)
      const user = await User.findOne({
        where: { cognitoId: req.user.user_id }
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      where.ownerId = user.id; // Use the database user ID
    }
  }

  const notes = await Note.findAll({
    where,
    include: [
      { model: Comment, as: "Comments", attributes: ["id", "description", "createdAt", "commentBy", "ai_comment", "ai_prompt_comment"] },
      { model: User, as: "Owner", attributes: ["id", "username", "cognitoId"] }
    ]
  });

  // Generate presigned URLs for S3 images and manually attach user information to comments based on cognitoId
  const { getNoteImageUrl, isS3Image } = require("../utils/s3Helper");
  
  for (let note of notes) {
    // Generate presigned URL for S3 images
    if (note.note_picture && isS3Image(note.note_picture)) {
      try {
        const presignedUrl = await getNoteImageUrl(note.note_picture);
        note.dataValues.presignedUrl = presignedUrl;
      } catch (error) {
        console.error("Error generating presigned URL for note", note.id, ":", error);
        note.dataValues.presignedUrl = null;
      }
    }

    // Manually attach user information to comments based on cognitoId
    if (note.Comments && note.Comments.length > 0) {
      for (let comment of note.Comments) {
        const user = await User.findOne({
          where: { cognitoId: comment.commentBy },
          attributes: ["username", "cognitoId"]
        });
        comment.dataValues.User = user;
      }
    }
  }

  res.status(200).json(notes);
});


exports.createNote = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.files || !req.files.note_picture) {
    return res.status(400).json({ error: "Note picture is required" });
  }

  console.log("🔍 req.user in createNote:", req.user);
  const userId = req.user.user_id;
  console.log("🔍 userId extracted:", userId);
  if (!userId) {
    console.log("❌ No userId found, req.user:", req.user);
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.body.note_title) {
    return res.status(400).json({ error: "Note title is required" });
  }

  const noteFile = req.files.note_picture;

  try {
    let ownerId;
    
    if (req.user.auth_provider === 'google') {
      // For Google users, use their Google ID directly
      ownerId = userId;
    } else {
      // For Cognito users, look up the user in database (existing flow)
      const user = await User.findOne({
        where: { cognitoId: userId }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }
      
      ownerId = user.id;
    }

    const s3UploadResult = await uploadNoteImage(noteFile, userId);

    const newNote = await Note.create({
      note_title: req.body.note_title,
      note_picture: s3UploadResult.s3Key,
      ai_summary: "Processing...",
      time: req.body.time || null,
      ownerId: ownerId,
    });

    // Fire off AI summary generation in background for S3 image
    (async () => {
      try {
        const summary = await generateSummaryFromS3(s3UploadResult.s3Key);
        await newNote.update({ ai_summary: summary });
        console.log("AI summary updated for note:", newNote.id);
      } catch (aiError) {
        console.error("Error updating AI summary:", aiError);
        await newNote.update({ ai_summary: "AI summary could not be generated." });
      }
    })();

    const responseNote = {
      ...newNote.toJSON(),
      presignedUrl: s3UploadResult.presignedUrl
    };

    res.status(201).json(responseNote);
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    res.status(500).json({ error: "Failed to upload file to S3: " + error.message });
  }
});


// ✅ Delete all notes
exports.deleteAllNotes = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
   // Admin can remove all notes
  if (req.user.is_admin) {
    const deletedCount = await Note.destroy({ where: {} });
    return res.status(200).json({ message: `${deletedCount} notes deleted successfully (all)` });
  }
});

// ✅ Get note by ID
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findByPk(req.params.id, {
    include: [
      { model: Comment, as: "Comments" },
      { model: User, as: "Owner", attributes: ["id", "username", "cognitoId"] }
    ]
  });

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  // Generate presigned URL for S3 images
  const { getNoteImageUrl, isS3Image } = require("../utils/s3Helper");
  
  if (note.note_picture && isS3Image(note.note_picture)) {
    try {
      const presignedUrl = await getNoteImageUrl(note.note_picture);
      note.dataValues.presignedUrl = presignedUrl;
    } catch (error) {
      console.error("Error generating presigned URL for note", note.id, ":", error);
      note.dataValues.presignedUrl = null;
    }
  }

  res.status(200).json(note);
});

// ✅ Update note (partial updates allowed)
exports.updateNote = [
  asyncHandler(async (req, res) => {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check ownership - Look up the user by their Cognito ID to get the database user ID
    if (!req.user.is_admin) {
      const user = await User.findOne({
        where: { cognitoId: req.user.user_id }
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (note.ownerId !== user.id) {
        return res.status(403).json({ error: "You are not allowed to modify this note" });
      }
    }

    await note.update({
      note_title: req.body.note_title ?? note.note_title,
      note_picture: req.body.note_picture ?? note.note_picture,
      ai_summary: req.body.ai_summary ?? note.ai_summary,
      time: req.body.time ?? note.time,
    });

    res.status(200).json(note);
  }),
];

// ✅ Delete note
exports.deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  if (note.ownerId !== req.user.user_id && !req.user.is_admin) {
    return res.status(403).json({ error: "You are not allowed to delete this note" });
  }

  const { isS3Image } = require("../utils/s3Helper");
  
  // Delete S3 image if it exists
  if (note.note_picture && isS3Image(note.note_picture)) {
    try {
      await deleteNoteImage(note.note_picture);
      console.log("Deleted S3 image:", note.note_picture);
    } catch (error) {
      console.error("Error deleting S3 image:", error);
    }
  }

  await note.destroy();
  res.status(200).json({ message: "Note deleted successfully" });
});

