const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    note_title: {
        type: String,
        required: true,
    },
    note_picture: {
        type: String,
        required: true,
    },
    ai_summary: {
        type: String,
        optional: true,
    },
    Comments: [{
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
    }],
    Time: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    }
});

module.exports = mongoose.model("Note", noteSchema);