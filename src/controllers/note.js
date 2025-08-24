const mongoose = require('mongoose');

// const Note = require("../models/note");
const Note = require('../models/note');
const asyncHandler = require("express-async-handler");

const { body, query, validationResult } = require("express-validator");

const noteValidator = () => {
    return [
        body('note_title')
            .notEmpty().withMessage('Title is required')
            .isString().withMessage('Title must be a string'),

        body('note_picture')
            .notEmpty().withMessage('Picture of note is required')
            .isString().withMessage('Picture must be a url string'),
        body('ai_summary')
            .optional()
            .isString().withMessage('AI summary must be a string'),
        body('Time')
            .notEmpty().withMessage('Time is required')
            .isString().withMessage('Time must be a string'),
        body('owner')
            .notEmpty().withMessage('Owner is required')
            .isMongoId().withMessage('Owner must be a valid MongoDB ObjectId')
    ];
}

exports.getAllNotes = [
    query('note_title','ai_summary','Time','owner').optional().trim(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const title = req.query.title || '';
        const aiSummary = req.query.ai_summary || '';
        const time = req.query.Time || '';
        const owner = req.query.owner || '';
        const query = {
            note_title: { $regex: title, $options: 'i' },
            ai_summary: { $regex: aiSummary, $options: 'i' },
            Time: { $regex: time, $options: 'i' },
            owner: owner ? mongoose.Types.ObjectId(owner) : undefined
        };
        const notes = await Note.find(query).populate('owner', 'username').exec();
        res.status(200).json(notes);
    })
];

exports.createNote = [
    noteValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            note_title: req.body.note_title,
            note_picture: req.body.note_picture,
            ai_summary: req.body.ai_summary,
            Time: req.body.Time,
            owner: req.user.user_id,
            Comments: req.body.Comments || []
        });

        await note.save();
        res.status(201).json(note);
    })
];

exports.getNoteById = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id).populate('owner', 'username').exec();
    if (!note) {
        return res.status(404).json({ error: 'Note not found' });
    }

    if (note.owner._id.toString() !== req.user.user_id && !req.user.is_admin) {
        return res.status(403).json({ error: 'You are not allowed to access this note' });
    }

    res.status(200).json(note);
});

exports.updateNote = [
    noteValidator(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = await Note.findById(req.params.id).exec();
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.owner.toString() !== req.user.user_id && !req.user.is_admin) {
            return res.status(403).json({ error: 'You are not allowed to modify this note' });
        }
        note.note_title = req.body.note_title;
        note.note_picture = req.body.note_picture;
        note.ai_summary = req.body.ai_summary;
        note.Time = req.body.Time;
        note.Comments = req.body.Comments || note.Comments;        
        res.status(200).json(note);
    })];

exports.deleteNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id).exec();
    if (!note) {
        return res.status(404).json({ error: 'Note not found' });
    }

    if (note.owner.toString() !== req.user.user_id && !req.user.is_admin) {
        return res.status(403).json({ error: 'You are not allowed to delete this note' });
    }

    await note.remove();
    res.status(204).send();
});
