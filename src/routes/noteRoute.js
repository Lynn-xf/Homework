const express = require('express');
const router = express.Router();
const controller = require('../controllers/note');

const authMiddleware = require('../middlewares/authenticateFlexible');

// Define routes for notes
router.route('/')
    .all(authMiddleware)
    .get(controller.getAllNotes) // Get all notes
    .post(controller.createNote) // Create a new note
    .delete(controller.deleteAllNotes); // Delete all notes

// Define routes for specific note operations
router.route('/:id')
    .all(authMiddleware)
    .get(controller.getNoteById) // Get a note by ID
    .put(controller.updateNote) // Update a note by ID
    .delete(controller.deleteNote); // Delete a note by ID

// S3 Presigned URL endpoints
router.post('/presigned/upload', authMiddleware, controller.getUploadPresignedUrl);
router.get('/presigned/download/:id', authMiddleware, controller.getDownloadPresignedUrl);

module.exports = router;
