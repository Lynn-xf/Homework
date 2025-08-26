const sequelize = require("../utils/mariadb");
const User = require("./user");
const Note = require("./note");
const Comment = require("./comment");

// Associations
User.hasMany(Note, { foreignKey: "ownerId" });
Note.belongsTo(User, { foreignKey: "ownerId" });

Note.hasMany(Comment, { foreignKey: "commentTo" });
Comment.belongsTo(Note, { foreignKey: "commentTo" });

User.hasMany(Comment, { foreignKey: "commentBy" });
Comment.belongsTo(User, { foreignKey: "commentBy" });

sequelize.sync({ alter: true }) // auto create/update tables
  .then(() => console.log("✅ Tables synced"))
  .catch(err => console.error(err));

module.exports = { sequelize, User, Note, Comment };

