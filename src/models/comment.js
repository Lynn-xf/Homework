const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    commentBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    commentTo: {
        type: mongoose.Schema.ObjectId,
        ref: "Note",
        required: true,
    },
    ai_prompt_comment: {
        type: String,
        optional: true,
    },
    ai_comment:{
        type: String,
        optional: true,
    }
});

module.exports = mongoose.model("Comment", commentSchema);