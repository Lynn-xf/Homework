const { Note, Comment, User } = require("../models");
const { generateSummaryFromImage, generateSummaryFromS3 } = require("../utils/ollama");
const { uploadNoteImage, deleteNoteImage } = require("../utils/s3Helper");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { getNotesCached } = require("../utils/memCached");

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
  try {
    const { note_title, ai_summary, time, owner } = req.query;

    const where = {};
    if (note_title) where.note_title = { [Op.like]: `%${note_title}%` };
    if (ai_summary) where.ai_summary = { [Op.like]: `%${ai_summary}%` };
    if (time) where.time = time;
    if (owner) where.ownerId = owner;

    // Resolve a unified DB user id for both providers
    let dbUserId = null;
    if (!req.user.is_admin) {
      if (req.user.auth_provider === 'google') {
        // For Google flow we already generated an integer id and stored it as req.user.user_id
        dbUserId = req.user.user_id; // numeric id used as PK
      } else {
        // Cognito: look up by cognitoId (which is a string) to get numeric PK userId
        const found = await User.findOne({ where: { cognitoId: req.user.user_id } });
        if (!found) return res.status(404).json({ error: "User not found" });
        dbUserId = found.userId; // internal PK
      }
      where.ownerId = dbUserId;
    }

  // Fetch all comments from ElastiCache first,
  // then fetch from Database if there is no cache
    const notes = await getNotesCached();

    const { getNoteImageUrl, isS3Image } = require("../utils/s3Helper");

    // Build a cache to avoid N + 1 user lookups for comments
    const userCache = new Map();

    for (const note of notes) {
      if (note.note_picture && isS3Image(note.note_picture)) {
        try {
          const presignedUrl = await getNoteImageUrl(note.note_picture);
          //note.dataValues.presignedUrl = presignedUrl;
          note.presignedUrl = presignedUrl;
        } catch (error) {
          console.error("Error generating presigned URL for note", note.id, ":", error.message);
          note.dataValues.presignedUrl = null;
        }
      }

      if (note.Comments && note.Comments.length) {
        for (const comment of note.Comments) {
          const commentByKey = comment.commentBy;
          if (!userCache.has(commentByKey)) {
            // Try Cognito id first
            const u = await User.findOne({
              where: { cognitoId: commentByKey },
              attributes: ["userId", "username", "cognitoId", "is_admin"]
            });
            userCache.set(commentByKey, u || null);
          }
          comment.User = userCache.get(commentByKey); // may be null if not found
        }
      }
    }

    res.status(200).json(notes);
  } catch (err) {
    console.error("getAllNotes error:", err);
    res.status(500).json({
      error: "Internal Error: Unable to fetch notes",
      details: err.message
    });
  }
});

// ✅ Create a new note
exports.createNote = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.files || !req.files.note_picture) {
    return res.status(400).json({ error: "Note picture is required" });
  }

  console.log("🔍 req.user in createNote:", req.user);
  const incomingId = req.user.user_id;
  console.log("🔍 incoming req.user.user_id:", incomingId, "provider:", req.user.auth_provider);
  if (!incomingId) {
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
      // For Google we already ensured (or attempted) creation with integer PK matching user_id
      ownerId = incomingId; // numeric PK directly
    } else {
      // Cognito flow - find numeric internal userId via cognitoId
      const dbUser = await User.findOne({ where: { cognitoId: incomingId } });
      if (!dbUser) {
        return res.status(404).json({ error: "User not found in database" });
      }
      ownerId = dbUser.userId; // internal PK
    }

    const s3UploadResult = await uploadNoteImage(noteFile, incomingId);
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

    res.status(201).json({ 
      message: "Note created successfully", 
      resultS3: responseNote
    });
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

  // Check ownership - Look up the user by their Cognito/Google ID to get the database user ID
  if (!req.user.is_admin) {
    const user = await User.findOne({
      where: { cognitoId: req.user.user_id }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (note.ownerId !== user.id) {
      return res.status(403).json({ error: "You are not allowed to delete this note" });
    }
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

// ✅ Get presigned URL for direct S3 upload
exports.getUploadPresignedUrl = asyncHandler(async (req, res) => {
  const { fileName } = req.body;
  
  if (!fileName) {
    return res.status(400).json({ error: "fileName is required" });
  }

  const userId = req.user.user_id; // unified
  
  try {
    const { generatePresignedUploadUrl } = require("../utils/setupS3");
    const result = await generatePresignedUploadUrl(fileName, userId);
    
    res.status(200).json({
      presignedUrl: result.presignedUrl,
      s3Key: result.s3Key,
      fileName: result.fileName,
      message: "Use this URL to upload directly to S3"
    });
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    res.status(500).json({ error: "Failed to generate presigned upload URL" });
  }
});

// ✅ Get presigned URL for direct S3 download
exports.getDownloadPresignedUrl = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.user_id; // unified
  
  try {
    // Find the note and verify ownership
    const note = await Note.findByPk(noteId);
    
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check ownership or admin access
    const isAdmin = req.user.is_admin;
    if (!isAdmin) {
      const user = await User.findOne({
        where: { cognitoId: req.user.user_id }
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (note.ownerId !== user.id) {
        return res.status(403).json({ error: "You can only access your own notes" });
      }
    }

    const { isS3Image } = require("../utils/s3Helper");
    
    if (!note.note_picture || !isS3Image(note.note_picture)) {
      return res.status(400).json({ error: "Note does not have an S3 image" });
    }

    const { generatePresignedUrl } = require("../utils/setupS3");
    const presignedUrl = await generatePresignedUrl(note.note_picture, 3600); // 1 hour expiry
    
    res.status(200).json({
      presignedUrl,
      s3Key: note.note_picture,
      noteId: note.id,
      noteTitle: note.note_title,
      message: "Use this URL to download directly from S3"
    });
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    res.status(500).json({ error: "Failed to generate presigned download URL" });
  }
});

