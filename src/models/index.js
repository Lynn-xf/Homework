const sequelize = require("../utils/mariadb");
const User = require("./user");
const Note = require("./note");
const Comment = require("./comment");

// Associations
User.hasMany(Note, { foreignKey: "ownerId" });
Note.belongsTo(User, { foreignKey: "ownerId" });

Note.hasMany(Comment, { foreignKey: "commentTo", as: "Comments", constraints: false });
Comment.belongsTo(Note, { foreignKey: "commentTo", as: "Note", constraints: false });

// Note: Comments reference User by cognitoId but we don't use Sequelize associations
// for this relationship because cognitoId is not the primary key.
// Instead, we'll handle this manually in controllers with includes.

sequelize.sync({ alter: true }) // auto create/update tables
  .then(() => console.log("✅ Tables synced"))
  .catch(err => console.error(err));

module.exports = { sequelize, User, Note, Comment };

