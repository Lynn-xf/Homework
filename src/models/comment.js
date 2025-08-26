const { DataTypes } = require("sequelize");
const sequelize = require("../utils/mariadb"); // your Sequelize instance

const Comment = sequelize.define("Comment", {
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
  }
}, {
  tableName: "comments",
  timestamps: true, // adds createdAt, updatedAt
});

// Associations
// Comment belongs to a User (commentBy)
Comment.associate = (models) => {
  Comment.belongsTo(models.User, { foreignKey: "commentBy", as: "author" });
  // Comment belongs to a Note (commentTo)
  Comment.belongsTo(models.Note, { foreignKey: "commentTo", as: "note" });
};

module.exports = Comment;
