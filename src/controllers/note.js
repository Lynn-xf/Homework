// const mongoose = require('mongoose');
// const Note = require("../models/note");
let {notes} = require("../utils/data");
const {generateSummaryfromImage} = require("../utils/ollama");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
const { body, query, validationResult } = require("express-validator");

// Validation rules
const noteValidator = () => [
  body('note_title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string'),

  body('note_picture')
    .notEmpty().withMessage('Picture of note is required')
    .isString().withMessage('Picture must be a string'),

  body('ai_summary')
    .optional()
    .isString().withMessage('AI summary must be a string'),

  body('time')
    .notEmpty().withMessage('Time is required')
    .isISO8601().withMessage('Time must be a valid date string'),

  body('owner')
    .notEmpty().withMessage('Owner is required')
    .isString().withMessage('Owner must be a string'), // no longer MongoId
];

exports.getAllNotes = [
    asyncHandler(async (req, res, next) => {
        const {note_title, ai_summary, time, owner} = req.query;

        let filteredNotes = notes;
        if (note_title) {
            filteredNotes = filteredNotes.filter(note => 
                note.note_title.toLowerCase().includes(note_title.toLowerCase())
            );
        }

        if (ai_summary) {
            filteredNotes = filteredNotes.filter(note =>
                note.ai_summary && note.ai_summary.toLowerCase().includes(ai_summary.toLowerCase())
            );
        }
        if (time) {
            filteredNotes = filteredNotes.filter(note =>
                note.time === time
            );
        }
        if (owner) {
            filteredNotes = filteredNotes.filter(note =>
                note.owner === owner
            );
        }
        res.status(200).json(filteredNotes);
    })
];

exports.createNote = [
    noteValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Create new note with ollama AI summary if not provided
        let ai_summary = req.body.ai_summary || null;
        if (!ai_summary && req.body.note_picture) {
            try {
                ai_summary = await generateSummaryfromImage(req.body.note_picture);
            } catch (error) {
                console.error("Error generating AI summary:", error);
                return res.status(500).json({ error: "Failed to generate AI summary" });
            }
        }

        const newNote = {
            id: uuidv4(),
            note_title: req.body.note_title,
            note_picture: req.body.note_picture,
            ai_summary,
            comments: req.body.comments || [],
            time: req.body.time,
            owner: req.body.owner
        };

        notes.push(newNote);
        res.status(201).json(newNote);
    })
];

exports.getNoteById = [
    asyncHandler(async (req, res, next) => {
        const note = notes.find(n => n.id === req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(note);
    })
];

//Update Note
exports.updateNote = [
    noteValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const noteIndex = notes.findIndex(n => n.id === req.params.id);
        if (noteIndex == -1) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const note = notes[noteIndex];

        if (note.owner !== req.user.user_id) {
            return res.status(403).json({ error: 'You are not allowed to modify this note' });
            }
        // Update the note fields
        const updatedNote = {
            ...note,
            note_title: req.body.note_title,
            note_picture: req.body.note_picture,
            ai_summary: req.body.ai_summary || note.ai_summary,
            comments: req.body.comments || note.comments,
            time: req.body.time,
        };
        notes[noteIndex] = updatedNote;
        res.status(200).json(updatedNote);
    })
];

exports.deleteNote = asyncHandler(async (req, res, next) => {
    const noteIndex = notes.findIndex(n => n.id === req.params.id);
    if (noteIndex == -1) {
        return res.status(404).json({ error: 'Note not found' });
    }

    const note = notes[noteIndex];

    if (note.owner !== req.user.user_id) {
        return res.status(403).json({ error: 'You are not allowed to delete this note' });
    }

    notes.splice(noteIndex, 1);
    res.status(200).json({ message: 'Note deleted successfully' });
});
