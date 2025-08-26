const { Note, Comment, User } = require("../models"); 
const { generateSummaryfromImage } = require("../utils/ollama");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// ✅ Validation rules
const noteValidator = () => [
  body("note_title")
    .notEmpty().withMessage("Title is required")
    .isString().withMessage("Title must be a string"),

  body("note_picture")
    .notEmpty().withMessage("Picture of note is required")
    .isString().withMessage("Picture must be a string"),

  body("ai_summary")
    .optional()
    .isString().withMessage("AI summary must be a string"),

  body("time")
    .optional()
    .isISO8601().withMessage("Time must be a valid date string"),

  body("owner")
    .notEmpty().withMessage("Owner is required")
    .isInt().withMessage("Owner must be a valid user ID"),
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
    include: [{ model: Comment, as: "Comments" }, { model: User, as: "User", attributes: ["id", "username"] }]
  });

  res.status(200).json(notes);
});

// ✅ Create note
exports.createNote = [
  noteValidator(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let ai_summary = req.body.ai_summary || null;
    if (!ai_summary && req.body.note_picture) {
      try {
        ai_summary = await generateSummaryfromImage(req.body.note_picture);
      } catch (error) {
        console.error("Error generating AI summary:", error);
        return res.status(500).json({ error: "Failed to generate AI summary" });
      }
    }

    const newNote = await Note.create({
      note_title: req.body.note_title,
      note_picture: req.body.note_picture,
      ai_summary,
      time: req.body.time,
      owner: req.body.owner
    });

    res.status(201).json(newNote);
  }),
];

// ✅ Get note by ID
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findByPk(req.params.id, {
    include: [{ model: Comment, as: "Comments" }, { model: User, as: "User", attributes: ["id", "username"] }]
  });

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.status(200).json(note);
});

// ✅ Update note
exports.updateNote = [
  noteValidator(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.owner !== req.user.user_id) {
      return res.status(403).json({ error: "You are not allowed to modify this note" });
    }

    await note.update({
      note_title: req.body.note_title,
      note_picture: req.body.note_picture,
      ai_summary: req.body.ai_summary || note.ai_summary,
      time: req.body.time,
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

