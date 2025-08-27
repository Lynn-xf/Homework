const { Note, Comment, User } = require("../models");
const { generateSummaryFromImage } = require("../utils/ollama");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

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
  if (owner) where.owner = owner;

  const notes = await Note.findAll({
    where,
    include: [
      { model: Comment, as: "Comments", attributes: ["id", "description", "createdAt", "commentBy"] },
      { model: User, as: "User", attributes: ["id", "username"] }
    ]
  });

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

  const userId = req.user.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const noteFile = req.files.note_picture;

  // Save to /utils/images/
  const uploadPath = path.join(__dirname, "../utils/images", noteFile.name);
  await noteFile.mv(uploadPath);
  console.log("File uploaded to:", uploadPath);

  // Generate AI summary
  const summary = await generateSummaryFromImage(uploadPath);
  console.log("AI Summary:", summary);

  if (!req.body.note_title) {
    return res.status(400).json({ error: "Note title is required" });
  }

  const newNote = await Note.create({
    note_title: req.body.note_title,
    note_picture: noteFile.name,
    ai_summary: summary,
    time: req.body.time || null,
    owner: userId,
  });

  console.log("req.body:", req.body);
  console.log("req.user:", req.user);

  res.status(201).json(newNote);
});



// ✅ Get note by ID
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findByPk(req.params.id, {
    include: [
      { model: Comment, as: "Comments" },
      { model: User, as: "User", attributes: ["id", "username"] }
    ]
  });

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
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

    if (note.owner !== req.user.user_id) {
      return res.status(403).json({ error: "You are not allowed to modify this note" });
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

  if (note.owner !== req.user.user_id) {
    return res.status(403).json({ error: "You are not allowed to delete this note" });
  }

  await note.destroy();
  res.status(200).json({ message: "Note deleted successfully" });
});

