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
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commentTo: { 
    type: DataTypes.INTEGER,
    allowNull: true, 
  }
}, {
  tableName: "comments",
  timestamps: true, // adds createdAt, updatedAt
});

// Associations
// Comment belongs to a User (commentBy)

module.exports = Comment;
