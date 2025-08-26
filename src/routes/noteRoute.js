const express = require('express');
const router = express.Router();
const controller = require('../controllers/note');

const authMiddleware = require('../middlewares/authenticateWithJwt');

// Define routes for notes
router.route('/')
    // .all(authMiddleware)
    .get(controller.getAllNotes) // Get all notes
    .post(authMiddleware, controller.createNote); // Create a new note

// Define routes for specific note operations
router.route('/:id')
    .all(authMiddleware)
    .get(controller.getNoteById) // Get a note by ID
    .put(controller.updateNote) // Update a note by ID
    .delete(controller.deleteNote); // Delete a note by ID

module.exports = router;