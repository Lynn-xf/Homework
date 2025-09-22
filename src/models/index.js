const sequelize = require("../utils/mariadb");
const User = require("./user");
const Note = require("./note");
const Comment = require("./comment");

// Define associations
User.hasMany(Note, { foreignKey: "ownerId", as: "Notes" });
Note.belongsTo(User, { foreignKey: "ownerId", as: "Owner" });

Note.hasMany(Comment, { foreignKey: "commentTo", as: "Comments", constraints: false });
Comment.belongsTo(Note, { foreignKey: "commentTo", as: "Note", constraints: false });


sequelize.sync({ alter: true }) // auto create/update tables
  .then(() => console.log("✅ Tables synced"))
  .catch(err => console.error(err));

module.exports = { sequelize, User, Note, Comment };

