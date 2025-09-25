const { Note, Comment, User } = require("../models");
const Memcached = require("memcached");
const util = require("node:util");

const memcachedAddress = "group15-asgn2-memcached.km2jzi.cfg.apse2.cache.amazonaws.com:11211";
const memcached = new Memcached(memcachedAddress);

// Promisify
memcached.aGet = util.promisify(memcached.get);
memcached.aSet = util.promisify(memcached.set);

// Fetch Notes
async function getNotesCached() {
    const cached = await memcached.aGet("all_notes");
    if (cached) {
        console.log("Cached query results found!");
        return JSON.parse(cached);
    }

    console.log("No cache found, fetching from Database...");
    const notes = await Note.findAll({
        include: [
            { model: Comment, as: "Comments", attributes: ["id", "description", "createdAt", "commentBy", "ai_comment", "ai_prompt_comment"] },
            { model: User, as: "Owner", attributes: ["id", "username", "cognitoId"] }
        ]
    });

    // Turn Sequelize results into plain text objects
    const plainNotes = notes.map(n => n.get({ plain: true }));

    await memcached.aSet("all_notes", JSON.stringify(plainNotes), 60); // 60 secs TTL(time to live)
    return plainNotes;
}

// Fetch Comments
async function getCommentsCached() {
    const cached = await memcached.aGet("all_comments");
    if (cached) {
        console.log("Cached query results found!");
        return JSON.parse(cached);
    }

    console.log("No cache found, fetching from Database...");
    const comments = await Comment.findAll({ 
        include: [
            {
                model: Note,
                as: "Note",
                attributes: ["note_title", "id"]
            }
        ]
    });

    // Turn Sequelize results into plain text objects
    const plainComments = comments.map(n => n.get({ plain: true }));

    await memcached.aSet("all_comments", JSON.stringify(plainComments), 60); // 60 secs TTL(time to live)
    return plainComments;
}

module.exports = {
    getCommentsCached,
    getNotesCached
}


