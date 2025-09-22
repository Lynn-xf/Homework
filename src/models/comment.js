const { DataTypes } = require("sequelize");
const sequelize = require("../utils/mariadb"); // your Sequelize instance

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ai_prompt_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ai_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  commentBy: { 
    type: DataTypes.STRING,  // Changed to STRING to store cognitoId
    allowNull: false,
  },
  commentTo: { 
    type: DataTypes.INTEGER,  // This references note.id which is INTEGER
    allowNull: false,  // Changed to false since every comment should reference a note
  }
}, {
  tableName: "comments",
  timestamps: true, // adds createdAt, updatedAt
});

// Associations
// Comment belongs to a User (commentBy)

module.exports = Comment;
