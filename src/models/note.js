// models/note.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/mariadb"); // your Sequelize instance

const Note = sequelize.define("Note", {
  note_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note_picture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ai_summary: {
    type: DataTypes.TEXT,
    allowNull: true, // optional
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true, // optional
  }
}, {
  tableName: "notes",
  timestamps: false, // disable createdAt/updatedAt unless you need them
});

module.exports = Note;
